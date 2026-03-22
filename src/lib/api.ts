import { supabase } from "./supabase";
import { MenuItem, Category, AnnouncementBanner } from "./types";

// ---- CATEGORIES ----
export async function getCategories(): Promise<Category[]> {
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
}

// ---- ITEMS ----
export async function getItems(): Promise<MenuItem[]> {
  const { data: items, error } = await supabase
    .from("items")
    .select("*, item_variants(label, price)")
    .order("name");
  if (error) throw error;
  return (items || []).map(mapItem);
}

export async function getRecommended(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*, item_variants(label, price)")
    .eq("is_recommended", true)
    .eq("is_available", true);
  if (error) throw error;
  return (data || []).map(mapItem);
}

export async function updateItem(id: string, updates: Partial<{
  name: string; price: number | null; is_available: boolean;
  is_recommended: boolean; ingredients: string; image_url: string | null;
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
      cacheControl: "3600"
    });
    
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
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
    variants: variants && variants.length > 0 ? variants : undefined,
    description: row.description as string | undefined,
    ingredients: row.ingredients as string | undefined,
    allergens: row.allergens as string[] | undefined,
    volume: row.volume as string | undefined,
    abv: row.abv as number | undefined,
    tags: row.tags as string[] | undefined,
    isAvailable: row.is_available as boolean,
    isSpecial: row.is_special as boolean | undefined,
    isSignature: row.is_signature as boolean | undefined,
    isRecommended: row.is_recommended as boolean | undefined,
    image: (row.image_url as string | undefined) || undefined,
  };
}
