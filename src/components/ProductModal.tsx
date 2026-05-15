import { MenuItem } from "@/lib/types";
import { AlertTriangle, X, ShieldAlert, BadgeInfo, Leaf, ImageOff } from "lucide-react";

import { useEffect, useState, useCallback } from "react";
import { cn, formatBrandText } from "@/lib/utils";
import { createPortal } from "react-dom";

export function ProductModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = useCallback(() => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
    } else {
      setImgError(true);
    }
  }, [retryCount]);

  const getImageSrc = useCallback((src: string) => {
    if (retryCount === 0) return src;
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}_r=${retryCount}`;
  }, [retryCount]);

  // Prevent background scrolling without jump
  useEffect(() => {
    setMounted(true);
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const uniqueVariants = item.variants?.filter((v, i, a) => 
    a.findIndex(t => (t.label === v.label && t.price === v.price)) === i
  );

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-black/40 sm:glass-card rounded-t-[calc(var(--base-radius)*2)] sm:rounded-[var(--base-radius)] shadow-[0_0_80px_rgba(0,0,0,0.9)] border-t sm:border border-white/[0.1] overflow-hidden flex flex-col h-[95vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 backdrop-blur-2xl">
        
        {/* Close Button Float */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-12 h-12 bg-black/40 hover:bg-black/70 backdrop-blur-xl rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 active:scale-90"
        >
          <X size={24} />
        </button>

        {/* Header Image Area */}
        <div className="relative w-full h-[60vh] sm:h-[50vh] bg-black/20 shrink-0 border-b border-white/[0.05] overflow-hidden">
          {item.image && !imgError ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <img 
                src={getImageSrc(item.image)} 
                alt={formatBrandText(item.name)} 
                className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                onError={handleImageError}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-red-950/10 to-black/40">
               {imgError ? (
                 <ImageOff size={48} className="text-neutral-600 mb-4" />
               ) : null}
               <h2 className="text-5xl font-black tracking-[0.4em] text-[var(--color-accent)]/10 uppercase">PICCHIO</h2>
               <div className="w-16 h-[1px] bg-[var(--color-accent)]/10 mt-6" />
            </div>
          )}
          {/* Subtle bottom fade to blend with content overlap */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
        </div>

        {/* Scrollable Content Area with Glassmorphism Overlay */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar relative z-20 -mt-24 sm:-mt-20 bg-black/60 backdrop-blur-[var(--glass-blur)] rounded-t-[calc(var(--base-radius)*2)] border-t border-white/[0.1] shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
           
           {/* Top Badges */}
           <div className="flex gap-2.5 flex-wrap mb-6">
             {item.isRecommended && (
               <span className="text-[12px] uppercase tracking-[0.2em] font-black bg-[var(--color-accent)] text-black px-3.5 py-1.5 rounded-sm shadow-lg">
                 {formatBrandText("Önerilen Seçim")}
               </span>
             )}
             {item.isSignature && (
               <span className="text-[12px] uppercase tracking-[0.2em] font-black bg-red-900/60 text-white px-3.5 py-1.5 border border-red-500/40 rounded-sm shadow-lg">
                 {formatBrandText("İmza Kokteyl")}
               </span>
             )}
             {!item.isAvailable && (
               <span className="text-[12px] uppercase tracking-[0.2em] font-black bg-red-950/80 text-red-200 px-3.5 py-1.5 border border-red-800 rounded-sm">
                 {formatBrandText("Geçici Süreyle Tükendi")}
               </span>
             )}
             {item.isVegan && (
               <span className="text-[12px] uppercase tracking-[0.2em] font-black bg-green-950/40 text-green-400 px-3.5 py-1.5 border border-green-500/30 rounded-sm flex items-center gap-2">
                 <Leaf size={12} /> {formatBrandText("VEGAN")}
               </span>
             )}
             {item.isVegetarian && (
               <span className="text-[12px] uppercase tracking-[0.2em] font-black bg-emerald-950/40 text-emerald-400 px-3.5 py-1.5 border border-emerald-500/30 rounded-sm flex items-center gap-2">
                 <Leaf size={12} /> {formatBrandText("VEJETARYEN")}
               </span>
             )}
           </div>

           {/* Title & Price */}
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
             <h1 className="text-3xl sm:text-4xl font-sans font-black text-white tracking-wide uppercase leading-tight">
               {formatBrandText(item.name)}
             </h1>
             {item.price !== undefined && (
               <span className="text-2xl sm:text-3xl font-sans font-black text-[#d4af37] shrink-0">
                 ₺{item.price}
               </span>
             )}
           </div>

           {/* Calories (Legal requirement) */}
           {item.calories && (
             <p className="text-[13px] text-amber-500/80 font-black tracking-[0.3em] uppercase mb-6 px-1 border-l-2 border-amber-500/30 ml-1">
               {item.calories} {formatBrandText("kcal")}
             </p>
           )}

           {/* Description */}
           {item.description && (
             <p className="text-base sm:text-lg text-gray-200 mb-10 leading-relaxed font-semibold italic opacity-90">
               {formatBrandText(item.description)}
             </p>
           )}

           {/* Tag Row (Taste Profile) */}
           {item.tags && item.tags.length > 0 && (
             <div className="flex flex-wrap gap-2.5 mb-10 pb-6 border-b border-white/[0.08]">
               {item.tags.map(tag => (
                 <span key={tag} className="text-[12px] uppercase tracking-[0.2em] text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-4 py-1.5 rounded-full font-black">
                   {formatBrandText(tag)}
                 </span>
               ))}
             </div>
           )}

           {/* Minimalist Details Grid */}
           {(item.ingredients || item.abv || item.volume || item.tasteIntensity || item.serviceStyle) && (
             <div className="mb-10">
               <h3 className="text-[13px] uppercase tracking-[0.25em] text-white/40 font-black mb-5 flex items-center gap-2.5">
                 <BadgeInfo size={16} /> {formatBrandText("İçerik Profili")}
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.1] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl">
                 
                 {item.ingredients && (
                   <div className={cn("p-5 bg-black/40 backdrop-blur-md flex flex-col justify-center", (!item.abv && !item.volume) ? "sm:col-span-2" : "col-span-1")}>
                     <span className="text-[11px] font-black uppercase text-gray-500 mb-2 tracking-widest">{formatBrandText("Malzemeler")}</span>
                     <span className="text-base text-gray-200 leading-snug font-bold">{formatBrandText(item.ingredients)}</span>
                    </div>
                  )}

                  {item.tasteIntensity && (
                    <div className="p-5 bg-black/40 backdrop-blur-md flex flex-col justify-center border-b border-white/[0.05]">
                      <span className="text-[11px] font-black uppercase text-gray-500 mb-2 tracking-widest">{formatBrandText("Tat Yoğunluğu")}</span>
                      <span className="text-base text-amber-500 font-black tracking-wide">{formatBrandText(item.tasteIntensity)}</span>
                    </div>
                  )}

                  {item.serviceStyle && (
                    <div className="p-5 bg-black/40 backdrop-blur-md flex flex-col justify-center border-b border-white/[0.05]">
                      <span className="text-[11px] font-black uppercase text-gray-500 mb-2 tracking-widest">{formatBrandText("Servis Şekli")}</span>
                      <span className="text-base text-blue-400 font-black uppercase tracking-tighter">{formatBrandText(item.serviceStyle)}</span>
                   </div>
                 )}

                 {item.volume && (
                   <div className="p-5 bg-black/40 backdrop-blur-md flex flex-col justify-center">
                     <span className="text-[11px] font-black uppercase text-gray-500 mb-2 tracking-widest">{formatBrandText("Servis Hacmi")}</span>
                     <span className="text-base text-gray-200 font-bold">{formatBrandText(item.volume)}</span>
                   </div>
                 )}

                 {item.abv && (
                   <div className="p-5 bg-black/40 backdrop-blur-md flex flex-col justify-center">
                     <span className="text-[11px] font-black uppercase text-gray-500 mb-2 tracking-widest">{formatBrandText("Alkol Oranı (ABV)")}</span>
                     <span className="text-base text-[#d4af37] font-black">% {item.abv}</span>
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* Variant Prices */}
           {uniqueVariants && uniqueVariants.length > 0 && (
             <div className="mb-10">
               <h3 className="text-[13px] uppercase tracking-[0.25em] text-white/40 font-black mb-5">{formatBrandText("Seçenekler")}</h3>
               <div className="flex flex-col gap-3">
                 {uniqueVariants.map((v, i) => (
                   <div key={i} className="flex justify-between items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-[#d4af37]/30 transition-colors group">
                     <span className="text-base text-gray-200 font-black tracking-wide uppercase">{formatBrandText(v.label)}</span>
                     <span className="text-lg text-[#d4af37] font-black bg-[#d4af37]/5 px-3 py-1 rounded-lg">₺{v.price}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Allergen Warning Banner (Improved for Legal Compliance) */}
           {(item.allergenDetails || item.allergens) && (
             <div className="mt-10 mb-6 flex items-start gap-5 bg-gradient-to-br from-red-950/40 to-black/60 border border-red-900/30 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
               <ShieldAlert className="text-orange-500 shrink-0 mt-1" size={28} strokeWidth={2} />
               <div>
                 <p className="text-[12px] font-black uppercase tracking-[0.3em] text-orange-500 mb-3">{formatBrandText("Yasal Alerjen Bilgisi")}</p>
                 <p className="text-[15px] text-gray-200 leading-relaxed font-bold">
                   {formatBrandText(item.allergenDetails || undefined) || (
                     <>{formatBrandText("Bu ürün")} <span className="font-black text-white underline decoration-orange-500/50">{formatBrandText((item.allergens ?? "").replace(/"/g, ""))}</span> {formatBrandText("içermektedir. Hassasiyetiniz varsa lütfen ekibimizle iletişime geçin.")}</>
                   )}
                 </p>
               </div>
             </div>
           )}
           
        </div>
      </div>
    </div>,
    document.body
  );
}

