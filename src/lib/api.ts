import { supabase } from "./supabase";
import { MenuItem, Category, AnnouncementBanner, Campaign } from "./types";
import { initialData } from "../data/db";
import { query, isNeonAvailable } from "./neon";

// Cloudinary is server-only (needs Node.js fs module).
// We guard with typeof window so webpack can tree-shake it on client builds.
let _cloudinaryModule: {
  uploadToCloudinary: (f: File, folder: "products" | "campaigns" | "site-assets", id: string) => Promise<string>;
  isCloudinaryAvailable: () => boolean;
} | null = null;

async function loadCloudinary() {
  // Never attempt to load cloudinary in browser — it requires Node.js fs
  if (typeof window !== "undefined") return null;
  if (_cloudinaryModule) return _cloudinaryModule;
  try {
    const mod = await import("./cloudinary");
    _cloudinaryModule = mod;
    return mod;
  } catch {
    return null;
  }
}

async function cloudinaryUpload(file: File, folder: string, id: string) {
  const cloudinary = await loadCloudinary();
  if (!cloudinary) throw new Error("Cloudinary yuklenemedi");
  return cloudinary.uploadToCloudinary(file, folder as "products" | "campaigns" | "site-assets", id);
}

async function isCloudinaryAvail() {
  const cloudinary = await loadCloudinary();
  return cloudinary ? cloudinary.isCloudinaryAvailable() : false;
}

// Helper: Try Neon first, fall back to existing function
async function tryNeonFirst<T>(neonFn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
  if (isNeonAvailable()) {
    try { return await neonFn(); } catch (e) { console.warn("Neon failed, using fallback:", e); }
  }
  return fallbackFn();
}

// ---- CATEGORIES ----
export async function getCategories(): Promise<Category[]> {
  return tryNeonFirst(
    async () => {
      const rows = await query`SELECT id, name, "order", is_active FROM categories WHERE is_active = true ORDER BY "order"`;
      return rows.map((row: Record<string, unknown>) => ({ id: row.id as string, name: row.name as string, order: row.order as number, isActive: row.is_active as boolean }));
    },
    async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("order");
        if (error) throw error;
        return (data || []).map(row => ({ id: row.id, name: row.name, order: row.order, isActive: row.is_active }));
      } catch (err) {
        console.warn("getCategories failed, using local fallback data:", err);
        return initialData.categories.filter(c => c.isActive).sort((a, b) => a.order - b.order);
      }
    }
  );
}

export async function updateCategory(id: string, updates: Partial<{ name: string; order: number; is_active: boolean }>) {
  if (isNeonAvailable()) {
    try {
      const setClauses: string[] = [];
      const values: unknown[] = [];
      let idx = 1;
      if (updates.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(updates.name); }
      if (updates.order !== undefined) { setClauses.push(`"order" = $${idx++}`); values.push(updates.order); }
      if (updates.is_active !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(updates.is_active); }
      values.push(id);
      await query([`UPDATE categories SET ${setClauses.join(", ")} WHERE id = $${idx}`, ...values] as unknown as TemplateStringsArray);
      return;
    } catch (e) { console.warn("Neon updateCategory failed:", e); }
  }
  const { error } = await supabase.from("categories").update(updates).eq("id", id);
  if (error) throw error;
}

