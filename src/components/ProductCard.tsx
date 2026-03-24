"use client";
import { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { ProductModal } from "./ProductModal";

export function ProductCard({ item }: { item: MenuItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => item.isAvailable && setIsModalOpen(true)}
        className={cn(
          "flex flex-col text-left w-full relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden transition-all group",
          item.isAvailable ? "cursor-pointer hover:border-[#c9a84c]/30 hover:shadow-[0_0_15px_rgba(201,168,76,0.05)] active:scale-[0.98]" : "opacity-40 grayscale cursor-not-allowed"
        )}
      >
        {/* Image Section */}
        {item.image && (
          <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] bg-[#070101] border-b border-white/[0.05] overflow-hidden">
            <Image 
              src={item.image} 
              alt={item.name} 
              fill 
              className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
              sizes="(max-width: 640px) 50vw, 250px"
            />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0505] to-transparent pointer-events-none" />
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-3.5 sm:p-4 relative">
          
          {/* Header: Name + Price */}
          <div className="flex justify-between items-start w-full gap-2 mb-1.5">
            <h3 className="text-[13px] sm:text-sm font-sans font-bold text-[#e8dcc8] leading-tight tracking-wide uppercase group-hover:text-[#c9a84c] transition-colors">
              {item.name}
            </h3>
            {item.isAvailable && item.price !== undefined && (
              <span className="text-[#c9a84c] font-sans font-bold text-[13px] sm:text-sm whitespace-nowrap">
                ₺{item.price}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-[10px] sm:text-[11px] text-[#9a917e] mb-2.5 leading-relaxed line-clamp-2">{item.description}</p>
          )}

          {/* Tags (Minimal rendering on card) */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
              {item.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="text-[8px] uppercase tracking-[0.1em] text-[#8a8070] bg-white/[0.04] border border-white/[0.06] px-1.5 py-[3px] rounded font-medium">
                  {tag}
                </span>
              ))}
              {item.tags.length > 2 && (
                <span className="text-[8px] text-[#8a8070] bg-white/[0.02] px-1 rounded">+{item.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Unavailable overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center -m-0.5 rounded-xl backdrop-blur-[1px]">
              <span className="bg-red-900/80 text-white text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest rounded border border-red-500/20">Geçici Olarak Tükendi</span>
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
