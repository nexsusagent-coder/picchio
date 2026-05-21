import { supabase } from "./supabase";
import { MenuItem, Category, AnnouncementBanner, Campaign } from "./types";
import { initialData } from "../data/db";

// ---- CATEGORIES ----
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("order");
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      order: row.order,
      isActive: row.is_active,
    }));
  } catch (err) {
    console.warn("getCategories failed, using local fallback data:", err);
    return initialData.categories.filter(c => c.isActive).sort((a, b) => a.order - b.order);
  }
}

export async function updateCategory(id: string, updates: Partial<{ name: string; order: number; is_active: boolean }>) {
  const { error } = await supabase.from("categories").update(updates).eq("id", id);
  if (error) throw error;
}

export async function insertCategory(category: Category) {
  const { error } = await supabase.from("categories").insert({
    id: category.id,
    name: category.name,
    order: category.order,
    is_active: category.isActive,
  });
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ---- ITEMS ----
export async function getItems(): Promise<MenuItem[]> {
  try {
    const { data: items, error } = await supabase
      .from("items")
      .select("*, item_variants(label, price)")
      .order("sort_order", { ascending: true })
      .order("name");
    if (error) throw error;
    return (items || []).map(mapItem);
  } catch (err) {
    console.warn("getItems failed, using local fallback data:", err);
    return initialData.items;
  }
}

export async function getRecommended(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*, item_variants(label, price)")
      .eq("is_recommended", true)
      .eq("is_available", true);
    if (error) throw error;
    return (data || []).map(mapItem);
  } catch (err) {
    console.warn("getRecommended failed, using local fallback data:", err);
    return initialData.items.filter(i => i.isRecommended && i.isAvailable);
  }
}

export async function updateItem(id: string, updates: Partial<{
  name?: string; price?: number | null; is_available?: boolean;
  is_recommended?: boolean; ingredients?: string; image_url?: string | null;
  price_secondary?: number | null; price_label?: string | null; price_secondary_label?: string | null;
  allergens?: string | null; is_favorite?: boolean; taste_intensity?: string | null; service_style?: string | null;
  calories?: number | null; is_vegan?: boolean; is_vegetarian?: boolean; allergen_details?: string | null;
  category_id?: string;
}>) {
  const { error } = await supabase.from("items").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

export async function insertItem(item: Omit<MenuItem, "variants"> & { variants?: { label: string; price: number }[] }) {
  const { data, error } = await supabase.from("items").insert({
    id: item.id,
    category_id: item.categoryId,
    name: item.name,
    price: item.price,
    description: item.description,
    ingredients: item.ingredients,
    allergens: item.allergens,
    tags: item.tags,
    is_available: item.isAvailable,
    is_special: item.isSpecial,
    is_signature: item.isSignature,
    is_recommended: item.isRecommended,
    image_url: item.image,
    price_secondary: item.priceSecondary,
    price_label: item.priceLabel,
    price_secondary_label: item.priceSecondaryLabel,
    is_favorite: item.isFavorite,
    taste_intensity: item.tasteIntensity,
    service_style: item.serviceStyle,
    calories: item.calories,
    is_vegan: item.isVegan,
    is_vegetarian: item.isVegetarian,
    allergen_details: item.allergenDetails,
  }).select().single();
  if (error) throw error;
  
  if (item.variants && item.variants.length > 0 && data) {
    await supabase.from("item_variants").insert(
      item.variants.map(v => ({ item_id: data.id, label: v.label, price: v.price }))
    );
  }
}

// ---- ANNOUNCEMENTS ----
export async function getAnnouncements(): Promise<AnnouncementBanner[]> {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at");
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      text: row.text,
      isActive: row.is_active,
      type: row.type,
    }));
  } catch (err) {
    console.warn("getAnnouncements failed, using local fallback data:", err);
    return initialData.announcements;
  }
}

export async function updateAnnouncement(id: string, updates: Partial<{ is_active: boolean; text: string }>) {
  const { error } = await supabase.from("announcements").update(updates).eq("id", id);
  if (error) throw error;
}

