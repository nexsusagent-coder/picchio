export interface Category {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface MenuItemVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price?: number;
  priceSecondary?: number;
  priceLabel?: string;
  priceSecondaryLabel?: string;
  variants?: MenuItemVariant[];
  description?: string;
  ingredients?: string;
  allergens?: string | null;
  volume?: string;
  abv?: number;
  tags?: string[];
  isAvailable: boolean;
  isSpecial?: boolean;
  isSignature?: boolean;
  isRecommended?: boolean;
  isFavorite?: boolean;
  tasteIntensity?: string;
  serviceStyle?: string;
  calories?: number;
  isVegan?: boolean;
  isVegetarian?: boolean;
  allergenDetails?: string | null;
  image?: string;
  sortOrder?: number;
}

export interface AnnouncementBanner {
  id: string;
  text: string;
  isActive: boolean;
  type: "info" | "warning" | "promo";
}

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
  announcements: AnnouncementBanner[];
}

export interface Campaign {
  id: string;
  title: string;
  description?: string | null;
  type: "bundle" | "discount" | "animated";
  imageUrls?: string[] | null;
  price?: number | null;
  isActive: boolean;
  endDate?: string | null;
}

export interface SiteSettings {
  address: string;
  phone: string;
  instagram_url: string;
  whatsapp_url: string;
  maps_url: string;
  working_hours?: string;
  hero_logo_url?: string;
  menu_title?: string;
  is_header_visible?: boolean;
  // Branding & Design
  primary_color?: string;
  secondary_color?: string;
  accent_gold?: string;
  bg_gradient_start?: string;
  bg_gradient_end?: string;
  button_color?: string;
  font_family?: string;
  border_radius?: number;
  glass_blur?: number;
  noise_opacity?: number;
  footer_text?: string;
}

export interface AnalyticsEvent {
  id: string;
  eventType: 'click' | 'view';
  productId?: string;
  categoryId?: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  views: number;
  clicks: number;
}

export interface AnalyticsSummary {
  dailyStats: DailyStats[];
  topProducts: { id: string; name: string; count: number }[];
  topCategories: { id: string; name: string; count: number }[];
}
