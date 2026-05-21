"use client";

import { AnnouncementBanner } from "@/lib/types";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface AnnouncementsTabProps {
  announcements: AnnouncementBanner[];
  newAnnText: string;
  setNewAnnText: (v: string) => void;
  newAnnType: "info" | "warning" | "promo";
  setNewAnnType: (v: "info" | "warning" | "promo") => void;
  onAdd: () => Promise<void>;
  onToggle: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AnnouncementsTab({
  announcements, newAnnText, setNewAnnText, newAnnType, setNewAnnType,
  onAdd, onToggle, onDelete,
}: AnnouncementsTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Duyuru Banner Yonetimi</h2>
      <p className="text-neutral-400 text-sm mb-6">Musteri menusunde gosterilecek duyurulari buradan yonetin.</p>

      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 mb-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Plus size={14} /> Yeni Duyuru Ekle</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={newAnnText} onChange={e => setNewAnnText(e.target.value)}
            placeholder="Duyuru metni yazin..."
            className="flex-1 bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          <select value={newAnnType} onChange={e => setNewAnnType(e.target.value as "info" | "warning" | "promo")}
            className="bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            <option value="promo">Promosyon</option>
            <option value="info">Bilgi</option>
            <option value="warning">Uyari</option>
          </select>
          <button onClick={onAdd} className="bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap">Ekle</button>
        </div>
      </div>

      {announcements.length === 0 ? (
        <EmptyState title="Henuz duyuru eklenmedi" description="Yukaridaki formu kullanarak ilk duyuruyu ekleyin." />
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className={cn("flex items-center gap-4 bg-neutral-800 border rounded-xl px-5 py-4 transition-colors", ann.isActive ? "border-green-500/20" : "border-neutral-700 opacity-60")}>
              <div className="flex-1">
                <p className="text-sm">{ann.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={ann.type === "promo" ? "warning" : ann.type === "warning" ? "error" : "info"}>
                    {ann.type === "promo" ? "Promosyon" : ann.type === "warning" ? "Uyari" : "Bilgi"}
                  </Badge>
                  <Badge variant={ann.isActive ? "success" : "neutral"}>{ann.isActive ? "Aktif" : "Pasif"}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggle(ann.id, ann.isActive)} className={cn("p-2 rounded-lg transition", ann.isActive ? "text-amber-400 hover:bg-amber-400/10" : "text-green-400 hover:bg-green-400/10")}>
                  {ann.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
                <button onClick={() => onDelete(ann.id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