export async function insertAnnouncement(ann: AnnouncementBanner) {
  const { error } = await supabase.from("announcements").insert({
    id: ann.id, text: ann.text, is_active: ann.isActive, type: ann.type,
  });
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// ---- IMAGE UPLOAD ----
export async function uploadProductImage(file: File, itemId: string): Promise<string> {
  let ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || ext === file.name.toLowerCase()) {
    ext = file.type.split("/").pop() || "jpeg";
  }
  
  // Add timestamp to the filename to avoid CDN caching and update UI instantly
  const timestamp = new Date().getTime();
  const path = `products/${itemId}-${timestamp}.${ext}`;
  
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { 
      upsert: false,
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000"
    });
    
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCampaignImage(file: File, campaignId: string): Promise<string> {
  let ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || ext === file.name.toLowerCase()) {
    ext = file.type.split("/").pop() || "jpeg";
  }
  
  const timestamp = new Date().getTime();
  const path = `campaigns/${campaignId}-${timestamp}.${ext}`;
  
  const { error: uploadError } = await supabase.storage
    .from("campaign-images")
    .upload(path, file, { 
      upsert: false,
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000"
    });
    
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("campaign-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadSiteAsset(file: File, type: "hero_logo"): Promise<string> {
  let ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || ext === file.name.toLowerCase()) {
    ext = file.type.split("/").pop() || "png";
  }
  
  const timestamp = new Date().getTime();
  const path = `${type}-${timestamp}.${ext}`;
  
  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(path, file, { 
      upsert: true,
      contentType: file.type || "image/png",
      cacheControl: "3600"
    });
    
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return data.publicUrl;
}

// ---- MAPPER ----
function mapItem(row: Record<string, unknown>): MenuItem {
  const variants = Array.isArray(row.item_variants) ? row.item_variants as { label: string; price: number }[] : undefined;
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    name: row.name as string,
    price: row.price as number | undefined,
    priceSecondary: row.price_secondary as number | undefined,
    priceLabel: row.price_label as string | undefined,
    priceSecondaryLabel: row.price_secondary_label as string | undefined,
    variants: variants && variants.length > 0 ? variants : undefined,
    description: row.description as string | undefined,
    ingredients: row.ingredients as string | undefined,
    allergens: row.allergens as string | null | undefined,
    volume: row.volume as string | undefined,
    abv: row.abv as number | undefined,
    tags: row.tags as string[] | undefined,
    isAvailable: row.is_available as boolean,
    isSpecial: row.is_special as boolean | undefined,
    isSignature: row.is_signature as boolean | undefined,
    isRecommended: row.is_recommended as boolean | undefined,
    isFavorite: row.is_favorite as boolean | undefined,
    tasteIntensity: row.taste_intensity as string | undefined,
    serviceStyle: row.service_style as string | undefined,
    calories: row.calories as number | undefined,
    isVegan: row.is_vegan as boolean | undefined,
    isVegetarian: row.is_vegetarian as boolean | undefined,
    allergenDetails: row.allergen_details as string | null | undefined,
    image: (row.image_url as string | undefined) || undefined,
    sortOrder: (row.sort_order as number | undefined) ?? 0,
  };
}

// ---- CAMPAIGNS ----
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const campaigns: Campaign[] = [];
    for (const row of (data || [])) {
      try {
        let derivedImageUrls: string[] = [];
        if (Array.isArray(row.image_urls)) {
          derivedImageUrls = row.image_urls;
        } else if (typeof row.image_url === 'string' && row.image_url) {
          derivedImageUrls = [row.image_url];
        }

        campaigns.push({
          id: row.id,
          title: row.title,
          description: row.description,
          type: row.type,
          imageUrls: derivedImageUrls,
          price: row.price,
          isActive: row.is_active ?? true,
          startDate: row.start_date || null,
          endDate: row.end_date || null,
          viewCount: row.view_count ?? 0,
          clickCount: row.click_count ?? 0,
        });
      } catch (err) {
        console.error("Campaign row mapping error:", err, row);
      }
    }
    return campaigns;
  } catch (err) {
    console.warn("getCampaigns failed, using local fallback data (empty):", err);
    return [];
  }
}

export async function updateCampaign(id: string, updates: Partial<{
  title: string; description: string | null; type: string;
  image_urls: string[] | null; image_url: string | null;
  price: number | null;
  is_active: boolean; end_date: string | null;
  start_date: string | null;
}>) {
  const { error } = await supabase.from("campaigns").update(updates).eq("id", id);
  if (error) throw error;
}

export async function insertCampaign(c: Omit<Campaign, "id"> & { id?: string }) {
  const { error } = await supabase.from("campaigns").insert({
    id: c.id || `camp-${Date.now()}`,
    title: c.title,
    description: c.description,
    type: c.type,
    image_urls: c.imageUrls || [],
    price: c.price,
    is_active: c.isActive,
    start_date: c.startDate || null,
    end_date: c.endDate || null,
  });
  if (error) throw error;
}

