"use client";

import { useRef } from "react";
import { Campaign, SiteSettings } from "@/lib/types";
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface CampaignsTabProps {
  campaigns: Campaign[];
  newCampTitle: string;
  setNewCampTitle: (v: string) => void;
  newCampDesc: string;
  setNewCampDesc: (v: string) => void;
  newCampType: Campaign["type"];
  setNewCampType: (v: Campaign["type"]) => void;
  newCampPrice: string;
  setNewCampPrice: (v: string) => void;
  newCampEndDate: string;
  setNewCampEndDate: (v: string) => void;
  newCampStartDate: string;
  setNewCampStartDate: (v: string) => void;
  newCampImageFiles: (File | null)[];
  newCampImagePreviews: (string | null)[];
  editingCampaign: Campaign | null;
  savingCampaign: boolean;
  onStartEdit: (camp: Campaign) => void;
  onReset: () => void;
  onImageSelect: (file: File, index: number) => void;
  onClearImage: (index: number) => void;
  onSave: () => Promise<void>;
  onToggle: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function getCampaignStatus(camp: Campaign): { label: string; variant: "success" | "warning" | "neutral" } {
  const now = new Date();
  const start = camp.startDate ? new Date(camp.startDate) : null;
  const end = camp.endDate ? new Date(camp.endDate) : null;

  if (start && now < start) return { label: "Bekliyor", variant: "warning" };
  if (end && now > end) return { label: "Sona Erdi", variant: "neutral" };
  if (camp.isActive) return { label: "Aktif", variant: "success" };
  return { label: "Pasif", variant: "neutral" };
}

export default function CampaignsTab({
  campaigns,
  newCampTitle, setNewCampTitle, newCampDesc, setNewCampDesc,
  newCampType, setNewCampType, newCampPrice, setNewCampPrice,
  newCampEndDate, setNewCampEndDate, newCampStartDate, setNewCampStartDate,
  newCampImageFiles, newCampImagePreviews,
  editingCampaign, savingCampaign,
  onStartEdit, onReset, onImageSelect, onClearImage,
  onSave, onToggle, onDelete,
}: CampaignsTabProps) {
  const confirm = useConfirm();

  const handleDelete = async (camp: Campaign) => {
    const ok = await confirm({
      title: "Kampanyayi Sil",
      message: `"${camp.title}" kampanyasini silmek istediginize emin misiniz?`,
      variant: "danger",
      confirmLabel: "Sil",
    });
    if (ok) await onDelete(camp.id);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Kampanya Yonetimi</h2>
      <p className="text-neutral-400 text-sm mb-6">Ana menu sayfasindaki "Ozel Firsatlar" alanini buradan yonetin.</p>

      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 mb-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          {editingCampaign ? <Edit3 size={14} /> : <Plus size={14} />}
          {editingCampaign ? "Kampanyayi Duzenle" : "Yeni Kampanya Ekle"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-neutral-400 mb-3 block">Kampanya Gorselleri / GIF (Maks. 5)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map(idx => (
                <div key={idx} className="flex flex-col gap-2">
                  {newCampImagePreviews[idx] ? (
                    <div className="relative aspect-[2/1] rounded-xl overflow-hidden border border-neutral-600 bg-neutral-900 group">
                      <img src={newCampImagePreviews[idx]!} alt={`Preview ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                      <button onClick={() => onClearImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-[2/1] rounded-xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center bg-neutral-900/50 cursor-pointer hover:border-neutral-500 transition-colors">
                      <ImagePlus size={20} className="text-neutral-600 mb-1" />
                      <span className="text-[10px] text-neutral-500">Gorsel {idx + 1}</span>
                      <input type="file" accept="image/*,.gif" className="hidden" onChange={e => { if (e.target.files?.[0]) onImageSelect(e.target.files[0], idx); }} />
                    </label>
                  )}
                  {newCampImagePreviews[idx] && (
                    <label className="cursor-pointer text-center py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors">
                      <span className="text-[10px] text-neutral-300 font-medium">Degistir</span>
                      <input type="file" accept="image/*,.gif" className="hidden" onChange={e => { if (e.target.files?.[0]) onImageSelect(e.target.files[0], idx); }} />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-neutral-500 mt-2 italic">* .gif formati desteklenir. Hareketli gorseller PWA'da otomatik oynatilir.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-neutral-400 mb-1 block">Kampanya Basligi *</label>
            <input type="text" value={newCampTitle} onChange={e => setNewCampTitle(e.target.value)}
              placeholder="Or: 1+1 Shot Kampanyasi"
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-neutral-400 mb-1 block">Aciklama</label>
            <input type="text" value={newCampDesc} onChange={e => setNewCampDesc(e.target.value)}
              placeholder="Or: Her shot alana ikincisi bedava!"
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Kampanya Tipi</label>
            <select value={newCampType} onChange={e => setNewCampType(e.target.value as Campaign["type"])}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
              <option value="discount">Indirim</option>
              <option value="bundle">Paket Teklif</option>
              <option value="animated">Animasyonlu (1+1 vb.)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Fiyat (TL)</label>
            <input type="number" value={newCampPrice} onChange={e => setNewCampPrice(e.target.value)}
              placeholder="Or: 350"
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Baslangic Tarihi (opsiyonel)</label>
            <input type="datetime-local" value={newCampStartDate}
              onChange={e => setNewCampStartDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e] [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Bitis Tarihi (FOMO, opsiyonel)</label>
            <input type="datetime-local" value={newCampEndDate} onChange={e => setNewCampEndDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e] [color-scheme:dark]" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          {editingCampaign && (
            <button onClick={onReset} className="flex-1 border border-neutral-600 text-neutral-300 px-5 py-2.5 rounded-xl text-sm font-medium transition hover:bg-neutral-700">Iptal</button>
          )}
          <button onClick={onSave} disabled={savingCampaign}
            className={cn("bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2", editingCampaign ? "flex-1" : "w-full")}>
            {savingCampaign && <Loader2 size={14} className="animate-spin" />}
            {editingCampaign ? "Degisiklikleri Kaydet" : "Kampanyayi Ekle"}
          </button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState title="Henuz kampanya eklenmedi" description="Yukaridaki formu kullanarak ilk kampanyayi olusturun." />
      ) : (
        <div className="space-y-3">
          {campaigns.map(camp => {
            const status = getCampaignStatus(camp);
            return (
              <div key={camp.id} className={cn(
                "flex items-start gap-4 bg-neutral-800 border rounded-xl px-5 py-4 transition-colors",
                camp.isActive ? "border-[#D4AF37]/20" : "border-neutral-700 opacity-60"
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{camp.title}</p>
                    <Badge variant={camp.type === "animated" ? "warning" : camp.type === "bundle" ? "info" : "info"}>
                      {camp.type === "animated" ? "Animasyonlu" : camp.type === "bundle" ? "Paket" : "Indirim"}
                    </Badge>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {(camp.viewCount ?? 0) > 0 && (
                      <span className="text-[10px] text-neutral-500">{camp.viewCount} goruntuleme</span>
                    )}
                  </div>
                  {camp.description && <p className="text-xs text-neutral-400 mt-1">{camp.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {camp.price !== undefined && <span className="text-[#D4AF37] text-xs font-semibold">TL{camp.price}</span>}
                    {camp.endDate && <span className="text-[10px] text-orange-400">Bitis: {new Date(camp.endDate).toLocaleString("tr-TR")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onStartEdit(camp)} className="text-white hover:bg-neutral-700 p-2 rounded-lg transition" title="Duzenle"><Edit3 size={18} /></button>
                  <button onClick={() => onToggle(camp.id, camp.isActive)}
                    className={cn("p-2 rounded-lg transition", camp.isActive ? "text-amber-400 hover:bg-amber-400/10" : "text-green-400 hover:bg-green-400/10")}>
                    {camp.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => handleDelete(camp)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition" title="Sil"><Trash2 size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
