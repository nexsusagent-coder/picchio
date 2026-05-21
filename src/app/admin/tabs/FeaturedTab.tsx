"use client";

import { MenuItem, Category } from "@/lib/types";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

interface FeaturedTabProps {
  items: MenuItem[];
  categories: Category[];
  onToggleRecommended: (id: string, current: boolean | undefined) => Promise<void>;
}

export default function FeaturedTab({ items, categories, onToggleRecommended }: FeaturedTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Gunun Onerileri Yonetimi</h2>
      <p className="text-neutral-400 text-sm mb-6">Menude one cikacak urunleri secin (Star ikonuyla isaretleyin).</p>

      {items.length === 0 ? (
        <EmptyState title="Henuz urun yok" description="Once urunler sekmesinden bir urun ekleyin." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(item => {
            const isRec = item.isRecommended;
            return (
              <button key={item.id} onClick={() => onToggleRecommended(item.id, isRec)}
                className={cn("flex items-center gap-3 p-4 rounded-xl border text-left transition-colors",
                  isRec ? "bg-amber-500/10 border-amber-500/30 text-white" : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600"
                )}>
                <Star size={16} className={isRec ? "text-amber-400 fill-amber-400" : "text-neutral-500"} />
                {item.image && (
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0">
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{categories.find((c: Category) => c.id === item.categoryId)?.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