export async function trackCampaignEvent(campaignId: string, eventType: "view" | "click") {
  try {
    const column = eventType === "view" ? "view_count" : "click_count";
    const { error } = await supabase.rpc("increment_campaign_counter", {
      campaign_id: campaignId,
      counter_column: column,
    });
    if (error) {
      // Fallback: direct update if RPC not available
      const { data: current } = await supabase
        .from("campaigns")
        .select(eventType === "view" ? "view_count" : "click_count")
        .eq("id", campaignId)
        .single();
      const currentVal = (current as Record<string, number> | null)?.[eventType === "view" ? "view_count" : "click_count"] ?? 0;
      await supabase
        .from("campaigns")
        .update({ [column]: currentVal + 1 })
        .eq("id", campaignId);
    }
  } catch {
    // Silent fail for tracking
  }
}

// ---- ACTIVITY LOG ----
export async function logActivity(entry: {
  user_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  entity_name?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    await supabase.from("activity_log").insert({
      user_email: entry.user_email,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      entity_name: entry.entity_name,
      details: entry.details || {},
    });
  } catch (err) {
    console.warn("Activity log error:", err);
  }
}

export async function getActivityLog(limit = 50) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    userEmail: row.user_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityName: row.entity_name,
    details: row.details,
    createdAt: row.created_at,
  }));
}

