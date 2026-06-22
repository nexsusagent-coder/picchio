import { connection } from "next/server";
import * as api from "@/lib/api";
import MenuClient from "@/components/MenuClient";

// Force dynamic rendering — never cache this page
// In Next.js 16, `export const dynamic` is removed.
// We use `connection()` to opt into dynamic rendering at request time.

export default async function MenuPage() {
  // Signal to Next.js that this page must wait for a real request
  // and should never be prerendered/cached statically
  await connection();

  // Fetch ALL data server-side — this runs on every request
  // ensuring users always see the latest menu
  const [categories, items, announcements, siteSettings, campaigns] = await Promise.all([
    api.getCategories(),
    api.getItems(),
    api.getAnnouncements(),
    api.getSiteSettings(),
    api.getCampaigns(),
  ]);

  return (
    <MenuClient
      initialCategories={categories}
      initialItems={items}
      initialAnnouncements={announcements}
      initialSiteSettings={siteSettings}
      initialCampaigns={campaigns}
    />
  );
}
