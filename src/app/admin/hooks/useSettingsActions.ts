"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { SiteSettings } from "@/lib/types";
import { publishChanges } from "@/app/actions";

export function useSettingsActions(
  siteSettings: SiteSettings | null,
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>,
  showNotification: (message: string, type?: "success" | "error") => void,
) {
  const [savingSettings, setSavingSettings] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !siteSettings) return;
    setSavingSettings(true);
    try {
      const url = await api.uploadSiteAsset(file, "hero_logo");
      const updated = { ...siteSettings, hero_logo_url: url };
      setSiteSettings(updated);
      await api.updateSiteSettings(updated);
      await publishChanges();
      showNotification("Logo basariyla yuklendi.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lutfen internet baglantinizi kontrol edin.";
      console.error(err);
      showNotification(`Logo yuklenirken hata: ${msg}`, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveSettings = async () => {
    if (!siteSettings) return;
    setSavingSettings(true);
    try {
      await api.updateSiteSettings(siteSettings);
      await publishChanges();
      showNotification("Ayarlar basariyla kaydedildi.");
    } catch (err) {
      console.error(err);
      showNotification("Kaydedilirken hata olustu.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  return { savingSettings, handleLogoUpload, saveSettings };
}
