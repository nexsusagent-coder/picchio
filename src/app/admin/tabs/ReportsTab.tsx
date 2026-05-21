"use client";

import { MenuItem, Category } from "@/lib/types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Sparkles, Martini, ArrowUpDown } from "lucide-react";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

interface ReportsTabProps {
  analyticsSummary: {
    dailyStats: { date: string; views: number; clicks: number }[];
    topProductIds: { id: string; count: number }[];
    topCategoryIds: { id: string; count: number }[];
  } | null;
  items: MenuItem[];
  categories: Category[];
  loading: boolean;
}

export default function ReportsTab({ analyticsSummary, items, categories, loading }: ReportsTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Analiz ve Raporlar</h2>
          <p className="text-neutral-400 text-sm">Veriler yukleniyor...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!analyticsSummary) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-1">Analiz ve Raporlar</h2>
        <EmptyState title="Veri bulunamadi" description="Analitik verileri henuz toplanmadi veya bir hata olustu." />
      </div>
    );
  }

  const totalViews = analyticsSummary.dailyStats?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
  const totalClicks = analyticsSummary.dailyStats?.reduce((acc, curr) => acc + (curr.clicks || 0), 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Analiz ve Raporlar</h2>
          <p className="text-neutral-400 text-sm">Etkilesim verileri.</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-neutral-800/50 backdrop-blur-sm rounded-3xl border border-neutral-700 p-6">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-8">Gunluk Etkilesimler</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsSummary.dailyStats || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10}
                  tickFormatter={(val: string) => val.split('-').slice(1).reverse().join('/')} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line type="monotone" name="Goruntulenme" dataKey="views" stroke="#D4AF37" strokeWidth={3}
                  dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Tiklanma" dataKey="clicks" stroke="#4a0e0e" strokeWidth={3}
                  dot={{ fill: '#4a0e0e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f0404] rounded-3xl border border-[#4a0e0e]/30 p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={120} className="text-amber-500" />
          </div>
          <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2">Toplam Etkilesim</h3>
          <p className="text-4xl font-black text-white">{totalViews + totalClicks}</p>
          <div className="flex gap-4 mt-6">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Goruntulenme</p>
              <p className="text-lg font-bold text-white">{totalViews}</p>
            </div>
            <div className="w-[1px] h-10 bg-neutral-800" />
            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Tiklanma</p>
              <p className="text-lg font-bold text-white">{totalClicks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-800 rounded-3xl border border-neutral-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
              <Martini size={14} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">En Cok Incelenen Urunler</h3>
          </div>
          <div className="space-y-3">
            {analyticsSummary.topProductIds?.map((stat: { id: string; count: number }, idx: number) => {
              const item = items.find(i => i.id === stat.id);
              return (
                <div key={stat.id} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-2xl border border-neutral-800 group hover:border-amber-500/20 transition-colors">
                  <div className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-xs font-black rounded-lg text-neutral-500">#{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item?.name || 'Bilinmeyen Urun'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{categories.find(c => c.id === item?.categoryId)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-500">{stat.count}</p>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">Goruntulenme</p>
                  </div>
                </div>
              );
            })}
            {!analyticsSummary.topProductIds?.length && <p className="text-center py-6 text-neutral-600 text-sm italic">Henuz yeterli veri toplanmadi.</p>}
          </div>
        </div>

        <div className="bg-neutral-800 rounded-3xl border border-neutral-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#4a0e0e]/10 rounded-lg flex items-center justify-center border border-[#4a0e0e]/20">
              <ArrowUpDown size={14} className="text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">En Cok Incelenen Kategoriler</h3>
          </div>
          <div className="space-y-3">
            {analyticsSummary.topCategoryIds?.map((stat: { id: string; count: number }, idx: number) => {
              const cat = categories.find(c => c.id === stat.id);
              return (
                <div key={stat.id} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-2xl border border-neutral-800 hover:border-[#4a0e0e]/20 transition-colors">
                  <div className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-xs font-black rounded-lg text-neutral-500">#{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{cat?.name || 'Bilinmeyen Kategori'}</p>
                    <p className="text-[10px] text-neutral-500">Menude yogun ilgi goren bolum</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-red-500">{stat.count}</p>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">Ilgi Skoru</p>
                  </div>
                </div>
              );
            })}
            {!analyticsSummary.topCategoryIds?.length && <p className="text-center py-6 text-neutral-600 text-sm italic">Henuz yeterli veri toplanmadi.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