export async function insertCategory(category: Category) {
  if (isNeonAvailable()) {
    try {
      await query`INSERT INTO categories (id, name, "order", is_active) VALUES (${category.id}, ${category.name}, ${category.order}, ${category.isActive})`;
      return;
    } catch (e) { console.warn("Neon insertCategory failed:", e); }
  }
  const { error } = await supabase.from("categories").insert({ id: category.id, name: category.name, order: category.order, is_active: category.isActive });
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  if (isNeonAvailable()) {
    try {
      await query`DELETE FROM categories WHERE id = ${id}`;
      return;
    } catch (e) { console.warn("Neon deleteCategory failed:", e); }
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ---- ITEMS ----
export async function getItems(): Promise<MenuItem[]> {
  return tryNeonFirst(
    async () => {
      const rows = await query`
        SELECT i.*, COALESCE(json_agg(json_build_object('label', iv.label, 'price', iv.price)) FILTER (WHERE iv.item_id IS NOT NULL), '[]') as item_variants
        FROM items i LEFT JOIN item_variants iv ON iv.item_id = i.id
        GROUP BY i.id ORDER BY i.sort_order ASC, i.name ASC`;
      return rows.map((row: Record<string, unknown>) => mapItem(row));
    },
    async () => {
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
  );
}

export async function getRecommended(): Promise<MenuItem[]> {
  return tryNeonFirst(
    async () => {
      const rows = await query`
        SELECT i.*, COALESCE(json_agg(json_build_object('label', iv.label, 'price', iv.price)) FILTER (WHERE iv.item_id IS NOT NULL), '[]') as item_variants
        FROM items i LEFT JOIN item_variants iv ON iv.item_id = i.id
        WHERE i.is_recommended = true AND i.is_available = true
        GROUP BY i.id`;
      return rows.map((row: Record<string, unknown>) => mapItem(row));
    },
    async () => {
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
  );
}

export async function updateItem(id: string, updates: Partial<{
  name?: string; price?: number | null; is_available?: boolean;
  is_recommended?: boolean; ingredients?: string; image_url?: string | null;
  price_secondary?: number | null; price_label?: string | null; price_secondary_label?: string | null;
  allergens?: string | null; is_favorite?: boolean; taste_intensity?: string | null; service_style?: string | null;
  calories?: number | null; is_vegan?: boolean; is_vegetarian?: boolean; allergen_details?: string | null;
  category_id?: string;
}>) {
  if (isNeonAvailable()) {
    try {
      const setClauses: string[] = [];
      const values: unknown[] = [];
      let idx = 1;
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) {
          setClauses.push(`${key} = $${idx++}`);
          values.push(val);
        }
      }
      if (setClauses.length > 0) {
        values.push(id);
        await query([`UPDATE items SET ${setClauses.join(", ")} WHERE id = $${idx}`, ...values] as unknown as TemplateStringsArray);
      }
      return;
    } catch (e) { console.warn("Neon updateItem failed:", e); }
  }
  const { error } = await supabase.from("items").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string) {
  // Fetch image_url before deleting so we can clean up storage
  const imageUrl = await getImageUrlForItem(id);

  if (isNeonAvailable()) {
    try {
      await query`DELETE FROM item_variants WHERE item_id = ${id}`;
      await query`DELETE FROM items WHERE id = ${id}`;
    } catch (e) { console.warn("Neon deleteItem failed:", e); }
  } else {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
  }

  // Auto-cleanup storage file
  if (imageUrl) {
    const storageInfo = extractStoragePath(imageUrl);
    if (storageInfo) {
      await removeImageFromStorage(storageInfo.bucket, storageInfo.path);
    }
  }
}

/** Get the image_url for an item before deletion */
async function getImageUrlForItem(id: string): Promise<string | null> {
  try {
    if (isNeonAvailable()) {
      const rows = await query`SELECT image_url FROM items WHERE id = ${id}`;
      return (rows?.[0]?.image_url as string) || null;
    }
    const { data } = await supabase.from("items").select("image_url").eq("id", id).single();
    return data?.image_url || null;
  } catch {
    return null;
  }
}

export async function insertItem(item: Omit<MenuItem, "variants"> & { variants?: { label: string; price: number }[] }) {
  if (isNeonAvailable()) {
    try {
      await query`
        INSERT INTO items (id, category_id, name, price, description, ingredients, allergens, tags, is_available, is_special, is_signature, is_recommended, image_url, price_secondary, price_label, price_secondary_label, is_favorite, taste_intensity, service_style, calories, is_vegan, is_vegetarian, allergen_details)
        VALUES (${item.id}, ${item.categoryId}, ${item.name}, ${item.price ?? null}, ${item.description ?? null}, ${item.ingredients ?? null}, ${item.allergens ?? null}, ${item.tags ?? null}, ${item.isAvailable}, ${item.isSpecial ?? false}, ${item.isSignature ?? false}, ${item.isRecommended ?? false}, ${item.image ?? null}, ${item.priceSecondary ?? null}, ${item.priceLabel ?? null}, ${item.priceSecondaryLabel ?? null}, ${item.isFavorite ?? false}, ${item.tasteIntensity ?? null}, ${item.serviceStyle ?? null}, ${item.calories ?? null}, ${item.isVegan ?? false}, ${item.isVegetarian ?? false}, ${item.allergenDetails ?? null})`;
      if (item.variants && item.variants.length > 0) {
        for (const v of item.variants) {
          await query`INSERT INTO item_variants (item_id, label, price) VALUES (${item.id}, ${v.label}, ${v.price})`;
        }
      }
      return;
    } catch (e) { console.warn("Neon insertItem failed:", e); }
  }
  const { data, error } = await supabase.from("items").insert({
    id: item.id, category_id: item.categoryId, name: item.name, price: item.price,
    description: item.description, ingredients: item.ingredients, allergens: item.allergens,
    tags: item.tags, is_available: item.isAvailable, is_special: item.isSpecial,
    is_signature: item.isSignature, is_recommended: item.isRecommended, image_url: item.image,
    price_secondary: item.priceSecondary, price_label: item.priceLabel,
    price_secondary_label: item.priceSecondaryLabel, is_favorite: item.isFavorite,
    taste_intensity: item.tasteIntensity, service_style: item.serviceStyle,
    calories: item.calories, is_vegan: item.isVegan, is_vegetarian: item.isVegetarian,
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
  return tryNeonFirst(
    async () => {
      const rows = await query`SELECT id, text, is_active, type FROM announcements ORDER BY created_at`;
      return rows.map((row: Record<string, unknown>) => ({ id: row.id as string, text: row.text as string, isActive: row.is_active as boolean, type: row.type as "info" | "warning" | "promo" }));
    },
    async () => {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at");
        if (error) throw error;
        return (data || []).map(row => ({ id: row.id, text: row.text, isActive: row.is_active, type: row.type }));
      } catch (err) {
        console.warn("getAnnouncements failed, using local fallback data:", err);
        return initialData.announcements;
      }
    }
  );
}

export async function updateAnnouncement(id: string, updates: Partial<{ is_active: boolean; text: string }>) {
  if (isNeonAvailable()) {
    try {
      const setClauses: string[] = [];
      const values: unknown[] = [];
      let idx = 1;
      if (updates.text !== undefined) { setClauses.push(`text = $${idx++}`); values.push(updates.text); }
      if (updates.is_active !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(updates.is_active); }
      if (setClauses.length > 0) { values.push(id); await query([`UPDATE announcements SET ${setClauses.join(", ")} WHERE id = $${idx}`, ...values] as unknown as TemplateStringsArray); }
      return;
    } catch (e) { console.warn("Neon updateAnnouncement failed:", e); }
  }
  const { error } = await supabase.from("announcements").update(updates).eq("id", id);
  if (error) throw error;
}

export async function insertAnnouncement(ann: AnnouncementBanner) {
  if (isNeonAvailable()) {
    try {
      await query`INSERT INTO announcements (id, text, is_active, type) VALUES (${ann.id}, ${ann.text}, ${ann.isActive}, ${ann.type})`;
      return;
    } catch (e) { console.warn("Neon insertAnnouncement failed:", e); }
  }
  const { error } = await supabase.from("announcements").insert({ id: ann.id, text: ann.text, is_active: ann.isActive, type: ann.type });
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  if (isNeonAvailable()) {
    try {
      await query`DELETE FROM announcements WHERE id = ${id}`;
      return;
    } catch (e) { console.warn("Neon deleteAnnouncement failed:", e); }
  }
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// ---- IMAGE UPLOAD ----

/**
 * Build a cache-busted URL by appending a version query parameter.
 * This ensures browsers and CDNs fetch the fresh image after upload.
 */
export function cacheBustUrl(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${new Date().getTime()}`;
}

/**
 * Upload a product image, overwriting any previous image for the same product.
 * Path: products/{productId}/image.{ext} — one file per product, no orphan buildup.
 */
export async function uploadProductImage(file: File, itemId: string): Promise<string> {
  // Try Cloudinary first
  if (await isCloudinaryAvail()) {
    try {
      return await cloudinaryUpload(file, "products", itemId);
    } catch (e) { console.warn("Cloudinary uploadProductImage failed:", e); }
  }
  // Supabase Storage — fixed path, overwrite (upsert) mode
  let ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || ext === file.name.toLowerCase()) { ext = file.type.split("/").pop() || "jpeg"; }
  const path = `products/${itemId}/image.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg", cacheControl: "31536000" });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return cacheBustUrl(data.publicUrl);
}

/**
 * Upload a campaign image. Campaigns can have up to 5 images,
 * so each upload uses a unique timestamp in the path.
 * Old campaign images are cleaned up by the audit/cleanup scripts.
 */
export async function uploadCampaignImage(file: File, campaignId: string): Promise<string> {
  if (await isCloudinaryAvail()) {
    try {
      const timestamp = new Date().getTime();
      return await cloudinaryUpload(file, "campaigns", `${campaignId}-${timestamp}`);
    } catch (e) { console.warn("Cloudinary uploadCampaignImage failed:", e); }
  }
  let ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || ext === file.name.toLowerCase()) { ext = file.type.split("/").pop() || "jpeg"; }
  const timestamp = new Date().getTime();
  const path = `campaigns/${campaignId}/${timestamp}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("campaign-images")
    .upload(path, file, { upsert: false, contentType: file.type || "image/jpeg", cacheControl: "31536000" });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("campaign-images").getPublicUrl(path);
  return cacheBustUrl(data.publicUrl);
}

/**
 * Upload a site asset (hero logo).
 * Path: hero_logo.{ext} — fixed path, overwrite mode.
 */
export async function uploadSiteAsset(file: File, type: "hero_logo"): Promise<string> {
  if (await isCloudinaryAvail()) {
    try {
      return await cloudinaryUpload(file, "site-assets", type);
    } catch (e) { console.warn("Cloudinary uploadSiteAsset failed:", e); }
  }
  let ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || ext === file.name.toLowerCase()) { ext = file.type.split("/").pop() || "png"; }
  const path = `${type}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(path, file, { upsert: true, contentType: file.type || "image/png", cacheControl: "3600" });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return cacheBustUrl(data.publicUrl);
}

/**
 * Attempt to remove a file from Supabase Storage.
 * This is best-effort — failures are logged but not thrown,
 * since the cleanup script can handle orphan files later.
 */
export async function removeImageFromStorage(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.warn(`Storage silme basarisiz (${bucket}/${path}):`, error.message);
    }
  } catch (e) {
    console.warn(`Storage silme hatasi (${bucket}/${path}):`, e);
  }
}

/**
 * Extract the storage path from a Supabase public URL.
 * Returns null if the URL is not a Supabase storage URL.
 */
function extractStoragePath(url: string): { bucket: string; path: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("supabase.co") && u.pathname.includes("/storage/v1/object/public/")) {
      const parts = u.pathname.replace("/storage/v1/object/public/", "").split("/");
      const bucket = parts[0];
      const path = parts.slice(1).join("/");
      return { bucket, path };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Remove a product image: clear the DB reference and attempt storage cleanup.
 */
export async function removeProductImage(itemId: string, imageUrl: string): Promise<void> {
  // Clear DB reference
  await updateItem(itemId, { image_url: null });

  // Attempt storage cleanup (best-effort)
  const storageInfo = extractStoragePath(imageUrl);
  if (storageInfo) {
    await removeImageFromStorage(storageInfo.bucket, storageInfo.path);
  }
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
function mapCampaignRow(row: Record<string, unknown>): Campaign {
  let imageUrls: string[] = [];
  if (Array.isArray(row.image_urls)) {
    imageUrls = row.image_urls as string[];
  } else if (typeof row.image_url === 'string' && row.image_url) {
    imageUrls = [row.image_url as string];
  }
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    type: row.type as Campaign["type"],
    imageUrls,
    price: row.price as number | null,
    isActive: (row.is_active as boolean) ?? true,
    startDate: (row.start_date as string) || null,
    endDate: (row.end_date as string) || null,
    viewCount: (row.view_count as number) ?? 0,
    clickCount: (row.click_count as number) ?? 0,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  return tryNeonFirst(
    async () => {
      const rows = await query`SELECT * FROM campaigns ORDER BY created_at DESC`;
      return rows.map((row: Record<string, unknown>) => mapCampaignRow(row));
    },
    async () => {
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const campaigns: Campaign[] = [];
        for (const row of (data || [])) {
          try { campaigns.push(mapCampaignRow(row)); }
          catch (err) { console.error("Campaign row mapping error:", err, row); }
        }
        return campaigns;
      } catch (err) {
        console.warn("getCampaigns failed, using local fallback data (empty):", err);
        return [];
      }
    }
  );
}

export async function updateCampaign(id: string, updates: Partial<{
  title: string; description: string | null; type: string;
  image_urls: string[] | null; image_url: string | null;
  price: number | null;
  is_active: boolean; end_date: string | null;
  start_date: string | null;
}>) {
  if (isNeonAvailable()) {
    try {
      const setClauses: string[] = [];
      const values: unknown[] = [];
      let idx = 1;
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) { setClauses.push(`${key} = $${idx++}`); values.push(val); }
      }
      if (setClauses.length > 0) { values.push(id); await query([`UPDATE campaigns SET ${setClauses.join(", ")} WHERE id = $${idx}`, ...values] as unknown as TemplateStringsArray); }
      return;
    } catch (e) { console.warn("Neon updateCampaign failed:", e); }
  }
  const { error } = await supabase.from("campaigns").update(updates).eq("id", id);
  if (error) throw error;
}