// ---- EXPORT / BACKUP ----
export function exportProductsToCSV(items: MenuItem[], categories: { id: string; name: string }[]) {
  const header = "﻿ID, Kategori, Ad, Fiyat, Fiyat2, Etiket1, Etiket2, Icerik, Alerjenler, Tat, Servis, Kalori, Vegan, Vejetaryen, Favori, Aktif, Onerilen";
  const rows = items.map(item => {
    const cat = categories.find(c => c.id === item.categoryId);
    return [
      item.id, cat?.name || "", item.name, item.price ?? "", item.priceSecondary ?? "",
      item.priceLabel ?? "", item.priceSecondaryLabel ?? "", item.ingredients ?? "",
      item.allergens ?? "", item.tasteIntensity ?? "", item.serviceStyle ?? "",
      item.calories ?? "", item.isVegan ? "Evet" : "Hayir", item.isVegetarian ? "Evet" : "Hayir",
      item.isFavorite ? "Evet" : "Hayir", item.isAvailable ? "Aktif" : "Pasif",
      item.isRecommended ? "Evet" : "Hayir",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `urunler_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function createBackup() {
  const [items, categories, announcements, campaigns, settings] = await Promise.all([
    getItems(), getCategories(), getAnnouncements(), getCampaigns(), getSiteSettings(),
  ]);
  return { items, categories, announcements, campaigns, settings, version: 1, exportedAt: new Date().toISOString() };
}

export async function restoreBackup(file: File): Promise<void> {
  const text = await file.text();
  const backup = JSON.parse(text);
  if (!backup.version) throw new Error("Gecersiz yedek dosyasi");

  // Restore categories
  if (backup.categories?.length) {
    for (const cat of backup.categories) {
      await supabase.from("categories").upsert({
        id: cat.id, name: cat.name, order: cat.order, is_active: cat.isActive,
      });
    }
  }
  // Restore items
  if (backup.items?.length) {
    for (const item of backup.items) {
      await supabase.from("items").upsert({
        id: item.id, category_id: item.categoryId, name: item.name,
        price: item.price, price_secondary: item.priceSecondary,
        price_label: item.priceLabel, price_secondary_label: item.priceSecondaryLabel,
        description: item.description, ingredients: item.ingredients,
        allergens: item.allergens, is_available: item.isAvailable,
        is_recommended: item.isRecommended, is_favorite: item.isFavorite,
        is_special: item.isSpecial, is_signature: item.isSignature,
        taste_intensity: item.tasteIntensity, service_style: item.serviceStyle,
        calories: item.calories, is_vegan: item.isVegan, is_vegetarian: item.isVegetarian,
        allergen_details: item.allergenDetails, image_url: item.image,
        sort_order: item.sortOrder, tags: item.tags, volume: item.volume, abv: item.abv,
      });
    }
  }
  // Restore campaigns
  if (backup.campaigns?.length) {
    for (const camp of backup.campaigns) {
      await supabase.from("campaigns").upsert({
        id: camp.id, title: camp.title, description: camp.description,
        type: camp.type, image_urls: camp.imageUrls, price: camp.price,
        is_active: camp.isActive, start_date: camp.startDate, end_date: camp.endDate,
      });
    }
  }
  // Restore settings
  if (backup.settings) {
    await supabase.from("site_settings").upsert({ id: 1, ...backup.settings });
  }
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

// ---- SITE SETTINGS ----
export async function getSiteSettings() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.warn("getSiteSettings error:", error);
      return getFallbackSettings();
    }
    return data || getFallbackSettings();
  } catch (err) {
    console.warn("getSiteSettings fatal error:", err);
    return getFallbackSettings();
  }
}

function getFallbackSettings() {
  return {
    address: "Alsancak, Kültür Mahallesi 1388 Sokak, İzmir",
    phone: "+90 555 123 45 67",
    instagram_url: "https://instagram.com/picchiococktail",
    whatsapp_url: "https://wa.me/905551234567",
    maps_url: "https://maps.google.com/?q=Picchio+Cocktail+Alsancak",
    working_hours: "Hafta İçi: 18:00 - 02:00 | Hafta Sonu: 18:00 - 04:00",
    menu_title: "Picchio Cocktail Bar Menüsü",
    is_header_visible: true,
    hero_logo_url: "/logo.png",
    // Design Defaults (Red Inferno)
    primary_color: "#4E0000",
    secondary_color: "#1a0404",
    accent_gold: "#D4AF37",
    bg_gradient_start: "#4E0000",
    bg_gradient_end: "#000000",
    button_color: "#4a0e0e",
    font_family: "Inter",
    border_radius: 12,
    glass_blur: 12,
    noise_opacity: 0.05,
    footer_text: "Picchio Cocktail Bar"
  };
}

export async function updateSiteSettings(settings: any) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...settings });
  if (error) throw error;
}

// ---- SORT ORDER (BATCH) ----
export async function updateSortOrders(updates: { id: string; sort_order: number }[]) {
  // Supabase doesn't support batch update natively, so we do individual updates
  // wrapped in a single Promise.all for performance
  const promises = updates.map(u =>
    supabase.from("items").update({ sort_order: u.sort_order }).eq("id", u.id)
  );
  const results = await Promise.all(promises);
  const firstError = results.find(r => r.error);
  if (firstError?.error) throw firstError.error;
}

// ---- BULK OPERATIONS ----
export async function bulkDeleteItems(ids: string[]) {
  const promises = ids.map(id =>
    supabase.from("items").delete().eq("id", id)
  );
  const results = await Promise.all(promises);
  const firstError = results.find(r => r.error);
  if (firstError?.error) throw firstError.error;
}

export async function bulkUpdateCategory(ids: string[], categoryId: string) {
  const promises = ids.map(id =>
    supabase.from("items").update({ category_id: categoryId }).eq("id", id)
  );
  const results = await Promise.all(promises);
  const firstError = results.find(r => r.error);
  if (firstError?.error) throw firstError.error;
}

export async function duplicateItem(item: MenuItem) {
  const newId = `item-${Date.now()}`;
  await insertItem({
    ...item,
    id: newId,
    name: `${item.name} (Kopya)`,
    image: undefined,
    sortOrder: undefined,
  });
}

// ---- ANALYTICS ----
export async function trackEvent(
  eventType: 'click' | 'view',
  metadata: { productId?: string, categoryId?: string }
) {
  // Silent tracking - we don't want to block UI or show errors to user
  try {
    const { error } = await supabase.from("analytics").insert({
      event_type: eventType,
      product_id: metadata.productId,
      category_id: metadata.categoryId
    });
    if (error) console.warn("Analytics error:", error);
  } catch (err) {
    console.warn("Analytics fatal error:", err);
  }
}

export async function getAnalyticsSummary() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: events, error } = await supabase
    .from("analytics")
    .select("*")
    .gt("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Process Daily Stats for LineChart
  const dailyMap = new Map<string, { date: string, views: number, clicks: number }>();
  
  // Initialize last 7 days with 0s
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap.set(dateStr, { date: dateStr, views: 0, clicks: 0 });
  }

  const productCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  events?.forEach(event => {
    const dateStr = event.created_at.split('T')[0];
    const stats = dailyMap.get(dateStr);
    if (stats) {
      if (event.event_type === 'view') stats.views++;
      else if (event.event_type === 'click') stats.clicks++;
    }

    if (event.event_type === 'view') {
      if (event.product_id) productCounts.set(event.product_id, (productCounts.get(event.product_id) || 0) + 1);
      if (event.category_id) categoryCounts.set(event.category_id, (categoryCounts.get(event.category_id) || 0) + 1);
    }
  });

  return {
    dailyStats: Array.from(dailyMap.values()),
    topProductIds: Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count })),
    topCategoryIds: Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count })),
  };
}
