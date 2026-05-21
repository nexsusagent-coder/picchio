"use client";

import { Campaign } from "@/lib/types";
import { Tag, Gift, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn, formatBrandText } from "@/lib/utils";
import { trackCampaignEvent } from "@/lib/api";

function useCountdown(endDate: string) {
  const calcRemaining = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins: Math.floor((diff / (1000 * 60)) % 60),
      secs: Math.floor((diff / 1000) % 60),
      totalMs: diff,
    };
  }, [endDate]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    setRemaining(calcRemaining());
    const id = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (!r) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [calcRemaining]);

  return remaining;
}

function CountdownBadge({ endDate }: { endDate: string }) {
  const remaining = useCountdown(endDate);

  if (!remaining) {
    return (
      <span className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600 text-white border border-red-400/40 animate-pulse">
        Sona Erdi
      </span>
    );
  }

  const isUrgent = remaining.totalMs < 1000 * 60 * 60; // < 1 hour
  const isWarning = remaining.totalMs < 1000 * 60 * 60 * 6; // < 6 hours

  if (remaining.days > 0) {
    return (
      <span className={cn(
        "absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5",
        isWarning ? "bg-amber-500/90 text-black" : "bg-white/10 text-white border border-white/20"
      )}>
        <Clock size={11} className={isWarning ? "text-black" : "text-amber-400"} />
        {remaining.days}g {remaining.hours}s {remaining.mins}d
      </span>
    );
  }

  return (
    <span className={cn(
      "absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5",
      isUrgent ? "bg-red-600 text-white animate-pulse" : isWarning ? "bg-amber-500/90 text-black" : "bg-white/10 text-white border border-white/20"
    )}>
      <Clock size={11} className={isUrgent ? "text-white" : isWarning ? "text-black" : "text-amber-400"} />
      {remaining.hours > 0 && `${remaining.hours}s `}{remaining.mins}d {remaining.secs}sn
    </span>
  );
}

/** Internal image cycler for a single campaign card */
function CampaignImageCycler({ images, alt, sizes }: { images: string[]; alt: string; sizes: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={images[index]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <img
          src={images[index]}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </motion.div>
    </AnimatePresence>
  );
}

function isCampaignVisible(c: Campaign): boolean {
  if (c.isActive === false) return false;
  const now = new Date();
  if (c.startDate) {
    const start = new Date(c.startDate);
    if (!isNaN(start.getTime()) && start > now) return false;
  }
  if (c.endDate) {
    const end = new Date(c.endDate);
    if (!isNaN(end.getTime()) && end < now) return false;
  }
  return true;
}

export function CampaignCarousel({ campaigns }: { campaigns: Campaign[] }) {
  const active = (campaigns || []).filter(c => c && isCampaignVisible(c));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track views for all active campaigns
  useEffect(() => {
    active.forEach(c => { trackCampaignEvent(c.id, "view"); });
  }, [active.map(c => c.id).join(",")]);

  useEffect(() => {
    if (active.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % active.length;
        if (scrollRef.current) {
          const container = scrollRef.current;
          const card = container.children[next] as HTMLElement | undefined;
          if (card) {
            const scrollLeft = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
          }
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(id);
  }, [active.length]);

  if (active.length === 0) return null;

  const isSingle = active.length === 1;

  return (
    <section className="mb-8 md:mb-10">
      {/* Title */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center shadow-lg shrink-0">
          <Tag size={16} className="text-white" />
        </div>
        <span className="text-[12px] font-black tracking-[0.3em] text-[#D4AF37] uppercase">{formatBrandText("Özel Fırsatlar")}</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 no-scrollbar py-6 -my-3",
          isSingle ? "justify-center px-4" : "overflow-x-auto snap-x snap-mandatory px-4"
        )}
      >
        {active.map(campaign => {
          const validImages = Array.isArray(campaign.imageUrls) 
            ? campaign.imageUrls.filter((url): url is string => typeof url === 'string' && url.length > 0)
            : [];

          return (
            <motion.div
              key={campaign.id}
              className={cn(
                "snap-start shrink-0 relative transition-all duration-300",
                isSingle ? "w-full" : "w-[300px] sm:w-[380px]"
              )}
            >
              <div
                className="relative rounded-[2.5rem] bg-black/20 glass-card h-full flex flex-row items-stretch overflow-hidden shadow-2xl"
                style={{ animation: 'gold-glow-pulse 4s infinite ease-in-out' }}
              >
                {/* Image Section — with internal cycling */}
                {validImages.length > 0 && (
                  <div className={cn(
                    "relative shrink-0",
                    isSingle ? "w-[45%] sm:w-1/2 min-h-[160px]" : "w-[45%] min-h-[160px]"
                  )}>
                    <CampaignImageCycler
                      images={validImages}
                      alt={formatBrandText(campaign.title || "Kampanya")}
                      sizes={isSingle ? "50vw" : "180px"}
                    />
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/40 to-transparent z-10" />
                  </div>
                )}

                {/* Content Section */}
                <div className={cn(
                  "p-4 sm:p-5 flex flex-col justify-center relative z-10 flex-1",
                  isSingle ? "items-center text-center" : "items-start text-left"
                )}>
                  {campaign.endDate && <CountdownBadge endDate={campaign.endDate} />}

                  <div className="flex items-center gap-2 mb-2">
                    {campaign.type === "bundle" ? (
                      <Gift size={14} className="text-[#D4AF37]" />
                    ) : (
                      <Zap size={14} className="text-[#D4AF37]" />
                    )}
                    <span className="text-[10px] text-[#D4AF37]/80 uppercase tracking-[0.2em] font-black">
                      {formatBrandText(campaign.type === "bundle" ? "Özel Paket" : "Sınırlı Teklif")}
                    </span>
                  </div>

                  <h3 className={cn(
                    "text-[#f5efe0] font-black uppercase tracking-wide leading-tight mb-2 drop-shadow-lg",
                    isSingle ? "text-base sm:text-xl" : "text-sm"
                  )}>
                    {formatBrandText(campaign.title || "Özel Teklif")}
                  </h3>
                  
                  {campaign.description && (
                    <p className={cn(
                      "text-gray-200 leading-relaxed mb-4 font-bold opacity-80",
                      isSingle ? "text-[12px] sm:text-[13px]" : "text-[11px] line-clamp-2"
                    )}>
                      {formatBrandText(campaign.description)}
                    </p>
                  )}

                  {(campaign.price !== undefined && campaign.price !== null) && (
                    <div className="mt-auto pt-1">
                      <div className="inline-flex items-center bg-white/5 border border-white/10 px-3.5 py-1 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                        <span className="text-[#D4AF37] font-black text-sm sm:text-base">₺{campaign.price}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Indicators */}
      {active.length > 1 && (
        <div className="flex justify-center gap-2.5 mt-3">
          {active.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-full transition-all duration-300 shadow-xl",
                idx === activeIndex ? "w-6 h-1.5 bg-[#D4AF37] shadow-[#D4AF37]/20" : "w-1.5 h-1.5 bg-white/10"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