export async function insertCampaign(c: Omit<Campaign, "id"> & { id?: string }) {
  const campId = c.id || `camp-${Date.now()}`;
  if (isNeonAvailable()) {
    try {
      await query`INSERT INTO campaigns (id, title, description, type, image_urls, price, is_active, start_date, end_date) VALUES (${campId}, ${c.title}, ${c.description ?? null}, ${c.type}, ${c.imageUrls ?? []}, ${c.price ?? null}, ${c.isActive}, ${c.startDate ?? null}, ${c.endDate ?? null})`;
      return;
    } catch (e) { console.warn("Neon insertCampaign failed:", e); }
  }
  const { error } = await supabase.from("campaigns").insert({ id: campId, title: c.title, description: c.description, type: c.type, image_urls: c.imageUrls || [], price: c.price, is_active: c.isActive, start_date: c.startDate || null, end_date: c.endDate || null });
  if (error) throw error;
}

export async function trackCampaignEvent(campaignId: string, eventType: "view" | "click") {
  try {
    const column = eventType === "view" ? "view_count" : "click_count";
    if (isNeonAvailable()) {
      await query([`UPDATE campaigns SET ${column} = ${column} + 1 WHERE id = $1`, campaignId] as unknown as TemplateStringsArray);
      return;
    }
    const { error } = await supabase.rpc("increment_campaign_counter", { campaign_id: campaignId, counter_column: column });
    if (error) {
      const { data: current } = await supabase
        .from("campaigns")
        .select(eventType === "view" ? "view_count" : "click_count")
        .eq("id", campaignId)
        .single();
      const currentVal = (current as Record<string, number> | null)?.[eventType === "view" ? "view_count" : "click_count"] ?? 0;
      await supabase.from("campaigns").update({ [column]: currentVal + 1 }).eq("id", campaignId);
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
    if (isNeonAvailable()) {
      await query`INSERT INTO activity_log (user_email, action, entity_type, entity_id, entity_name, details) VALUES (${entry.user_email ?? null}, ${entry.action}, ${entry.entity_type}, ${entry.entity_id ?? null}, ${entry.entity_name ?? null}, ${JSON.stringify(entry.details || {})})`;
      return;
    }
    await supabase.from("activity_log").insert({
      user_email: entry.user_email, action: entry.action, entity_type: entry.entity_type,
      entity_id: entry.entity_id, entity_name: entry.entity_name, details: entry.details || {},
    });
  } catch (err) {
    console.warn("Activity log error:", err);
  }
}

export async function getActivityLog(limit = 50) {
  if (isNeonAvailable()) {
    try {
      const rows = await query`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ${limit}`;
      return rows.map((row: Record<string, unknown>) => ({ id: row.id as number, userEmail: row.user_email as string | null, action: row.action as string, entityType: row.entity_type as string, entityId: row.entity_id as string | null, entityName: row.entity_name as string | null, details: row.details as Record<string, unknown>, createdAt: row.created_at as string }));
    } catch (e) { console.warn("Neon getActivityLog failed:", e); }
  }
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(row => ({ id: row.id, userEmail: row.user_email, action: row.action, entityType: row.entity_type, entityId: row.entity_id, entityName: row.entity_name, details: row.details, createdAt: row.created_at }));
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
  // Fetch campaign image URLs before deletion
  const campaignUrls = await getImageUrlsForCampaign(id);

  if (isNeonAvailable()) {
    try { await query`DELETE FROM campaigns WHERE id = ${id}`; }
    catch (e) { console.warn("Neon deleteCampaign failed:", e); }
  } else {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) throw error;
  }

  // Auto-cleanup campaign storage files
  for (const url of campaignUrls) {
    const storageInfo = extractStoragePath(url);
    if (storageInfo) {
      await removeImageFromStorage(storageInfo.bucket, storageInfo.path);
    }
  }
}

