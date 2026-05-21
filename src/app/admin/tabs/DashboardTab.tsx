"use client";

import { MenuItem, Category } from "@/lib/types";
import { Package, Eye, Tag, TrendingUp, Plus, Megaphone, Martini } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface DashboardTabProps {
  items: MenuItem[];
  categories: Category[];
  analyticsSummary: {
    dailyStats: { date: string; views: number; clicks: number }[];
    topProductIds: { id: string; count: number }[];
    topCategoryIds: { id: string; count: number }[];
  } | null;
  activeCampaigns: number;
  loading: boolean;
  onNavigate: (tab: string) => void;
  onOpenAddProduct: () => void;
}

export default function DashboardTab({
  items, categories, analyticsSummary, activeCampaigns, loading, onNavigate, onOpenAddProduct,
}: DashboardTabProps) {
  const weeklyViews = analyticsSummary?.dailyStats?.reduce((acc, d) => acc + d.views, 0) || 0;
  const weeklyClicks = analyticsSummary?.dailyStats?.reduce((acc, d) => acc + d.clicks, 0) || 0;
  const activeProducts = items.filter(i => i.isAvailable).length;

  const avgPrice = items.length > 0
    ? items.reduce((sum, i) => sum + (i.price || 0), 0) / items.length
    : 0;
  const estimatedRevenue = Math.round(weeklyViews * avgPrice * 0.02);

  const metricCards = [
    { icon: <Package size={20} />, label: "Toplam Urun", value: items.length, sub: `${activeProducts} aktif`, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { icon: <Eye size={20} />, label: "Haftalik Goruntuleme", value: weeklyViews, sub: `${weeklyClicks} tiklanma`, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { icon: <Tag size={20} />, label: "Aktif Kampanya", value: activeCampaigns, sub: "ozel firsat", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { icon: <TrendingUp size={20} />, label: "Tahmini Gelir", value: `TL${estimatedRevenue.toLocaleString("tr-TR")}`, sub: "haftalik tahmini", color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/5", border: "border-[#D4AF37]/20" },
  ];

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Dashboard</h2>
        <p className="text-neutral-400 text-sm">Genel bakis ve hizli islemler</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className={cn(
            "bg-neutral-800 rounded-2xl border p-5 hover:border-neutral-600 transition-colors",
            card.border
          )}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", card.bg)}>
              <span className={card.color}>{card.icon}</span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mb-1">{card.label}</p>
            <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
            <p className="text-[10px] text-neutral-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Popular Products + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <div className="lg:col-span-2 bg-neutral-800 rounded-2xl border border-neutral-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Martini size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Bu Hafta En Populer Urunler</h3>
          </div>
          <div className="space-y-2">
            {analyticsSummary?.topProductIds?.slice(0, 5).map((stat: { id: string; count: number }, idx: number) => {
              const item = items.find(i => i.id === stat.id);
              return (
                <div key={stat.id} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800 hover:border-amber-500/20 transition-colors">
                  <div className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-xs font-black rounded-lg text-neutral-500">#{idx + 1}</div>
                  {item?.image && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item?.name || 'Bilinmeyen Urun'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{categories.find(c => c.id === item?.categoryId)?.name}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-500">{stat.count} goruntuleme</span>
                </div>
              );
            })}
            {!analyticsSummary?.topProductIds?.length && (
              <p className="text-center py-6 text-neutral-600 text-sm italic">Henuz yeterli veri toplanmadi.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Hizli Islemler</h3>
            <div className="space-y-3">
              <button onClick={onOpenAddProduct}
                className="w-full flex items-center gap-3 p-4 bg-[#4a0e0e]/10 border border-[#4a0e0e]/30 rounded-xl hover:bg-[#4a0e0e]/20 transition-colors text-left group">
                <div className="w-10 h-10 rounded-lg bg-[#4a0e0e]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Hizli Urun Ekle</p>
                  <p className="text-[10px] text-neutral-500">Yeni bir menu urunu olustur</p>
                </div>
              </button>
              <button onClick={() => onNavigate("announcements")}
                className="w-full flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 transition-colors text-left group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Megaphone size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Duyuru Olustur</p>
                  <p className="text-[10px] text-neutral-500">Yeni bir duyuru banneri ekle</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
