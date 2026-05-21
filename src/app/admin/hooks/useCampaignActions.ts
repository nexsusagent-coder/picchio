"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { Campaign } from "@/lib/types";
import { publishChanges } from "@/app/actions";

export function useCampaignActions(
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>,
  refresh: () => Promise<void>,
  showNotification: (message: string, type?: "success" | "error") => void,
) {
  const [newCampTitle, setNewCampTitle] = useState("");
  const [newCampDesc, setNewCampDesc] = useState("");
  const [newCampType, setNewCampType] = useState<Campaign["type"]>("discount");
  const [newCampPrice, setNewCampPrice] = useState("");
  const [newCampEndDate, setNewCampEndDate] = useState("");
  const [newCampStartDate, setNewCampStartDate] = useState("");
  const [newCampImageFiles, setNewCampImageFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [newCampImagePreviews, setNewCampImagePreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [savingCampaign, setSavingCampaign] = useState(false);

  const startEditCampaign = (camp: Campaign) => {
    setEditingCampaign(camp);
    setNewCampTitle(camp.title);
    setNewCampDesc(camp.description || "");
    setNewCampType(camp.type);
    setNewCampPrice(camp.price?.toString() || "");
    setNewCampEndDate(camp.endDate || "");
    setNewCampStartDate(camp.startDate || "");
    const previews: (string | null)[] = [null, null, null, null, null];
    if (camp.imageUrls) {
      camp.imageUrls.forEach((url, i) => { if (i < 5) previews[i] = url; });
    }
    setNewCampImagePreviews(previews);
    setNewCampImageFiles([null, null, null, null, null]);
  };

  const resetCampaignForm = () => {
    setEditingCampaign(null);
    setNewCampTitle("");
    setNewCampDesc("");
    setNewCampPrice("");
    setNewCampType("discount");
    setNewCampEndDate("");
    setNewCampStartDate("");
    setNewCampImageFiles([null, null, null, null, null]);
    setNewCampImagePreviews([null, null, null, null, null]);
  };

  const handleCampImageSelect = (file: File, index: number) => {
    const newFiles = [...newCampImageFiles];
    newFiles[index] = file;
    setNewCampImageFiles(newFiles);
    const newPreviews = [...newCampImagePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setNewCampImagePreviews(newPreviews);
  };

  const clearCampImage = (index: number) => {
    const nextPreviews = [...newCampImagePreviews];
    nextPreviews[index] = null;
    setNewCampImagePreviews(nextPreviews);
    const nextFiles = [...newCampImageFiles];
    nextFiles[index] = null;
    setNewCampImageFiles(nextFiles);
  };

  const saveCampaign = async () => {
    if (!newCampTitle.trim()) return;
    setSavingCampaign(true);
    try {
      const campId = editingCampaign ? editingCampaign.id : `camp-${Date.now()}`;
      const finalImageUrls: string[] = [];
      for (let i = 0; i < 5; i++) {
        const file = newCampImageFiles[i];
        const preview = newCampImagePreviews[i];
        if (file) {
          const url = await api.uploadCampaignImage(file, campId);
          finalImageUrls.push(url);
        } else if (preview && editingCampaign?.imageUrls?.[i]) {
          finalImageUrls.push(editingCampaign.imageUrls[i]);
        }
      }
      const campData = {
        title: newCampTitle.trim(),
        description: newCampDesc.trim() || null,
        type: newCampType,
        imageUrls: finalImageUrls,
        price: newCampPrice ? parseFloat(newCampPrice) : null,
        isActive: editingCampaign ? editingCampaign.isActive : true,
        startDate: newCampStartDate || null,
        endDate: newCampEndDate || null,
      };
      if (editingCampaign) {
        await api.updateCampaign(campId, {
          title: campData.title,
          description: campData.description as string | null,
          type: campData.type,
          image_urls: campData.imageUrls,
          price: campData.price,
          is_active: campData.isActive,
          start_date: campData.startDate || null,
          end_date: campData.endDate || null,
        });
      } else {
        await api.insertCampaign({ ...campData, id: campId } as Campaign);
      }
      await publishChanges();
      await refresh();
      resetCampaignForm();
      showNotification(editingCampaign ? "Kampanya guncellendi." : "Yeni kampanya eklendi.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen bir hata";
      console.error(err);
      showNotification(`Kampanya kaydedilemedi: ${msg}`, "error");
    } finally {
      setSavingCampaign(false);
    }
  };

  const toggleCampaign = async (id: string, current: boolean) => {
    try {
      await api.updateCampaign(id, { is_active: !current });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await api.deleteCampaign(id);
      await publishChanges();
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen sunucu hatasi.";
      console.error("Delete campaign error:", err);
      showNotification("Kampanya silinemedi: " + msg, "error");
    }
  };

  return {
    newCampTitle, setNewCampTitle, newCampDesc, setNewCampDesc,
    newCampType, setNewCampType, newCampPrice, setNewCampPrice,
    newCampEndDate, setNewCampEndDate, newCampStartDate, setNewCampStartDate,
    newCampImageFiles, newCampImagePreviews,
    editingCampaign,
    savingCampaign,
    startEditCampaign, resetCampaignForm,
    handleCampImageSelect, clearCampImage,
    saveCampaign, toggleCampaign, deleteCampaign,
  };
}
