import { connection } from "next/server";
import * as api from "@/lib/api";
import MenuClient from "@/components/MenuClient";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";
import { IS_MAINTENANCE_MODE } from "@/lib/config";

export default async function MenuPage() {
  await connection();

  if (IS_MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

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
