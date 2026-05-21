"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { AnnouncementBanner } from "@/lib/types";
import { publishChanges } from "@/app/actions";

export function useAnnouncementActions(
  setAnnouncements: React.Dispatch<React.SetStateAction<AnnouncementBanner[]>>,
  showNotification: (message: string, type?: "success" | "error") => void,
) {
  const [newAnnText, setNewAnnText] = useState("");
  const [newAnnType, setNewAnnType] = useState<"info" | "warning" | "promo">("promo");

  const toggleAnnouncement = async (id: string, current: boolean) => {
    try {
      await api.updateAnnouncement(id, { is_active: !current });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !current } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addAnnouncement = async () => {
    if (!newAnnText.trim()) return;
    try {
      const ann: AnnouncementBanner = {
        id: `ann-${Date.now()}`,
        text: newAnnText.trim(),
        isActive: true,
        type: newAnnType,
      };
      await api.insertAnnouncement(ann);
      await publishChanges();
      setAnnouncements((prev) => [...prev, ann]);
      setNewAnnText("");
      showNotification("Duyuru eklendi.");
    } catch (err) {
      console.error(err);
    }
  };

  return {
    newAnnText, setNewAnnText,
    newAnnType, setNewAnnType,
    toggleAnnouncement, deleteAnnouncement, addAnnouncement,
  };
}
