"use client";

import { MenuItem } from "@/lib/types";
import { AlertTriangle, X, ShieldAlert, BadgeInfo } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function ProductModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const uniqueVariants = item.variants?.filter((v, i, a) => 
    a.findIndex(t => (t.label === v.label && t.price === v.price)) === i
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end flex-col sm:flex-row sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0a0505] rounded-t-3xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/[0.05] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500">
        
        {/* Close Button Float */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10"
        >
          <X size={20} />
        </button>

        {/* Header Image Area */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video bg-[#1a0404] shrink-0 border-b border-white/[0.05]">
          {item.image ? (
            <Image 
              src={item.image} 
              alt={item.name} 
              fill 
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 600px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0404] to-[#0a0505]">
               <h2 className="text-4xl font-bold tracking-[0.3em] text-[#c9a84c]/20 uppercase">PICCHIO</h2>
               <div className="w-12 h-[1px] bg-[#c9a84c]/10 mt-4" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0505] to-transparent pointer-events-none" />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar relative">
           
           {/* Top Badges */}
           <div className="flex gap-2 flex-wrap mb-4">
             {item.isRecommended && (
               <span className="text-[10px] uppercase tracking-widest font-bold bg-amber-500 text-black px-2.5 py-1 rounded-sm">Önerilen Seçim</span>
             )}
             {item.isSignature && (
               <span className="text-[10px] uppercase tracking-widest font-bold bg-bordeaux-700 text-white px-2.5 py-1 rounded-sm">İmza Kokteyl</span>
             )}
             {!item.isAvailable && (
               <span className="text-[10px] uppercase tracking-widest font-bold bg-red-950/80 text-red-200 px-2.5 py-1 border border-red-900 rounded-sm">Geçici Süreyle Tükendi</span>
             )}
           </div>

           {/* Title & Price */}
           <div className="flex justify-between items-start gap-4 mb-4">
             <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-wide uppercase leading-tight">
               {item.name}
             </h1>
             {item.price !== undefined && (
               <span className="text-xl sm:text-2xl font-sans font-semibold text-[#c9a84c] shrink-0">
                 ₺{item.price}
               </span>
             )}
           </div>

           {/* Description */}
           {item.description && (
             <p className="text-sm sm:text-base text-gray-400 mb-8 leading-relaxed font-light">{item.description}</p>
           )}

           {/* Tag Row (Taste Profile) */}
           {item.tags && item.tags.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-white/[0.05]">
               {item.tags.map(tag => (
                 <span key={tag} className="text-[11px] uppercase tracking-widest text-[#c9a84c] bg-[#c9a84c]/5 border border-[#c9a84c]/20 px-3 py-1 rounded-full font-medium">
                   {tag}
                 </span>
               ))}
             </div>
           )}

           {/* Minimalist Details Grid */}
           {(item.ingredients || item.abv || item.volume) && (
             <div className="mb-8">
               <h3 className="text-xs uppercase tracking-[0.2em] text-[#8a8070] font-semibold mb-4 flex items-center gap-2">
                 <BadgeInfo size={14} /> İçerik Profili
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.05] rounded-xl overflow-hidden">
                 
                 {item.ingredients && (
                   <div className={cn("p-4 bg-[#0d0202] flex flex-col justify-center", (!item.abv && !item.volume) ? "sm:col-span-2" : "col-span-1")}>
                     <span className="text-[10px] uppercase text-gray-500 mb-1">Malzemeler</span>
                     <span className="text-sm text-gray-300 leading-snug">{item.ingredients}</span>
                   </div>
                 )}

                 {item.volume && (
                   <div className="p-4 bg-[#0d0202] flex flex-col justify-center">
                     <span className="text-[10px] uppercase text-gray-500 mb-1">Servis Hacmi</span>
                     <span className="text-sm text-gray-300">{item.volume}</span>
                   </div>
                 )}

                 {item.abv && (
                   <div className="p-4 bg-[#0d0202] flex flex-col justify-center">
                     <span className="text-[10px] uppercase text-gray-500 mb-1">Alkol Oranı (ABV)</span>
                     <span className="text-sm text-gray-300 font-semibold text-[#c9a84c]">% {item.abv}</span>
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* Variant Prices */}
           {uniqueVariants && uniqueVariants.length > 0 && (
             <div className="mb-8">
               <h3 className="text-xs uppercase tracking-[0.2em] text-[#8a8070] font-semibold mb-4">Seçenekler</h3>
               <div className="flex flex-col gap-2">
                 {uniqueVariants.map((v, i) => (
                   <div key={i} className="flex justify-between items-center bg-[#0d0202] border border-white/5 rounded-xl p-4">
                     <span className="text-sm text-gray-300 font-medium">{v.label}</span>
                     <span className="text-base text-[#c9a84c] font-semibold">₺{v.price}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Allergen Warning Banner */}
           {item.allergens && (
             <div className="mt-8 mb-4 flex items-start gap-4 bg-[#2a1700] border border-[#5c3300] rounded-xl p-5 shadow-2xl">
               <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={24} strokeWidth={1.5} />
               <div>
                 <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-500 mb-2">ALERJEN UYARISI</p>
                 <p className="text-[13px] text-gray-300 leading-relaxed">
                   Bu ürün <span className="font-bold text-white">{item.allergens}</span> içermektedir. Hassasiyetiniz varsa lütfen ekibimizle iletişime geçin.
                 </p>
               </div>
             </div>
           )}
           
        </div>
      </div>
    </div>
  );
}
