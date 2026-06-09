/**
 * SUPABASE STORAGE IMAGE AUDIT SCRIPT
 * ====================================
 * Read-only — hicbir dosyayi silmez, sadece rapor uretir.
 *
 * Kullanim:
 *   npx tsx scripts/audit-supabase-images.ts
 *
 * Cikti:
 *   reports/image-audit.json  — makine-okunabilir tam rapor
 *   reports/image-audit.md    — insan-okunabilir ozet rapor
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// ── Env ──────────────────────────────────────────────────────────
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "HATA: Supabase baglanti bilgileri .env.local icinde bulunamadi."
  );
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY (veya SUPABASE_SERVICE_ROLE_KEY) tanimli olmali."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Neon baglantisi (opsiyonel)
const DATABASE_URL = process.env.DATABASE_URL;
let neonSql: any = null;
if (DATABASE_URL) {
  try {
    const { neon } = require("@neondatabase/serverless");
    neonSql = neon(DATABASE_URL);
    console.log("✅ Neon baglantisi kuruldu.");
  } catch {
    console.log("ℹ️  Neon kullanilamiyor, sadece Supabase uzerinden sorgu yapilacak.");
  }
}

// ── Types ────────────────────────────────────────────────────────
interface StorageFile {
  bucket: string;
  path: string;
  fullPath: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  publicUrl: string;
}

interface ImageRef {
  url: string;
  source: string; // "items", "campaigns", "site_settings"
  entityId: string;
  entityName: string;
  bucket: string | null;
  path: string | null;
}

interface OrphanFile {
  bucket: string;
  path: string;
  size: number;
  createdAt: string;
  publicUrl: string;
}

interface BrokenRef {
  url: string;
  source: string;
  entityId: string;
  entityName: string;
}

interface AuditReport {
  generatedAt: string;
  summary: {
    totalStorageFiles: number;
    totalStorageSizeBytes: number;
    totalStorageSizeHuman: string;
    totalDbRefs: number;
    orphanFiles: number;
    orphanSizeBytes: number;
    orphanSizeHuman: string;
    brokenRefs: number;
    duplicateRefs: number;
  };
  buckets: {
    name: string;
    fileCount: number;
    totalSize: number;
    totalSizeHuman: string;
  }[];
  orphanFiles: OrphanFile[];
  brokenReferences: BrokenRef[];
  duplicateReferences: {
    path: string;
    count: number;
    urls: string[];
  }[];
  allStorageFiles: StorageFile[];
  allDbReferences: ImageRef[];
}

// ── Helpers ──────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractPathFromUrl(url: string): { bucket: string | null; path: string | null } {
  try {
    const u = new URL(url);
    // Supabase storage URL pattern: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    if (u.hostname.includes("supabase.co") && u.pathname.includes("/storage/v1/object/public/")) {
      const parts = u.pathname.replace("/storage/v1/object/public/", "").split("/");
      const bucket = parts[0];
      const path = parts.slice(1).join("/");
      return { bucket, path };
    }
    // Cloudinary URL pattern
    if (u.hostname.includes("cloudinary.com")) {
      return { bucket: "cloudinary", path: u.pathname };
    }
    return { bucket: "external", path: u.pathname };
  } catch {
    // May be a relative path like /cocktail-star.png (local fallback)
    if (url.startsWith("/")) {
      return { bucket: "local", path: url };
    }
    return { bucket: null, path: url };
  }
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ── Data Collection ──────────────────────────────────────────────

async function fetchAllStorageFiles(): Promise<StorageFile[]> {
  const buckets = ["product-images", "campaign-images", "site-assets"];
  const allFiles: StorageFile[] = [];

  for (const bucketName of buckets) {
    console.log(`📦 Storage bucket taranıyor: ${bucketName}...`);
    try {
      // List all files recursively
      const { data: rootItems, error: rootError } = await supabase.storage
        .from(bucketName)
        .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

      if (rootError) {
        console.error(`  ⚠️  Bucket listelenemedi: ${rootError.message}`);
        continue;
      }

      if (!rootItems || rootItems.length === 0) {
        console.log(`  📭 Bos bucket.`);
        continue;
      }

      // Process items — they may be files or folders
      for (const item of rootItems) {
        if (item.id === null || item.metadata === undefined) {
          // It's a folder — recurse
          const { data: subItems, error: subError } = await supabase.storage
            .from(bucketName)
            .list(item.name, { limit: 1000 });

          if (subError) {
            console.error(`  ⚠️  Klasor listelenemedi: ${item.name} - ${subError.message}`);
            continue;
          }

          if (subItems) {
            for (const sub of subItems) {
              if (sub.id) {
                const fullPath = `${item.name}/${sub.name}`;
                const { data: urlData } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(fullPath);

                allFiles.push({
                  bucket: bucketName,
                  path: fullPath,
                  fullPath,
                  size: sub.metadata?.size || 0,
                  createdAt: sub.created_at || "",
                  updatedAt: sub.updated_at || "",
                  publicUrl: urlData?.publicUrl || "",
                });
              }
            }
          }
        } else {
          // It's a file at root level
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(item.name);

          allFiles.push({
            bucket: bucketName,
            path: item.name,
            fullPath: item.name,
            size: item.metadata?.size || 0,
            createdAt: item.created_at || "",
            updatedAt: item.updated_at || "",
            publicUrl: urlData?.publicUrl || "",
          });
        }
      }
      console.log(`  ✅ ${allFiles.filter(f => f.bucket === bucketName).length} dosya bulundu.`);
    } catch (err: any) {
      console.error(`  ❌ Beklenmeyen hata (${bucketName}):`, err.message);
    }
  }

  return allFiles;
}

async function fetchAllDbReferences(): Promise<ImageRef[]> {
  const refs: ImageRef[] = [];

  // ── Items (products) ─────────────────────────────────────────
  console.log("🔍 Veritabanından urun gorselleri okunuyor...");
  let items: any[] = [];

  // Try Neon first
  if (neonSql) {
    try {
      items = await neonSql`SELECT id, name, image_url FROM items WHERE image_url IS NOT NULL AND image_url != ''`;
      console.log(`  ✅ Neon: ${items.length} urun gorseli bulundu.`);
    } catch (e: any) {
      console.warn(`  ⚠️  Neon sorgusu basarisiz: ${e.message}`);
    }
  }

  // Fallback to Supabase
  if (items.length === 0) {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("id, name, image_url")
        .not("image_url", "is", null)
        .neq("image_url", "");
      if (error) throw error;
      items = data || [];
      console.log(`  ✅ Supabase: ${items.length} urun gorseli bulundu.`);
    } catch (e: any) {
      console.warn(`  ⚠️  Supabase items sorgusu basarisiz: ${e.message}`);
    }
  }

  for (const item of items) {
    if (item.image_url) {
      const { bucket, path } = extractPathFromUrl(item.image_url);
      refs.push({
        url: item.image_url,
        source: "items",
        entityId: item.id,
        entityName: item.name || item.id,
        bucket,
        path,
      });
    }
  }

  // ── Campaigns ─────────────────────────────────────────────────
  console.log("🔍 Veritabanından kampanya gorselleri okunuyor...");
  let campaigns: any[] = [];

  if (neonSql) {
    try {
      campaigns = await neonSql`SELECT id, title, image_urls, image_url FROM campaigns`;
      console.log(`  ✅ Neon: ${campaigns.length} kampanya bulundu.`);
    } catch (e: any) {
      console.warn(`  ⚠️  Neon campaigns sorgusu basarisiz: ${e.message}`);
    }
  }

  if (campaigns.length === 0) {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, image_urls, image_url");
      if (error) throw error;
      campaigns = data || [];
      console.log(`  ✅ Supabase: ${campaigns.length} kampanya bulundu.`);
    } catch (e: any) {
      console.warn(`  ⚠️  Supabase campaigns sorgusu basarisiz: ${e.message}`);
    }
  }

  for (const camp of campaigns) {
    const urls: string[] = [];
    if (Array.isArray(camp.image_urls)) {
      urls.push(...camp.image_urls.filter(Boolean));
    }
    if (camp.image_url && typeof camp.image_url === "string") {
      urls.push(camp.image_url);
    }

    for (const url of urls) {
      const { bucket, path } = extractPathFromUrl(url);
      refs.push({
        url,
        source: "campaigns",
        entityId: camp.id,
        entityName: camp.title || camp.id,
        bucket,
        path,
      });
    }
  }

  // ── Site Settings ─────────────────────────────────────────────
  console.log("🔍 Veritabanından site ayarlari gorselleri okunuyor...");
  let settings: any = null;

  if (neonSql) {
    try {
      const rows = await neonSql`SELECT hero_logo_url FROM site_settings WHERE id = 1`;
      if (rows && rows.length > 0) settings = rows[0];
      console.log(`  ✅ Neon: site ayarlari okundu.`);
    } catch (e: any) {
      console.warn(`  ⚠️  Neon site_settings sorgusu basarisiz: ${e.message}`);
    }
  }

  if (!settings) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("hero_logo_url")
        .eq("id", 1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      settings = data;
      console.log(`  ✅ Supabase: site ayarlari okundu.`);
    } catch (e: any) {
      console.warn(`  ⚠️  Supabase site_settings sorgusu basarisiz: ${e.message}`);
    }
  }

  if (settings?.hero_logo_url) {
    const { bucket, path } = extractPathFromUrl(settings.hero_logo_url);
    refs.push({
      url: settings.hero_logo_url,
      source: "site_settings",
      entityId: "site-logo",
      entityName: "Hero Logo",
      bucket,
      path,
    });
  }

  return refs;
}

// ── Analysis ─────────────────────────────────────────────────────

function buildReport(storageFiles: StorageFile[], dbRefs: ImageRef[]): AuditReport {
  // Find orphans: files in storage NOT referenced in DB
  const dbPaths = new Set<string>();
  for (const ref of dbRefs) {
    if (ref.path) {
      dbPaths.add(ref.path);
      // Also try with decoded URI
      try {
        dbPaths.add(decodeURIComponent(ref.path));
      } catch {}
    }
  }

  const orphanFiles: OrphanFile[] = [];
  for (const file of storageFiles) {
    const isReferenced =
      dbPaths.has(file.path) ||
      dbPaths.has(file.fullPath) ||
      // Check if any URL contains this file's path
      [...dbPaths].some((p) => file.path.endsWith(p) || p.endsWith(file.path));

    if (!isReferenced) {
      orphanFiles.push({
        bucket: file.bucket,
        path: file.path,
        size: file.size,
        createdAt: file.createdAt,
        publicUrl: file.publicUrl,
      });
    }
  }

  // Find broken refs: DB references NOT in storage
  const storagePathSet = new Set<string>();
  for (const file of storageFiles) {
    storagePathSet.add(file.path);
    storagePathSet.add(file.fullPath);
  }

  const brokenRefs: BrokenRef[] = [];
  for (const ref of dbRefs) {
    if (!ref.bucket || !ref.path) continue;
    if (ref.bucket === "local" || ref.bucket === "external" || ref.bucket === "cloudinary") continue;

    const isInStorage =
      storagePathSet.has(ref.path) ||
      [...storagePathSet].some((p) => ref.path!.endsWith(p) || p.endsWith(ref.path!));

    if (!isInStorage) {
      brokenRefs.push({
        url: ref.url,
        source: ref.source,
        entityId: ref.entityId,
        entityName: ref.entityName,
      });
    }
  }

  // Find duplicates: same path referenced multiple times
  const pathCounts = new Map<string, { count: number; urls: string[] }>();
  for (const ref of dbRefs) {
    if (!ref.path) continue;
    const key = ref.path;
    const existing = pathCounts.get(key);
    if (existing) {
      existing.count++;
      if (!existing.urls.includes(ref.url)) existing.urls.push(ref.url);
    } else {
      pathCounts.set(key, { count: 1, urls: [ref.url] });
    }
  }

  const duplicateRefs = [...pathCounts.entries()]
    .filter(([_, v]) => v.count > 1)
    .map(([path, v]) => ({ path, count: v.count, urls: v.urls }));

  // Bucket summaries
  const bucketMap = new Map<string, { count: number; size: number }>();
  for (const file of storageFiles) {
    const b = bucketMap.get(file.bucket) || { count: 0, size: 0 };
    b.count++;
    b.size += file.size;
    bucketMap.set(file.bucket, b);
  }

  // Summary
  const totalStorageSize = storageFiles.reduce((s, f) => s + f.size, 0);
  const totalOrphanSize = orphanFiles.reduce((s, f) => s + f.size, 0);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalStorageFiles: storageFiles.length,
      totalStorageSizeBytes: totalStorageSize,
      totalStorageSizeHuman: formatBytes(totalStorageSize),
      totalDbRefs: dbRefs.length,
      orphanFiles: orphanFiles.length,
      orphanSizeBytes: totalOrphanSize,
      orphanSizeHuman: formatBytes(totalOrphanSize),
      brokenRefs: brokenRefs.length,
      duplicateRefs: duplicateRefs.length,
    },
    buckets: [...bucketMap.entries()].map(([name, info]) => ({
      name,
      fileCount: info.count,
      totalSize: info.size,
      totalSizeHuman: formatBytes(info.size),
    })),
    orphanFiles,
    brokenReferences: brokenRefs,
    duplicateReferences: duplicateRefs,
    allStorageFiles: storageFiles,
    allDbReferences: dbRefs,
  };
}

function generateMarkdownReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push("# 📊 Supabase Storage Görsel Denetim Raporu");
  lines.push("");
  lines.push(`**Oluşturulma:** ${new Date(report.generatedAt).toLocaleString("tr-TR")}`);
  lines.push("");

  lines.push("## 🚦 Özet");
  lines.push("");
  lines.push("| Metrik | Değer |");
  lines.push("|--------|-------|");
  lines.push(`| Storage'daki toplam dosya | ${report.summary.totalStorageFiles} |`);
  lines.push(`| Toplam storage kullanımı | ${report.summary.totalStorageSizeHuman} |`);
  lines.push(`| DB'deki toplam görsel referansı | ${report.summary.totalDbRefs} |`);
  lines.push(`| **🟡 Orphan (kullanılmayan) dosya** | **${report.summary.orphanFiles}** (${report.summary.orphanSizeHuman}) |`);
  lines.push(`| **🔴 Kırık referans (DB'de var, storage'da yok)** | **${report.summary.brokenRefs}** |`);
  lines.push(`| 🔵 Aynı path'e çoklu referans | ${report.summary.duplicateRefs} |`);
  lines.push("");

  lines.push("## 📦 Bucket Özeti");
  lines.push("");
  lines.push("| Bucket | Dosya Sayısı | Toplam Boyut |");
  lines.push("|--------|-------------|-------------|");
  for (const b of report.buckets) {
    lines.push(`| \`${b.name}\` | ${b.fileCount} | ${b.totalSizeHuman} |`);
  }
  lines.push("");

  if (report.orphanFiles.length > 0) {
    lines.push("## 🟡 Kullanılmayan (Orphan) Dosyalar");
    lines.push("");
    lines.push(`> Bu dosyalar Storage'da mevcut ancak hiçbir ürün/kampanya/ayar tarafından kullanılmıyor.`);
    lines.push(`> Temizlemek için: \`npm run cleanup:images\` (dry-run) veya \`npm run cleanup:images:delete\` (gerçek silme)`);
    lines.push("");
    lines.push("| Bucket | Dosya Yolu | Boyut | Oluşturulma |");
    lines.push("|--------|-----------|-------|------------|");
    for (const f of report.orphanFiles.slice(0, 50)) {
      lines.push(
        `| \`${f.bucket}\` | \`${f.path}\` | ${formatBytes(f.size)} | ${f.createdAt || "?"} |`
      );
    }
    if (report.orphanFiles.length > 50) {
      lines.push(`| ... | *${report.orphanFiles.length - 50} dosya daha* | | |`);
    }
    lines.push("");
  }

  if (report.brokenReferences.length > 0) {
    lines.push("## 🔴 Kırık Referanslar");
    lines.push("");
    lines.push("> Bu görseller DB'de kayıtlı ancak Storage'da dosya bulunamadı. Görseller çalışmayacaktır.");
    lines.push("");
    lines.push("| Kaynak | Entity | URL |");
    lines.push("|--------|--------|-----|");
    for (const r of report.brokenReferences.slice(0, 30)) {
      lines.push(
        `| ${r.source} | ${r.entityName} (\`${r.entityId}\`) | \`${r.url.substring(0, 80)}...\` |`
      );
    }
    if (report.brokenReferences.length > 30) {
      lines.push(`| ... | *${report.brokenReferences.length - 30} kırık referans daha* | |`);
    }
    lines.push("");
  }

  if (report.duplicateReferences.length > 0) {
    lines.push("## 🔵 Çoklu Referanslar (Aynı Dosyaya)");
    lines.push("");
    lines.push("| Path | Referans Sayısı |");
    lines.push("|------|-----------------|");
    for (const d of report.duplicateReferences) {
      lines.push(`| \`${d.path}\` | ${d.count} |`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## 📋 Önerilen Aksiyonlar");
  lines.push("");
  lines.push("1. **Orphan dosyaları temizle:** `npm run cleanup:images:delete`");
  lines.push("2. **Kırık referansları düzelt:** İlgili ürünlere yeni görsel yükle veya `image_url` değerini temizle.");
  lines.push("3. **Görsel optimizasyonu:** Yeni yüklemelerde otomatik resize/WebP dönüşümü aktif.");
  lines.push("4. **Storage maliyeti:** Orphan dosyalar temizlenirse ~" + formatBytes(report.summary.orphanSizeBytes) + " alan boşalır.");
  lines.push("");

  return lines.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🔬 Supabase Storage Görsel Denetimi Başlıyor...\n");

  // 1. Fetch storage files
  console.log("═".repeat(50));
  const storageFiles = await fetchAllStorageFiles();
  console.log(`\n📦 Toplam storage dosyasi: ${storageFiles.length}\n`);

  // 2. Fetch DB references
  console.log("═".repeat(50));
  const dbRefs = await fetchAllDbReferences();
  console.log(`\n🔗 Toplam DB referansi: ${dbRefs.length}\n`);

  // 3. Build report
  console.log("═".repeat(50));
  console.log("📊 Rapor olusturuluyor...\n");
  const report = buildReport(storageFiles, dbRefs);

  // 4. Write outputs
  ensureDir("reports");

  // JSON
  const jsonPath = join("reports", "image-audit.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`✅ JSON rapor: ${jsonPath}`);

  // Markdown
  const md = generateMarkdownReport(report);
  const mdPath = join("reports", "image-audit.md");
  writeFileSync(mdPath, md, "utf-8");
  console.log(`✅ Markdown rapor: ${mdPath}`);

  // Console summary
  console.log("\n" + "═".repeat(50));
  console.log("📋 ÖZET");
  console.log("═".repeat(50));
  console.log(`  Storage dosyalari:       ${report.summary.totalStorageFiles} (${report.summary.totalStorageSizeHuman})`);
  console.log(`  DB gorsel referanslari:  ${report.summary.totalDbRefs}`);
  console.log(`  🟡 Orphan dosyalar:       ${report.summary.orphanFiles} (${report.summary.orphanSizeHuman})`);
  console.log(`  🔴 Kirik referanslar:     ${report.summary.brokenRefs}`);
  console.log(`  🔵 Coklu referanslar:     ${report.summary.duplicateRefs}`);
  console.log("═".repeat(50));

  if (report.summary.orphanFiles > 0) {
    console.log(`\n💡 Kullanilmayan ${report.summary.orphanFiles} dosyayi temizlemek icin:`);
    console.log(`   npm run cleanup:images          (dry-run — ne silinecegini gor)`);
    console.log(`   npm run cleanup:images:delete   (gercek silme)`);
  }

  if (report.summary.brokenRefs > 0) {
    console.log(`\n⚠️  ${report.summary.brokenRefs} kirik gorsel referansi var. Bu urunlerde gorsel goruntulenemez.`);
    console.log(`   Detaylar icin: reports/image-audit.md`);
  }

  console.log("\n✅ Denetim tamamlandi.\n");
}

main().catch((err) => {
  console.error("\n❌ Beklenmeyen hata:", err);
  process.exit(1);
});
