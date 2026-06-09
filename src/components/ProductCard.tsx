"use client";
import { MenuItem } from "@/lib/types";
import { cn, formatBrandText } from "@/lib/utils";

import { useState, useCallback } from "react";
import { ProductModal } from "./ProductModal";
import { AlertTriangle, ImageOff } from "lucide-react";
import * as api from "@/lib/api";

export function ProductCard({ item }: { item: MenuItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const uniqueVariants = item.variants?.filter((v, i, a) => 
    a.findIndex(t => (t.label === v.label && t.price === v.price)) === i
  );

  const handleImageError = useCallback(() => {
    if (retryCount < 2) {
      // Retry up to 2 times with a cache-busting param
      setRetryCount(prev => prev + 1);
    } else {
      setImgError(true);
    }
  }, [retryCount]);

  // Append cache-busting query param on retry
  const getImageSrc = useCallback((src: string) => {
    if (retryCount === 0) return src;
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}_r=${retryCount}`;
  }, [retryCount]);

  return (
    <>
      <div
        onClick={() => {
          if (item.isAvailable) {
            setIsModalOpen(true);
            api.trackEvent('view', { productId: item.id, categoryId: item.categoryId });
          }
        }}
        className={cn(
          "flex flex-col text-left w-full relative overflow-hidden transition-all group",
          "rounded-[var(--base-radius)] border border-white/[0.08] bg-white/[0.03] backdrop-blur-[var(--glass-blur)]",
          item.isAvailable ? "cursor-pointer hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_24px_rgba(201,168,76,0.15)] active:scale-[0.98]" : "opacity-40 grayscale cursor-not-allowed"
        )}
      >
        {/* Image Section */}
        {item.image && !imgError && (
          <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] bg-black/20 border-b border-white/[0.05] overflow-hidden">
            <img
              src={getImageSrc(item.image)}
              alt={formatBrandText(item.name)}
              width={672}
              height={224}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
              onError={handleImageError}
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        )}
        {item.image && imgError && (
          <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border-b border-white/[0.05] overflow-hidden flex items-center justify-center">
            <ImageOff size={28} className="text-neutral-600" />
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4 sm:p-5 relative">
          
          {/* Header: Name + Price */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start w-full gap-1.5 sm:gap-3 mb-2.5">
            <h3 className="text-[14px] sm:text-base font-sans font-extrabold text-[#f5efe0] leading-tight tracking-wide uppercase group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 flex-wrap min-w-0">
              {formatBrandText(item.name)}
              {item.isFavorite && (
                <span className="text-[8px] sm:text-[9px] bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/40 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-tighter font-black shrink-0">
                  {formatBrandText("Müşteri Favorisi")}
                </span>
              )}
            </h3>
            {item.isAvailable ? (
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
                <div className="flex items-center gap-1.5 flex-wrap justify-start sm:justify-end">
                   {item.price !== undefined && item.price !== null && item.price > 0 && (
                     <div className="flex items-center gap-1.5">
                        {item.priceLabel && <span className="text-[10px] sm:text-[11px] text-[#aaa090] uppercase tracking-tighter font-extrabold">{formatBrandText(item.priceLabel)}:</span>}
                        <span className="text-[var(--color-accent)] font-sans font-black text-[13px] sm:text-base whitespace-nowrap">
                          ₺{item.price}
                        </span>
                     </div>
                   )}
                   {item.priceSecondary !== undefined && item.priceSecondary !== null && item.priceSecondary > 0 && (
                     <>
                        <span className="text-white/20 text-xs hidden sm:inline">|</span>
                        <div className="flex items-center gap-1.5">
                           {item.priceSecondaryLabel && <span className="text-[10px] sm:text-[11px] text-[#aaa090] uppercase tracking-tighter font-extrabold">{formatBrandText(item.priceSecondaryLabel)}:</span>}
                           <span className="text-[var(--color-accent)] font-sans font-black text-[13px] sm:text-base whitespace-nowrap">
                             ₺{item.priceSecondary}
                           </span>
                        </div>
                     </>
                   )}
                </div>
                {!item.price && !item.priceSecondary && (uniqueVariants && uniqueVariants.length > 0) && (
                   <span className="text-[var(--color-accent)] font-sans font-black text-[13px] sm:text-base whitespace-nowrap shadow-[#d4af37]/10">
                    ₺{Math.min(...uniqueVariants.map(v => v.price))} +
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-[12px] sm:text-[13px] text-[#b5ad9a] font-semibold mb-3.5 leading-relaxed line-clamp-2">
              {formatBrandText(item.description)}
            </p>
          )}

          {/* Tags (Minimal rendering on card) */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-auto pt-1 mb-3">
              {item.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="text-[10px] uppercase tracking-[0.1em] text-[#b5ae9b] bg-white/[0.06] border border-white/[0.1] px-2 py-1 rounded font-black shadow-sm">
                  {formatBrandText(tag)}
                </span>
              ))}
              {item.tags.length > 2 && (
                <span className="text-[10px] text-[#8a8070] bg-white/[0.04] px-1.5 py-0.5 rounded font-black">+{item.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Legal/Dietary Footer row (Calories & Allergen) */}
          <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-2">
              {item.calories && (
                <span className="text-[11px] text-gray-500 font-black tracking-tighter opacity-90 uppercase">
                  {item.calories} {formatBrandText("kcal")}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {(item.allergenDetails || item.allergens) && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.15)]">
                   <AlertTriangle size={10} className="text-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* Unavailable overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center -m-1 rounded-xl backdrop-blur-[2px] z-50">
              <span className="bg-red-950/90 text-white text-[10px] font-black px-3.5 py-1.5 uppercase tracking-[0.2em] rounded border border-red-500/30 shadow-2xl">
                {formatBrandText("Geçici Olarak Tükendi")}
              </span>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ProductModal item={item} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
