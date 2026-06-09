/**
 * SUPABASE STORAGE ORPHAN FILE CLEANUP SCRIPT
 * ============================================
 * Varsayilan: dry-run (hicbir sey silmez, sadece raporlar)
 * Gercak silme: --delete flag'i ile
 *
 * Guvenlik kurallari:
 * - 7 gunden yeni dosyalar SILINMEZ
 * - DB'de aktif referansi olan dosyalar SILINMEZ
 * - Silinenler reports/deleted-images-log.json'a kaydedilir
 *
 * Kullanim:
 *   npx tsx scripts/cleanup-unused-images.ts             (dry-run)
 *   npx tsx scripts/cleanup-unused-images.ts --delete    (gercek silme)
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// ── Env ──────────────────────────────────────────────────────────
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Service role key is strongly recommended for deletion
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "HATA: Supabase baglanti bilgileri .env.local icinde bulunamadi."
  );
  process.exit(1);
}

const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!hasServiceRole) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY tanimli degil. Anon key ile silme islemi RLS politikalari nedeniyle basarisiz olabilir."
  );
  console.warn(
    "   Storage'dan dosya silebilmek icin .env.local dosyasina SUPABASE_SERVICE_ROLE_KEY eklemeniz onerilir.\n"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const isDeleteMode = process.argv.includes("--delete");
const SAFETY_DAYS = 7; // Files newer than this won't be deleted
const SAFETY_CUTOFF = new Date();
SAFETY_CUTOFF.setDate(SAFETY_CUTOFF.getDate() - SAFETY_DAYS);

console.log(`\n🧹 Supabase Storage Temizlik Scripti`);
console.log(`   Mod: ${isDeleteMode ? "🔴 SILME MODU" : "🟢 DRY-RUN (rapor)"}`);
console.log(`   Guvenlik: ${SAFETY_DAYS} gunden yeni dosyalar silinmez (${SAFETY_CUTOFF.toISOString().split("T")[0]} oncesi)\n`);

// ── Helpers ──────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isOlderThan(datestr: string | undefined, cutoff: Date): boolean {
  if (!datestr) return true; // No date = assume old, safe to delete
  try {
    const d = new Date(datestr);
    return d < cutoff;
  } catch {
    return true; // Can't parse = assume old
  }
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ── Types ────────────────────────────────────────────────────────
interface DeletionLog {
  runAt: string;
  mode: "dry-run" | "delete";
  summary: {
    candidatesFound: number;
    candidatesSizeBytes: number;
    candidatesSizeHuman: string;
    actuallyDeleted: number;
    deletedSizeBytes: number;
    deletedSizeHuman: string;
    skippedTooNew: number;
    skippedError: number;
  };
  files: {
    bucket: string;
    path: string;
    size: number;
    createdAt: string;
    status: "would-delete" | "deleted" | "skipped-too-new" | "skipped-error";
    error?: string;
  }[];
}

// ── Core Logic ───────────────────────────────────────────────────

async function getActiveDbPaths(): Promise<Set<string>> {
  const paths = new Set<string>();

  // Helper: extract storage path from Supabase URL
  const extractPath = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("supabase.co") && u.pathname.includes("/storage/v1/object/public/")) {
        return u.pathname.replace("/storage/v1/object/public/", "").split("/").slice(1).join("/");
      }
      return null;
    } catch {
      return null;
    }
  };

  // Items
  console.log("🔍 Aktif urun gorselleri okunuyor...");
  try {
    const { data: items, error } = await supabase
      .from("items")
      .select("image_url")
      .not("image_url", "is", null)
      .neq("image_url", "");
    if (!error && items) {
      for (const item of items) {
        if (item.image_url) {
          const p = extractPath(item.image_url);
          if (p) paths.add(p);
        }
      }
      console.log(`  ✅ ${items.length} urun gorsel referansi.`);
    }
  } catch (e: any) {
    console.warn(`  ⚠️  Items sorgusu basarisiz: ${e.message}`);
  }

  // Campaigns
  console.log("🔍 Aktif kampanya gorselleri okunuyor...");
  try {
    const { data: camps, error } = await supabase
      .from("campaigns")
      .select("image_urls, image_url");
    if (!error && camps) {
      let count = 0;
      for (const camp of camps) {
        const urls: string[] = [];
        if (Array.isArray(camp.image_urls)) urls.push(...camp.image_urls.filter(Boolean));
        if (camp.image_url) urls.push(camp.image_url);
        for (const url of urls) {
          const p = extractPath(url);
          if (p) { paths.add(p); count++; }
        }
      }
      console.log(`  ✅ ${count} kampanya gorsel referansi.`);
    }
  } catch (e: any) {
    console.warn(`  ⚠️  Campaigns sorgusu basarisiz: ${e.message}`);
  }

  // Site settings
  console.log("🔍 Site ayarlari gorselleri okunuyor...");
  try {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("hero_logo_url")
      .eq("id", 1)
      .single();
    if (settings?.hero_logo_url) {
      const p = extractPath(settings.hero_logo_url);
      if (p) paths.add(p);
      console.log(`  ✅ Logo referansi.`);
    }
  } catch {
    // Might not exist yet
  }

  return paths;
}

async function listAllStorageFiles(): Promise<
  { bucket: string; path: string; fullPath: string; size: number; createdAt: string }[]
> {
  const buckets = ["product-images", "campaign-images", "site-assets"];
  const allFiles: { bucket: string; path: string; fullPath: string; size: number; createdAt: string }[] = [];

  for (const bucketName of buckets) {
    try {
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list("", { limit: 1000 });

      if (error) {
        console.warn(`  ⚠️  ${bucketName} listelenemedi: ${error.message}`);
        continue;
      }

      if (!items) continue;

      for (const item of items) {
        if (item.id && item.metadata) {
          // Root-level file
          allFiles.push({
            bucket: bucketName,
            path: item.name,
            fullPath: item.name,
            size: item.metadata?.size || 0,
            createdAt: item.created_at || "",
          });
        } else if (!item.id) {
          // Folder — recurse
          const { data: subItems, error: subError } = await supabase.storage
            .from(bucketName)
            .list(item.name, { limit: 1000 });

          if (subError || !subItems) continue;

          for (const sub of subItems) {
            if (sub.id) {
              const fullPath = `${item.name}/${sub.name}`;
              allFiles.push({
                bucket: bucketName,
                path: fullPath,
                fullPath,
                size: sub.metadata?.size || 0,
                createdAt: sub.created_at || "",
              });
            }
          }
        }
      }
    } catch (e: any) {
      console.warn(`  ⚠️  ${bucketName} hatasi: ${e.message}`);
    }
  }

  return allFiles;
}

async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error(`  ❌ Silinemedi: ${bucket}/${path} — ${error.message}`);
      return false;
    }
    console.log(`  🗑️  Silindi: ${bucket}/${path}`);
    return true;
  } catch (e: any) {
    console.error(`  ❌ Hata: ${bucket}/${path} — ${e.message}`);
    return false;
  }
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  // 1. Get active DB paths
  const activePaths = await getActiveDbPaths();
  console.log(`\n📊 Toplam aktif (kullanilan) benzersiz path: ${activePaths.size}\n`);

  // 2. List all storage files
  console.log("📦 Storage dosyalari taranıyor...");
  const storageFiles = await listAllStorageFiles();
  console.log(`   Toplam storage dosyasi: ${storageFiles.length}\n`);

  // 3. Find candidates (in storage but NOT in active paths)
  const log: DeletionLog = {
    runAt: new Date().toISOString(),
    mode: isDeleteMode ? "delete" : "dry-run",
    summary: {
      candidatesFound: 0,
      candidatesSizeBytes: 0,
      candidatesSizeHuman: "",
      actuallyDeleted: 0,
      deletedSizeBytes: 0,
      deletedSizeHuman: "",
      skippedTooNew: 0,
      skippedError: 0,
    },
    files: [],
  };

  console.log("═".repeat(50));
  console.log(isDeleteMode ? "🔴 SILME ISLEMI BASLIYOR" : "🟢 DRY-RUN — Dosyalar silinmeyecek");
  console.log("═".repeat(50) + "\n");

  for (const file of storageFiles) {
    const isActive = activePaths.has(file.path) || activePaths.has(file.fullPath);

    if (isActive) {
      continue; // Actively used — NEVER delete
    }

    // This file is a candidate for deletion
    log.summary.candidatesFound++;
    log.summary.candidatesSizeBytes += file.size;

    const tooNew = !isOlderThan(file.createdAt, SAFETY_CUTOFF);

    if (tooNew) {
      log.summary.skippedTooNew++;
      log.files.push({
        bucket: file.bucket,
        path: file.path,
        size: file.size,
        createdAt: file.createdAt,
        status: "skipped-too-new",
        error: `${SAFETY_DAYS} gunden yeni, silinmedi`,
      });
      console.log(`  ⏭️  ATLANDI (yeni): ${file.bucket}/${file.path} (${formatBytes(file.size)})`);
      continue;
    }

    if (isDeleteMode) {
      // Real delete
      const deleted = await deleteFile(file.bucket, file.path);
      if (deleted) {
        log.summary.actuallyDeleted++;
        log.summary.deletedSizeBytes += file.size;
        log.files.push({
          bucket: file.bucket,
          path: file.path,
          size: file.size,
          createdAt: file.createdAt,
          status: "deleted",
        });
      } else {
        log.summary.skippedError++;
        log.files.push({
          bucket: file.bucket,
          path: file.path,
          size: file.size,
          createdAt: file.createdAt,
          status: "skipped-error",
          error: "Silme islemi basarisiz",
        });
      }
    } else {
      // Dry-run — just log
      log.files.push({
        bucket: file.bucket,
        path: file.path,
        size: file.size,
        createdAt: file.createdAt,
        status: "would-delete",
      });
      console.log(`  📋 Silinecek: ${file.bucket}/${file.path} (${formatBytes(file.size)})`);
    }
  }

  // 4. Write log
  log.summary.candidatesSizeHuman = formatBytes(log.summary.candidatesSizeBytes);
  log.summary.deletedSizeHuman = formatBytes(log.summary.deletedSizeBytes);

  ensureDir("reports");
  const logPath = join("reports", "deleted-images-log.json");
  writeFileSync(logPath, JSON.stringify(log, null, 2), "utf-8");

  // 5. Summary
  console.log("\n" + "═".repeat(50));
  console.log("📋 SONUC");
  console.log("═".repeat(50));
  console.log(`  Aday dosya sayisi:    ${log.summary.candidatesFound}`);
  console.log(`  Toplam aday boyut:    ${log.summary.candidatesSizeHuman}`);
  console.log(`  Atlanan (yeni):       ${log.summary.skippedTooNew}`);
  if (isDeleteMode) {
    console.log(`  ✅ Silinen:            ${log.summary.actuallyDeleted} (${log.summary.deletedSizeHuman})`);
    console.log(`  ❌ Hata:               ${log.summary.skippedError}`);
  } else {
    console.log(`  💡 Dry-run — hicbir dosya silinmedi.`);
    console.log(`     Silmek icin: npx tsx scripts/cleanup-unused-images.ts --delete`);
  }
  console.log(`  📝 Log:                ${logPath}`);
  console.log("═".repeat(50) + "\n");

  if (!isDeleteMode && log.summary.candidatesFound > 0) {
    console.log("⚠️  BU ISLEMI GERCEKLESTIRMEK ICIN:");
    console.log("   1. Yukaridaki listeyi dikkatlice inceleyin.");
    console.log("   2. Emin olduktan sonra:");
    console.log("      npm run cleanup:images:delete");
    console.log("   3. Silinen dosyalar reports/deleted-images-log.json'a kaydedilecektir.\n");
  }
}

main().catch((err) => {
  console.error("\n❌ Beklenmeyen hata:", err);
  process.exit(1);
});
