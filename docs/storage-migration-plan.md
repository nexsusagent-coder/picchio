# Cloudflare R2 Geçiş Planı

## Mevcut Durum

### Supabase Storage Kullanımı

| Bucket | Amaç | Tahmini Dosya Sayısı |
|--------|------|---------------------|
| `product-images` | Ürün görselleri | Değişken (ürün başına 1+) |
| `campaign-images` | Kampanya görselleri | Kampanya başına en fazla 5 |
| `site-assets` | Site varlıkları (logo) | 1-2 |

### Mevcut Upload Akışı
1. Admin panelde dosya seçilir
2. `api.uploadProductImage()` çağrılır
3. Önce Cloudinary denenir (varsa), sonra Supabase Storage
4. URL veritabanına `image_url` olarak kaydedilir
5. Frontend'de doğrudan `<img src="{url}">` ile gösterilir

### URL Formatı
- Supabase: `https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}`
- Cloudinary: `https://res.cloudinary.com/{cloud}/image/upload/v{version}/picchio/{folder}/{id}.webp`

---

## R2'ye Geçiş Adımları

### 1. Cloudflare R2 Kurulumu
```bash
# R2 bucket oluştur
wrangler r2 bucket create picchio-images

# Public access için custom domain bağla
# Örn: cdn.picchiococktail.com → R2 bucket
```

### 2. Environment Variables
```env
# .env.local'a eklenecek
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_ACCOUNT_ID=xxx
R2_BUCKET_NAME=picchio-images
R2_PUBLIC_URL=https://cdn.picchiococktail.com
NEXT_PUBLIC_IMAGE_CDN=https://cdn.picchiococktail.com
```

### 3. Kod Değişiklikleri

#### `src/lib/r2.ts` (Yeni)
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(file: File, key: string, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}
```

#### `src/lib/api.ts` Değişiklikleri
- `uploadProductImage()` → Önce R2'ye upload et, URL döndür
- `uploadCampaignImage()` → Aynı
- `uploadSiteAsset()` → Aynı
- Supabase Storage kodları backup olarak kalsın (Cloudinary gibi)

#### Helper Fonksiyon
```typescript
// src/lib/image-url.ts
export function getImageUrl(path: string): string {
  // Sadece path sakla, URL'i runtime'da oluştur
  return `${process.env.NEXT_PUBLIC_IMAGE_CDN}/${path}`;
}
```

### 4. Database'de Neler Değişecek?
- **Değişiklik YOK.** `image_url` kolonu aynı kalacak, sadece URL'ler artık R2 domain'ini gösterecek.
- Migration gerekmez — mevcut Supabase URL'leri çalışmaya devam eder.
- Yeni upload'lar R2'ye gider, eskiler Supabase'de kalır.
- 30 gün sonra eski Supabase dosyaları temizlenir.

### 5. Taşıma İşlemi
1. Audit script ile mevcut tüm dosyaların listesini al
2. R2 bucket'a tüm aktif dosyaları kopyala (rclone veya özel script)
3. Database'deki URL'leri toplu güncelle (Supabase → R2 domain)
4. 1 hafta bekle, sorun yoksa Supabase Storage bucket'larını boşalt

---

## CDN Kullanımı

Cloudflare R2 + Cloudflare CDN otomatik olarak:
- Global edge caching
- Image optimization (Cloudflare Polish / Image Resizing)
- DDoS koruması
- Ücretsiz egress (Supabase'den farklı olarak)

### Cloudflare Image Resizing (Opsiyonel)
```
https://cdn.picchiococktail.com/products/item-123/image.webp?width=400
https://cdn.picchiococktail.com/products/item-123/image.webp?width=1200
```
Bu sayede thumb/menu/original versiyonları tek bir dosyadan dinamik olarak üretilir.

---

## Riskler

| Risk | Şiddet | Önlem |
|------|--------|-------|
| R2'ye geçiş sırasında görsellerin kırılması | Yüksek | Eski Supabase URL'lerini 30 gün koru, kademeli geçiş yap |
| API key sızıntısı | Yüksek | R2 key'leri sunucu tarafında tut, client'a verme |
| Upload sırasında hata | Orta | Try-catch + Supabase fallback |
| Maliyet artışı | Düşük | R2 egress ücretsiz, 10GB free tier |
| Mevcut görsellerin taşınamaması | Orta | rclone ile toplu taşıma, retry mekanizması |

---

## Geri Dönüş Planı
1. R2'de sorun çıkarsa `NEXT_PUBLIC_IMAGE_CDN` env değerini eski Supabase URL'sine çevir
2. `api.ts`'te R2 kodunu `isR2Available()` kontrolüne bağla — false ise Supabase'e dön
3. Veritabanında URL değişikliği yapılmadıysa (sadece yeni upload'lar R2) geri dönüş anında

---

## Maliyet Karşılaştırması

| | Supabase Storage | Cloudflare R2 |
|---|---|---|
| Storage (10GB) | $0.021/GB ≈ $0.21/ay | $0.015/GB ≈ $0.15/ay |
| Egress (100GB/ay) | $0.09/GB ≈ $9/ay | **Ücretsiz** |
| CDN | Yok (direct serve) | Global CDN dahil |
| Image optimization | Yok | Cloudflare Polish/Resizing |
| Toplam aylık (tahmini) | ~$9-15/ay | ~$0.15-1/ay |

> **Sonuç:** R2, özellikle egress ücretsiz olduğu için QR menü gibi çok okunan uygulamalarda ciddi tasarruf sağlar.

---

## Öneri

**✅ Cloudflare R2'ye geçiş önerilir.**

Gerekçeler:
1. Supabase Storage egress maliyeti QR menü trafiğiyle artabilir
2. Cloudflare CDN global performans sağlar
3. Image Resizing ile dinamik thumb/menu boyutlandırma
4. Mevcut Supabase + Cloudinary yapısı zaten çoklu storage pattern'ine uygun
5. Geçiş kademeli yapılabilir, risk düşük

Öncelikli değil — önce Supabase temizliği ve optimizasyon yapılmalı, sonra R2'ye geçiş değerlendirilmeli.
