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
  variants?: MenuItemVariant[];
  description?: string;
  ingredients?: string;
  allergens?: string[];
  volume?: string;
  abv?: number;
  tags?: string[];
  isAvailable: boolean;
  isSpecial?: boolean;
  isSignature?: boolean;
  isRecommended?: boolean;
  image?: string;
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