/** Get all image URLs for a campaign before deletion */
async function getImageUrlsForCampaign(id: string): Promise<string[]> {
  try {
    if (isNeonAvailable()) {
      const rows = await query`SELECT image_urls, image_url FROM campaigns WHERE id = ${id}`;
      if (rows?.[0]) {
        const urls: string[] = [];
        if (Array.isArray(rows[0].image_urls)) urls.push(...(rows[0].image_urls as string[]).filter(Boolean));
        if (rows[0].image_url) urls.push(rows[0].image_url as string);
        return urls;
      }
      return [];
    }
    const { data } = await supabase.from("campaigns").select("image_urls, image_url").eq("id", id).single();
    if (!data) return [];
    const urls: string[] = [];
    if (Array.isArray(data.image_urls)) urls.push(...data.image_urls.filter(Boolean));
    if (data.image_url) urls.push(data.image_url);
    return urls;
  } catch {
    return [];
  }
}

// ---- SITE SETTINGS ----
export async function getSiteSettings() {
  return tryNeonFirst(
    async () => {
      const rows = await query`SELECT * FROM site_settings WHERE id = 1`;
      return (rows && rows.length > 0) ? rows[0] : getFallbackSettings();
    },
    async () => {
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
  );
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
  if (isNeonAvailable()) {
    try {
      const existing = await query`SELECT id FROM site_settings WHERE id = 1`;
      if (existing && existing.length > 0) {
        const setClauses: string[] = [];
        const values: unknown[] = [];
        let idx = 1;
        for (const [key, val] of Object.entries(settings)) {
          if (key === 'id') continue;
          setClauses.push(`${key} = $${idx++}`);
          values.push(val);
        }
        if (setClauses.length > 0) {
          values.push(1);
          await query([`UPDATE site_settings SET ${setClauses.join(", ")} WHERE id = $${idx}`, ...values] as unknown as TemplateStringsArray);
        }
      } else {
        await query`INSERT INTO site_settings (id, ${Object.keys(settings).filter(k => k !== 'id').join(", ")}) VALUES (1, ${Object.values(settings).filter((_, i) => Object.keys(settings)[i] !== 'id').join(", ")})`;
      }
      return;
    } catch (e) { console.warn("Neon updateSiteSettings failed:", e); }
  }
  const { error } = await supabase.from("site_settings").upsert({ id: 1, ...settings });
  if (error) throw error;
}

// ---- SORT ORDER (BATCH) ----
export async function updateSortOrders(updates: { id: string; sort_order: number }[]) {
  if (isNeonAvailable()) {
    try {
      for (const u of updates) {
        await query`UPDATE items SET sort_order = ${u.sort_order} WHERE id = ${u.id}`;
      }
      return;
    } catch (e) { console.warn("Neon updateSortOrders failed:", e); }
  }
  const promises = updates.map(u =>
    supabase.from("items").update({ sort_order: u.sort_order }).eq("id", u.id)
  );
  const results = await Promise.all(promises);
  const firstError = results.find(r => r.error);
  if (firstError?.error) throw firstError.error;
}

// ---- BULK OPERATIONS ----
export async function bulkDeleteItems(ids: string[]) {
  // Fetch image URLs before deletion for storage cleanup
  const imageUrls: string[] = [];
  for (const id of ids) {
    const url = await getImageUrlForItem(id);
    if (url) imageUrls.push(url);
  }

  if (isNeonAvailable()) {
    try {
      for (const id of ids) {
        await query`DELETE FROM item_variants WHERE item_id = ${id}`;
        await query`DELETE FROM items WHERE id = ${id}`;
      }
    } catch (e) { console.warn("Neon bulkDeleteItems failed:", e); }
  } else {
    const promises = ids.map(id => supabase.from("items").delete().eq("id", id));
    const results = await Promise.all(promises);
    const firstError = results.find(r => r.error);
    if (firstError?.error) throw firstError.error;
  }

  // Auto-cleanup storage files (best-effort, don't throw)
  for (const url of imageUrls) {
    const storageInfo = extractStoragePath(url);
    if (storageInfo) {
      await removeImageFromStorage(storageInfo.bucket, storageInfo.path);
    }
  }
}

export async function bulkUpdateCategory(ids: string[], categoryId: string) {
  if (isNeonAvailable()) {
    try {
      for (const id of ids) {
        await query`UPDATE items SET category_id = ${categoryId} WHERE id = ${id}`;
      }
      return;
    } catch (e) { console.warn("Neon bulkUpdateCategory failed:", e); }
  }
  const promises = ids.map(id => supabase.from("items").update({ category_id: categoryId }).eq("id", id));
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
  try {
    if (isNeonAvailable()) {
      await query`INSERT INTO analytics (event_type, product_id, category_id) VALUES (${eventType}, ${metadata.productId ?? null}, ${metadata.categoryId ?? null})`;
      return;
    }
    const { error } = await supabase.from("analytics").insert({
      event_type: eventType, product_id: metadata.productId, category_id: metadata.categoryId
    });
    if (error) console.warn("Analytics error:", error);
  } catch (err) {
    console.warn("Analytics fatal error:", err);
  }
}

export async function getAnalyticsSummary() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let events: Array<Record<string, unknown>> = [];

  if (isNeonAvailable()) {
    try {
      events = await query`SELECT * FROM analytics WHERE created_at > ${sevenDaysAgo.toISOString()} ORDER BY created_at ASC`;
    } catch (e) { console.warn("Neon getAnalyticsSummary failed:", e); }
  }

  if (events.length === 0 && !isNeonAvailable()) {
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .gt("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });
    if (error) throw error;
    events = (data || []) as Array<Record<string, unknown>>;
  }

  const dailyMap = new Map<string, { date: string, views: number, clicks: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap.set(dateStr, { date: dateStr, views: 0, clicks: 0 });
  }

  const productCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  events?.forEach((event: Record<string, unknown>) => {
    const dateStr = (event.created_at as string).split('T')[0];
    const stats = dailyMap.get(dateStr);
    if (stats) {
      if (event.event_type === 'view') stats.views++;
      else if (event.event_type === 'click') stats.clicks++;
    }
    if (event.event_type === 'view') {
      if (event.product_id) productCounts.set(event.product_id as string, (productCounts.get(event.product_id as string) || 0) + 1);
      if (event.category_id) categoryCounts.set(event.category_id as string, (categoryCounts.get(event.category_id as string) || 0) + 1);
    }
  });

  return {
    dailyStats: Array.from(dailyMap.values()),
    topProductIds: Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, count]) => ({ id, count })),
    topCategoryIds: Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, count]) => ({ id, count })),
  };
}
