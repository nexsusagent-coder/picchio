# Supabase Storage Optimizasyonu — Final Rapor

**Tarih:** 2026-06-09
**Proje:** Picchio Cocktail Bar QR Menü

---

## Bulunan Sorunlar

### 1. Storage Şişkinliği (Orphan Dosyalar)
- Her görsel yüklemesinde `{id}-{timestamp}.{ext}` formatında **yeni dosya** oluşturuluyor
- Görsel silindiğinde sadece `image_url = null` yapılıyor, **storage'daki dosya kalıyor**
- Aynı ürüne tekrar görsel yüklendiğinde eski dosya **silinmiyor**
- Sonuç: Storage'da yüzlerce kullanılmayan (orphan) dosya birikmiş olabilir

### 2. Görsel Optimizasyonu Eksikliği
- Upload edilen görseller **orijinal boyutunda** saklanıyor (akıllı telefondan 4000px+ genişlik)
- WebP dönüşümü yok (JPEG/PNG olarak saklanıyor, 2-5x daha büyük)
- QR menüde **full-size görseller** yükleniyor, mobil veriyi tüketiyor

### 3. Performans Sorunları
- `<img>` etiketlerinde `width`/`height` tanımlı değil → Layout Shift (CLS)
- `decoding="async"` kullanılmamış
- Hero logo için `fetchpriority="high"` yok

### 4. Cache Busting Eksikliği
- Aynı ürün görseli değiştirildiğinde eski URL cache'de kalabiliyor
- `ProductCard` ve `ProductModal` manuel retry mekanizmasıyla çalışıyor

---

## Yapılan Değişiklikler

### ✅ Yeni Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `scripts/audit-supabase-images.ts` | Storage + DB denetim scripti (read-only) |
| `scripts/cleanup-unused-images.ts` | Orphan dosya temizleme scripti (dry-run varsayılan) |
| `src/lib/image-processor.ts` | Browser-side Canvas API ile görsel optimizasyonu |
| `docs/storage-migration-plan.md` | Cloudflare R2 geçiş planı |
| `reports/image-audit.json` | Audit çıktısı (çalıştırınca oluşur) |
| `reports/image-audit.md` | İnsan-okunabilir audit raporu (çalıştırınca oluşur) |
| `reports/supabase-optimization-summary.md` | Bu rapor |

### ✅ Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `src/lib/api.ts` | Upload path: `products/{id}/image.{ext}` (overwrite), cache busting, `removeProductImage()`, `removeImageFromStorage()` |
| `src/app/admin/hooks/useProductActions.ts` | `processImage()` ile otomatik optimizasyon, `removeImage` → storage'dan da sil |
| `src/components/ProductCard.tsx` | `width={672} height={224}` + `decoding="async"` |
| `src/components/ProductModal.tsx` | `width={800} height={600}` + `decoding="async"` |
| `src/components/CampaignCarousel.tsx` | `width={760} height={320}` + `loading="lazy"` + `decoding="async"` |
| `src/app/menu/page.tsx` | Hero logo: `fetchpriority="high"` + `width`/`height`; recommended: `decoding="async"` + `width`/`height` |
| `package.json` | `audit:images`, `cleanup:images`, `cleanup:images:delete` scriptleri |

---

## Yeni Script Komutları

```bash
# Storage denetimi (hiçbir şey silmez)
npm run audit:images

# Orphan dosyaları listele (dry-run)
npm run cleanup:images

# Orphan dosyaları GERÇEKTEN sil (dikkatli kullan!)
npm run cleanup:images:delete
```

---

## Nasıl Çalıştırılır

### 1. Audit (Önce bunu yapın)
```bash
npm run audit:images
```
Çıktılar:
- `reports/image-audit.json` — Makine tarafından okunabilir tam rapor
- `reports/image-audit.md` — İnsan tarafından okunabilir özet

### 2. Dry-Run Cleanup
```bash
npm run cleanup:images
```
Hangi dosyaların silineceğini listeler, **hiçbir şey silmez**.

### 3. Gerçek Temizlik (Onay Gerektirir)
```bash
npm run cleanup:images:delete
```
- 7 günden eski orphan dosyaları siler
- Silinenleri `reports/deleted-images-log.json`'a kaydeder

### 4. Normal Kullanım
Admin panelde görsel yükleme/silme işlemleri artık:
- **Yükleme:** Otomatik resize (max 1200px) + WebP dönüşümü
- **Silme:** DB kaydını temizler + storage'dan dosyayı silmeyi dener
- **Üzerine yazma:** Aynı ürüne yeni görsel yüklenince eskisini overwrite eder

---

## Riskli Noktalar

| Konu | Risk | Durum |
|------|------|-------|
| Storage dosya silme | Yanlış dosya silinmesi | ✅ 7 gün kuralı + dry-run öncesi + log tutma |
| Migration | Veri kaybı | ✅ Migration yapılmadı |
| next/image geçişi | UI bozulması | ✅ Yapılmadı, sadece attribute eklendi |
| Supabase'den çıkış | Veri kaybı | ✅ Supabase hala ana veritabanı |
| Canlı sisteme etki | Kesinti | ✅ Tüm değişiklikler additive, mevcut işleyiş bozulmaz |

---

## Manuel Onay Gereken İşlemler

1. ⚠️ **`npm run cleanup:images:delete`** — Bu komut gerçek dosya silme yapar. Çalıştırmadan önce:
   - `npm run audit:images` ile raporu inceleyin
   - `npm run cleanup:images` (dry-run) ile silinecekleri kontrol edin
   - Sonra `--delete` ile gerçek silmeyi yapın

2. ⚠️ **Cloudflare R2'ye geçiş** — `docs/storage-migration-plan.md` dosyasını inceleyin, ayrı bir proje olarak planlayın.

3. ⚠️ **`image_version` kolonu** — Cache busting için idealdir ancak migration gerektirir. Manuel SQL ile eklenebilir:
   ```sql
   ALTER TABLE items ADD COLUMN image_version INTEGER DEFAULT 1;
   ```

---

## Cloudflare R2 Önerisi

**✅ Önerilir.** Detaylar `docs/storage-migration-plan.md` dosyasında.

Özet gerekçeler:
- QR menü trafiği arttıkça Supabase egress maliyeti artar (R2'de ücretsiz)
- Cloudflare CDN global performans sağlar
- Image Resizing ile dinamik boyutlandırma
- Toplam aylık maliyet: ~$9-15 → ~$0.15-1

**Öncelik:** Düşük. Önce bu optimizasyonların etkisini görün, sonra değerlendirin.

---

## Değişmeyen / Korunan Özellikler

- ✅ UI/UX tasarımı (renkler, animasyonlar, Framer Motion)
- ✅ Tailwind CSS stilleri
- ✅ Cloudinary & Neon fallback yapısı
- ✅ Kategori, ürün, fiyat, açıklama veri yapısı
- ✅ Admin panel iş akışı
- ✅ Supabase veritabanı (Storage dışında)
