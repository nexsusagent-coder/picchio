# 📊 Supabase Storage Görsel Denetim Raporu

**Oluşturulma:** 09.06.2026 19:09:30

## 🚦 Özet

| Metrik | Değer |
|--------|-------|
| Storage'daki toplam dosya | 141 |
| Toplam storage kullanımı | 130.9 MB |
| DB'deki toplam görsel referansı | 141 |
| **🟡 Orphan (kullanılmayan) dosya** | **0** (0 B) |
| **🔴 Kırık referans (DB'de var, storage'da yok)** | **0** |
| 🔵 Aynı path'e çoklu referans | 0 |

## 📦 Bucket Özeti

| Bucket | Dosya Sayısı | Toplam Boyut |
|--------|-------------|-------------|
| `product-images` | 130 | 109.8 MB |
| `campaign-images` | 10 | 20.9 MB |
| `site-assets` | 1 | 257.1 KB |

---

## 📋 Önerilen Aksiyonlar

1. **Orphan dosyaları temizle:** `npm run cleanup:images:delete`
2. **Kırık referansları düzelt:** İlgili ürünlere yeni görsel yükle veya `image_url` değerini temizle.
3. **Görsel optimizasyonu:** Yeni yüklemelerde otomatik resize/WebP dönüşümü aktif.
4. **Storage maliyeti:** Orphan dosyalar temizlenirse ~0 B alan boşalır.
