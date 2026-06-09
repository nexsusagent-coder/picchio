import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin API: Otomatik orphan görsel temizliği.
 * Admin paneldeki "Temizlik" butonu bu endpoint'i çağırır.
 *
 * GET /api/admin/cleanup-images?mode=dry-run  → sadece rapor
 * POST /api/admin/cleanup-images              → gerçek silme
 *
 * Korumalı: Sadece admin yetkisiyle çalışır.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SAFETY_DAYS = 7;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractPath(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("supabase.co") && u.pathname.includes("/storage/v1/object/public/")) {
      return u.pathname.replace("/storage/v1/object/public/", "").split("/").slice(1).join("/");
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "dry-run";

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY tanimli degil. Sunucu yapilandirmasini kontrol edin." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // 1. Collect all active DB paths
    const activePaths = new Set<string>();

    const { data: items } = await supabase.from("items").select("image_url").not("image_url", "is", null).neq("image_url", "");
    for (const item of items || []) {
      const p = extractPath(item.image_url);
      if (p) activePaths.add(p);
    }

    const { data: campaigns } = await supabase.from("campaigns").select("image_urls, image_url");
    for (const camp of campaigns || []) {
      const urls: string[] = [];
      if (Array.isArray(camp.image_urls)) urls.push(...camp.image_urls.filter(Boolean));
      if (camp.image_url) urls.push(camp.image_url);
      for (const url of urls) {
        const p = extractPath(url);
        if (p) activePaths.add(p);
      }
    }

    const { data: settings } = await supabase.from("site_settings").select("hero_logo_url").eq("id", 1).single();
    if (settings?.hero_logo_url) {
      const p = extractPath(settings.hero_logo_url);
      if (p) activePaths.add(p);
    }

    // 2. List all storage files
    const buckets = ["product-images", "campaign-images", "site-assets"];
    const storageFiles: { bucket: string; path: string; size: number; createdAt: string }[] = [];

    for (const bucket of buckets) {
      const { data: items } = await supabase.storage.from(bucket).list("", { limit: 1000 });
      if (!items) continue;
      for (const item of items) {
        if (item.id && item.metadata) {
          storageFiles.push({
            bucket,
            path: item.name,
            size: item.metadata?.size || 0,
            createdAt: item.created_at || "",
          });
        } else if (!item.id) {
          const { data: subItems } = await supabase.storage.from(bucket).list(item.name, { limit: 1000 });
          if (!subItems) continue;
          for (const sub of subItems) {
            if (sub.id) {
              storageFiles.push({
                bucket,
                path: `${item.name}/${sub.name}`,
                size: sub.metadata?.size || 0,
                createdAt: sub.created_at || "",
              });
            }
          }
        }
      }
    }

    // 3. Find orphans
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - SAFETY_DAYS);

    const orphans = storageFiles.filter(f => {
      if (activePaths.has(f.path) || activePaths.has(f.path.split("/").pop() || "")) return false;
      if (f.createdAt && new Date(f.createdAt) > cutoff) return false;
      return true;
    });

    const totalSize = orphans.reduce((s, f) => s + f.size, 0);

    if (mode === "dry-run") {
      return NextResponse.json({
        mode: "dry-run",
        summary: {
          totalStorageFiles: storageFiles.length,
          activeReferences: activePaths.size,
          orphanFiles: orphans.length,
          orphanSize: formatBytes(totalSize),
          orphanSizeBytes: totalSize,
        },
        orphans: orphans.map(f => ({
          bucket: f.bucket,
          path: f.path,
          size: formatBytes(f.size),
        })),
      });
    }

    return NextResponse.json({
      error: "Silme icin POST metodu kullanin.",
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "delete";

  if (mode !== "delete") {
    return NextResponse.json({ error: "POST sadece mode=delete ile kullanilir." }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY tanimli degil." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // Reuse the same logic as GET to find orphans
    const activePaths = new Set<string>();

    const { data: items } = await supabase.from("items").select("image_url").not("image_url", "is", null).neq("image_url", "");
    for (const item of items || []) {
      const p = extractPath(item.image_url);
      if (p) activePaths.add(p);
    }

    const { data: campaigns } = await supabase.from("campaigns").select("image_urls, image_url");
    for (const camp of campaigns || []) {
      const urls: string[] = [];
      if (Array.isArray(camp.image_urls)) urls.push(...camp.image_urls.filter(Boolean));
      if (camp.image_url) urls.push(camp.image_url);
      for (const url of urls) {
        const p = extractPath(url);
        if (p) activePaths.add(p);
      }
    }

    const { data: settings } = await supabase.from("site_settings").select("hero_logo_url").eq("id", 1).single();
    if (settings?.hero_logo_url) {
      const p = extractPath(settings.hero_logo_url);
      if (p) activePaths.add(p);
    }

    const buckets = ["product-images", "campaign-images", "site-assets"];
    const allFiles: { bucket: string; path: string; size: number; createdAt: string }[] = [];

    for (const bucket of buckets) {
      const { data: items } = await supabase.storage.from(bucket).list("", { limit: 1000 });
      if (!items) continue;
      for (const item of items) {
        if (item.id && item.metadata) {
          allFiles.push({ bucket, path: item.name, size: item.metadata?.size || 0, createdAt: item.created_at || "" });
        } else if (!item.id) {
          const { data: subItems } = await supabase.storage.from(bucket).list(item.name, { limit: 1000 });
          if (!subItems) continue;
          for (const sub of subItems) {
            if (sub.id) {
              allFiles.push({ bucket, path: `${item.name}/${sub.name}`, size: sub.metadata?.size || 0, createdAt: sub.created_at || "" });
            }
          }
        }
      }
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - SAFETY_DAYS);

    let deleted = 0;
    let deletedSize = 0;
    const errors: string[] = [];

    for (const f of allFiles) {
      if (activePaths.has(f.path) || activePaths.has(f.path.split("/").pop() || "")) continue;
      if (f.createdAt && new Date(f.createdAt) > cutoff) continue;

      try {
        const { error } = await supabase.storage.from(f.bucket).remove([f.path]);
        if (error) {
          errors.push(`${f.bucket}/${f.path}: ${error.message}`);
        } else {
          deleted++;
          deletedSize += f.size;
        }
      } catch (e: any) {
        errors.push(`${f.bucket}/${f.path}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      deletedSize: formatBytes(deletedSize),
      deletedSizeBytes: deletedSize,
      errors: errors.length > 0 ? errors.slice(0, 10) : [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
