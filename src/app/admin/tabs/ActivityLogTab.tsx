"use client";

import { useState, useEffect } from "react";
import { getActivityLog } from "@/lib/api";
import { ActivityLogEntry } from "@/lib/types";
import { ScrollText, Loader2 } from "lucide-react";
import { SkeletonTableRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";

const actionLabels: Record<string, string> = {
  product_created: "Urun eklendi",
  product_updated: "Urun guncellendi",
  product_deleted: "Urun silindi",
  campaign_created: "Kampanya eklendi",
  campaign_updated: "Kampanya guncellendi",
  campaign_deleted: "Kampanya silindi",
  category_created: "Kategori eklendi",
  category_updated: "Kategori guncellendi",
  category_deleted: "Kategori silindi",
  announcement_created: "Duyuru eklendi",
  announcement_deleted: "Duyuru silindi",
  settings_updated: "Ayarlar guncellendi",
  sort_order_updated: "Siralama guncellendi",
};

const entityColors: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  product: "info",
  campaign: "warning",
  category: "neutral",
  announcement: "success",
  settings: "warning",
  sort_order: "neutral",
};

const PAGE_SIZE = 15;

export default function ActivityLogTab() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getActivityLog(100)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const paged = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-1">Aktivite Gunlugu</h2>
        <p className="text-neutral-400 text-sm mb-6">Yakinda...</p>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ScrollText size={20} className="text-neutral-400" />
        <h2 className="text-2xl font-semibold">Aktivite Gunlugu</h2>
      </div>
      <p className="text-neutral-400 text-sm mb-6">Admin panelinde yapilan degisikliklerin kaydi.</p>

      {entries.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={48} className="opacity-40" />}
          title="Henuz aktivite kaydi yok"
          description="Degisiklik yaptikca burada gorunecek."
        />
      ) : (
        <>
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900/50 border-b border-neutral-700">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Tarih</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Kullanici</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Islem</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {paged.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-300">{entry.userEmail || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={entityColors[entry.entityType] || "neutral"}>
                          {entry.entityType}
                        </Badge>
                        <span className="text-xs text-white">{actionLabels[entry.action] || entry.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 max-w-[200px] truncate">
                      {entry.entityName || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
