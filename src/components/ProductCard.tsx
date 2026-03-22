"use client";
import { MenuItem } from "@/lib/types";
import { AlertTriangle, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export function ProductCard({ item }: { item: MenuItem }) {
  const [showAllergens, setShowAllergens] = useState(false);
  
  // Filter out exact duplicate variants that might have arisen from SQL data
  const uniqueVariants = item.variants?.filter((v, i, a) => 
    a.findIndex(t => (t.label === v.label && t.price === v.price)) === i
  );

  return (
    <div
      className={cn(
        "flex flex-col text-left w-full relative rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all",
        !item.isAvailable && "opacity-40 grayscale"
      )}
    >
      {/* Image Section */}
      {item.image && (
        <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] bg-[#070101] border-b border-white/[0.05]">
          <Image 
            src={item.image} 
            alt={item.name} 
            fill 
            className="object-cover opacity-80"
            sizes="(max-width: 640px) 50vw, 250px"
          />
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/90 to-transparent" />
        </div>
      )}

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Header: Name + Price */}
        <div className="flex justify-between items-start w-full gap-2 mb-1.5">
        <h3 className="text-[13px] sm:text-sm font-serif font-bold text-[#e8dcc8] leading-tight tracking-wide uppercase">
          {item.name}
        </h3>
        {item.isAvailable && item.price !== undefined && (
          <span className="text-[#c9a84c] font-serif font-bold text-[13px] sm:text-sm whitespace-nowrap">
            ₺{item.price}
          </span>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-[10px] sm:text-[11px] text-[#9a917e] mb-2.5 leading-relaxed">{item.description}</p>
      )}

      {/* Ingredients */}
      {item.ingredients && (
        <p className="text-[9px] sm:text-[10px] text-[#6b6358] italic mb-2 leading-relaxed line-clamp-2">{item.ingredients}</p>
      )}

      {/* Tags + Allergen Row */}
      <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
        {item.tags?.slice(0, 3).map((tag, idx) => (
          <span key={idx} className="text-[8px] uppercase tracking-[0.1em] text-[#8a8070] bg-white/[0.04] border border-white/[0.06] px-1.5 py-[3px] rounded font-medium">
            {tag}
          </span>
        ))}
        {item.allergens && item.allergens.length > 0 && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllergens(!showAllergens); }}
            className="text-amber-500/70 hover:text-amber-400 ml-auto flex items-center gap-1 text-[9px] bg-amber-500/10 px-1.5 py-0.5 rounded transition-colors active:scale-95"
          >
            <AlertTriangle size={9} /> 
            {showAllergens ? item.allergens.join(", ") : "Alerjen"}
          </button>
        )}
      </div>

      {/* Variants */}
      {uniqueVariants && uniqueVariants.length > 0 && (
        <div className="flex gap-x-4 gap-y-1 mt-2.5 flex-wrap w-full pt-2 border-t border-white/[0.05]">
          {uniqueVariants.map((v, i) => (
            <span key={i} className="text-[9px] sm:text-[10px] text-[#8a8070]">
              {v.label}: <span className="text-[#c9a84c] font-serif font-semibold">₺{v.price}</span>
            </span>
          ))}
        </div>
      )}

      {/* Unavailable overlay */}
      {!item.isAvailable && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center -m-0.5 rounded-xl backdrop-blur-[1px]">
          <span className="bg-red-900/80 text-white text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest rounded border border-red-500/20">Tükendi</span>
        </div>
      )}
      </div>
    </div>
  );
}
