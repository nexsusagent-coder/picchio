"use client";

import { useState, useCallback } from "react";
import * as api from "@/lib/api";
import { MenuItem, Category, AnnouncementBanner, SiteSettings, Campaign } from "@/lib/types";

interface AnalyticsData {
  dailyStats: { date: string; views: number; clicks: number }[];
  topProductIds: { id: string; count: number }[];
  topCategoryIds: { id: string; count: number }[];
}

interface AdminData {
  items: MenuItem[];
  categories: Category[];
  announcements: AnnouncementBanner[];
  campaigns: Campaign[];
  siteSettings: SiteSettings | null;
  analyticsSummary: AnalyticsData | null;
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>({
    items: [],
    categories: [],
    announcements: [],
    campaigns: [],
    siteSettings: null,
    analyticsSummary: null,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, its, anns, sets, camps, stats] = await Promise.all([
        api.getCategories(),
        api.getItems(),
        api.getAnnouncements(),
        api.getSiteSettings(),
        api.getCampaigns(),
        api.getAnalyticsSummary(),
      ]);
      setData({
        categories: cats,
        items: its,
        announcements: anns,
        siteSettings: sets,
        campaigns: camps,
        analyticsSummary: stats as AnalyticsData | null,
      });
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { ...data, loading, refresh, setData };
}
