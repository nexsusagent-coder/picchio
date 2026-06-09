"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import * as api from "@/lib/api";
import { MenuItem, Category, AnnouncementBanner, SiteSettings, Campaign } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

import Link from "next/link";
import { Search, SlidersHorizontal, ChevronRight, Check, Megaphone, X, AlertTriangle, Sparkles, Martini, Beer, GlassWater, Leaf, Citrus, Flame, Wine, CupSoda, Coffee, UtensilsCrossed } from "lucide-react";
import { cn, formatBrandText } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CampaignCarousel } from "@/components/CampaignCarousel";
import { Footer } from "@/components/Footer";
import { initialData } from "@/data/db";

// Helper for premium icons
const getCategoryIcon = (name: string) => {
  const upper = name.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
  const iconProps = { size: 20, className: "text-[#D4AF37]", strokeWidth: 1.25 };
  
  if (upper.includes("CLASSIC KOKTEYL") || upper.includes("KLASİK") || upper.includes("ÖZEL") || upper.includes("İMZA") || upper.includes("SPECIAL")) return <Martini {...iconProps} />;
  if (upper.includes("FIÇI") || upper.includes("FICI")) return <Beer {...iconProps} />;
  if (upper.includes("ŞİŞE BİRALAR") || upper.includes("SISE BIRALAR")) return <Beer {...iconProps} />;
  if (upper.includes("WHISKEY")) return <GlassWater {...iconProps} />;
  if (upper.includes("VOTKA")) return <GlassWater {...iconProps} />;
  if (upper.includes("GIN") || upper.includes("CİN")) return <Leaf {...iconProps} />;
  if (upper.includes("ROM") || upper.includes("COGNAC") || upper.includes("KONYAK")) return <Martini {...iconProps} />;
  if (upper.includes("LİKÖR") || upper.includes("LIKOR") || upper.includes("VERMUT")) return <Citrus {...iconProps} />;
  if (upper.includes("SHOT")) return <GlassWater size={20} className="text-[#D4AF37] scale-75" strokeWidth={1.25} />;
  if (upper.includes("ALKOLLÜ SICAK")) return <Flame {...iconProps} />;
  if (upper.includes("ŞARAP") || upper.includes("SARAP")) return <Wine {...iconProps} />;
  if (upper.includes("MOKTEYL")) return <CupSoda {...iconProps} />;
  if (upper.includes("SICAK İÇECEKLER") || upper.includes("SOFT")) return <Coffee {...iconProps} />;
  if (upper.includes("YEMEK") || upper.includes("ÇEREZ")) return <UtensilsCrossed {...iconProps} />;
  
  return <GlassWater {...iconProps} />;
};

const TASTE_FILTERS = [
  { id: "all", label: "Tümü", icon: "🍹" },
  { id: "Alkollü", label: "Alkollü", icon: "🥂" },
  { id: "Alkolsüz", label: "Alkolsüz", icon: "🥤" },
];

const TASTE_PROFILES = [
  { id: "Tatlı", label: "Tatlı", icon: "🍓" },
  { id: "Ekşi", label: "Ekşi", icon: "🍋" },
  { id: "Acı", label: "Acı", icon: "🌶️" },
  { id: "Bitter", label: "Bitter", icon: "🫒" },
  { id: "Sert", label: "Sert", icon: "🥃" },
  { id: "Ferah", label: "Ferah", icon: "🧊" },
  { id: "Meyveli", label: "Meyveli", icon: "🍊" },
  { id: "Kahveli", label: "Kahveli", icon: "☕" },
  { id: "Baharatlı", label: "Baharatlı", icon: "🔥" },
];

const ALLERGEN_FILTERS = [
  { id: "Glüten", label: "Glüten", icon: "🌾" },
  { id: "Süt Ürünleri", label: "Süt Ürünleri", icon: "🥛" },
  { id: "Kabuklu Yemişler", label: "Kabuklu Yemişler", icon: "🥜" },
  { id: "Yumurta", label: "Yumurta", icon: "🥚" },
  { id: "Sülfitler", label: "Sülfitler", icon: "🧪" },
  { id: "Susam", label: "Susam", icon: "🫘" },
];

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const [allergenExclusions, setAllergenExclusions] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementBanner[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentAnnIndex, setCurrentAnnIndex] = useState(0);
  const [recommendedIndex, setRecommendedIndex] = useState(0);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, items, anns, sets, camps] = await Promise.all([
          api.getCategories(),
          api.getItems(),
          api.getAnnouncements(),
          api.getSiteSettings(),
          api.getCampaigns(),
        ]);
        setCategories(cats);
        setAllItems(items);
        setAnnouncements(anns);
        setSiteSettings(sets);
        setCampaigns(camps);
      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recommendedItems = useMemo(() => allItems.filter(i => i.isRecommended && i.isAvailable), [allItems]);
  const activeAnnouncements = useMemo(() => announcements.filter(a => a.isActive), [announcements]);
  
  // Rotating announcement effect
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentAnnIndex(prev => (prev + 1) % activeAnnouncements.length);
    }, 4000); // Rotate every 4 seconds
    
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  // Recommended items auto-scroll effect
  useEffect(() => {
    if (recommendedItems.length <= 1) return;
    
    const id = setInterval(() => {
      setRecommendedIndex(prev => {
        const next = (prev + 1) % recommendedItems.length;
        if (recommendedScrollRef.current) {
          const container = recommendedScrollRef.current;
          const card = container.children[next] as HTMLElement | undefined;
          if (card) {
            const scrollLeft = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
          }
        }
        return next;
      });
    }, 4500);
    
    return () => clearInterval(id);
  }, [recommendedItems.length]);

  // Body Scroll Lock for Modals/Categories
  useEffect(() => {
    const isLocked = !!selectedCategoryId || isFilterModalOpen;
    if (isLocked) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [selectedCategoryId, isFilterModalOpen]);

  const currentAnnouncement = activeAnnouncements[currentAnnIndex];
  const toggleFilter = (tagId: string) => {
    if (tagId === "all") {
      setActiveFilters(["all"]);
      return;
    }
    setActiveFilters(prev => {
      const next = prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev.filter(t => t !== "all"), tagId];
      if (next.length === 0) return ["all"];
      return next;
    });
  };

  const toggleAllergen = (allergen: string) => {
    setAllergenExclusions(prev => 
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const filteredCategories = useMemo(() => {
    return categories.map(cat => {
      let items = allItems.filter(item => item.categoryId === cat.id);
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(q) || 
          i.ingredients?.toLowerCase().includes(q) || 
          i.description?.toLowerCase().includes(q)
        );
      }
      
      if (!activeFilters.includes("all")) {
        items = items.filter(i => activeFilters.some(tag => i.tags?.includes(tag) || (tag === "Alkolsüz" && i.categoryId === "c14")));
      }

      // Exclude items with selected allergens
      if (allergenExclusions.length > 0) {
        items = items.filter(i => {
          if (!i.allergens || i.allergens.length === 0) return true;
          return !allergenExclusions.some(exc => i.allergens?.includes(exc));
        });
      }

      return { ...cat, items };
    }).filter(cat => cat.items.length > 0);
  }, [categories, allItems, searchQuery, activeFilters, allergenExclusions]);

  const isFiltering = searchQuery.length > 0 || !activeFilters.includes("all") || allergenExclusions.length > 0;
  const activeFilterCount = (activeFilters.includes("all") ? 0 : activeFilters.length) + allergenExclusions.length;
  
  return (
    <div className="flex flex-col w-full max-w-md mx-auto relative px-4 sm:px-0 pb-32">

      <div className="relative z-10 w-full mx-auto pt-2">

        {/* Announcement Carousel (Single Container) */}
        {activeAnnouncements.length > 0 && (
          <div className="relative h-[52px] mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAnnouncement?.id || 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "absolute inset-0 flex items-center gap-3 px-4",
                  currentAnnouncement?.type === "promo" ? "text-amber-100" :
                  currentAnnouncement?.type === "warning" ? "text-amber-300" :
                  "text-gray-200"
                )}
              >
                <div className="shrink-0 flex items-center justify-center">
                  <Megaphone size={16} className="opacity-80 animate-pulse text-[#D4AF37]" />
                </div>
                <p className="text-[11px] font-medium flex-1 leading-tight line-clamp-2 pr-6">
                  {currentAnnouncement?.text}
                </p>
                <button 
                  onClick={() => {
                    // If dismissed, we might just hide the whole container for the session or move to next
                    // For now, let's keep it clean as a rotating marquee
                  }} 
                  className="opacity-20 hover:opacity-100 transition-opacity absolute right-4"
                >
                  {/* Subtle close icon removed to keep fixed height clean as requested */}
                </button>
              </motion.div>
            </AnimatePresence>
            
            {/* Minimal Dot Indicators for multiple banners */}
            {activeAnnouncements.length > 1 && (
              <div className="absolute bottom-1 w-full flex justify-center gap-1.5 pointer-events-none">
                {activeAnnouncements.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "w-1 h-1 rounded-full transition-all duration-300",
                      idx === currentAnnIndex ? "bg-[#D4AF37] w-2" : "bg-white/20"
                    )} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Top Mini Nav removed as requested - Admin remains accessible via direct URL */}

        {/* Hero Section - Refined Minimalist Design (No Boundaries) */}
        <header className={cn(
          "flex flex-col items-center justify-center w-full overflow-hidden relative mb-6 transition-all duration-700",
          "h-[300px] sm:h-[450px] md:h-[550px]",
          "bg-transparent"
        )}>
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
             {/* Large Floating & Shimmering Logo */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ 
                   opacity: 1, 
                   scale: 1,
                   y: [0, -15, 0],
                   rotate: [0, 0.5, -0.5, 0]
                 }}
                 transition={{ 
                   opacity: { duration: 1 },
                   scale: { duration: 1 },
                   y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                   rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                 }}
                 className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 flex items-center justify-center p-4"
               >
                  <img
                     src={siteSettings?.hero_logo_url || "/logo.png"}
                     alt="Picchio Logo"
                     width={384}
                     height={384}
                     fetchPriority="high"
                     style={{
                       filter: "drop-shadow(0 0 15px rgba(212, 175, 55, 0.5))",
                       mixBlendMode: "screen"
                     }}
                     className="absolute inset-0 w-full h-full object-contain"
                   />
               </motion.div>

             {/* Strike Premium Menu Title */}
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="mt-6 md:mt-10 text-center"
             >
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-sans font-black tracking-[0.3em] uppercase text-gold-glow leading-tight px-4 drop-shadow-2xl">
                  {formatBrandText(siteSettings?.menu_title || "PREMIUM COCKTAIL BAR MENÜSÜ")}
                </h2>
                
                <div className="mt-6 flex items-center justify-center">
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
                </div>
             </motion.div>
          </div>
        </header>

        {/* Search & Filter Row */}
        <div className="flex gap-2 mb-6 md:mb-10 w-full overflow-hidden">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={formatBrandText("Kokteyl, malzeme veya içerik ara...")} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 md:h-14 text-base md:text-lg rounded-xl bg-black/20 border border-white/10 px-4 pl-11 text-gray-200 placeholder:text-gray-500 focus:outline-none transition-colors shadow-inner font-bold backdrop-blur-sm"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className={cn(
              "h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-xl flex items-center justify-center transition border relative backdrop-blur-sm",
              activeFilterCount > 0 ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]" : "bg-black/20 border-white/10 text-gray-400 hover:text-white"
            )}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-[10px] text-black font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* ========== KAMPANYALAR CAROUSEL ========== */}
        {!isFiltering && <CampaignCarousel campaigns={campaigns} />}

        {/* ========== PREMIUM GÜNÜN ÖNERİLERİ ========== */}
        {!isFiltering && recommendedItems.length > 0 && (
          <section className="mb-6 md:mb-10">
            <div className="flex items-center gap-3 mb-5 md:mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-xl">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-[15px] font-black text-white uppercase tracking-widest">{formatBrandText("Günün Önerileri")}</h2>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">{formatBrandText("Barmenlerimizin bugünkü seçimleri")}</p>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
            </div>
            
            <div 
              ref={recommendedScrollRef}
              className="flex gap-5 overflow-x-auto py-4 no-scrollbar snap-x snap-mandatory px-2 w-full"
            >
              {recommendedItems.map(item => (
                <div key={item.id} className="snap-center shrink-0 w-52 sm:w-72">
                  <div className="rounded-[2rem] overflow-hidden group hover:shadow-amber-900/40 transition-shadow glass-card" style={{ animation: 'gold-glow-pulse-soft 3s infinite ease-in-out' }}>
                    {item.image && (
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                           src={item.image}
                           alt={formatBrandText(item.name)}
                           width={400}
                           height={300}
                           className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                           loading="lazy"
                           decoding="async"
                         />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0202] via-transparent to-transparent opacity-80" />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="bg-amber-500 text-[9px] text-black font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">{formatBrandText("Önerilen")}</span>
                        </div>
                        {item.price && (
                          <span className="absolute bottom-2.5 right-2.5 bg-black/40 text-amber-400 text-sm font-black px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
                            ₺{item.price}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-4 bg-gradient-to-b from-[#0d0202] to-transparent">
                      <h3 className="text-white font-sans font-black text-base uppercase tracking-wide group-hover:text-amber-500 transition-colors">{formatBrandText(item.name)}</h3>
                      {item.description && (
                        <p className="text-gray-400 text-[12px] mt-2 leading-relaxed font-semibold line-clamp-2">{formatBrandText(item.description)}</p>
                      )}
                      {item.ingredients && (
                        <p className="text-gray-500 text-[10px] mt-2 italic font-bold line-clamp-1">{formatBrandText(item.ingredients)}</p>
                      )}
                      <div className="flex gap-1.5 mt-3.5 flex-wrap">
                        {item.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/10 font-black">{formatBrandText(tag)}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Indicators */}
            {recommendedItems.length > 1 && (
              <div className="flex justify-center gap-2 mt-2">
                {recommendedItems.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      idx === recommendedIndex ? "w-4 h-1 bg-amber-500" : "w-1 h-1 bg-white/10"
                    )}
                  />
                ))}
              </div>
            )}
          </section>
        )}
        
        {/* ========== PICCHIO SPECIAL''S & APERITIFS SECTION ========== */}
        {!isFiltering && categories.some(c => c.id === 'c11') && (
          <section className="mb-10 px-1">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-sans text-gold-400 font-black tracking-[0.3em] uppercase text-center drop-shadow-lg">
                {formatBrandText("PICCHIO SPECIALS & APERITIFS")}
              </h2>
              <div className="w-20 h-[1px] bg-gold-600/40 mt-4" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {allItems
                .filter(i => i.categoryId === 'c11' && i.isAvailable)
                .map(item => (
                  <ProductCard key={item.id} item={item} />
                ))}
            </div>
          </section>
        )}

        {/* Removed Sticky Nav as requested */}

        {/* Category Grid Section (Quick Navigation) */}
        {!isFiltering && (
          <div className="mb-10 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <SlidersHorizontal size={14} className="text-gray-400" />
              </div>
              <h2 className="text-[13px] font-semibold text-white tracking-widest uppercase">Kategoriler</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-3 gap-4 p-1">
              {categories.filter(c => c.isActive && c.id !== 'c1' && c.id !== 'c11').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    api.trackEvent('view', { categoryId: cat.id });
                    // Standard mobile haptic-like scale transition handled by active:scale-95
                  }}
                  className="group flex flex-col items-center justify-center p-3 rounded-3xl glass-card transition-all duration-300 active:scale-95"
                  style={{ animation: 'gold-glow-pulse 3s infinite ease-in-out' }}
                >
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3 shadow-2xl group-hover:shadow-[#D4AF37]/20 group-hover:bg-[#D4AF37]/20 transition-all duration-500" style={{ animation: 'gold-glow-icon-pulse 4s infinite ease-in-out' }}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black text-[#b5ad9a] group-hover:text-[#D4AF37] tracking-[0.2em] uppercase text-center leading-tight">
                    {formatBrandText(cat.name)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sequential Menu Items (Only shown if filtering) */}
        <div className="space-y-10">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-bordeaux-700 border-t-[#D4AF37] rounded-full animate-spin mb-6 shadow-2xl shadow-[#D4AF37]/20" />
              <p className="text-[#8a8070] text-base font-black italic tracking-widest">{formatBrandText("Menü yükleniyor...")}</p>
            </div>
          ) : isFiltering ? (
            <>
              {filteredCategories.map(cat => (
                <section key={cat.id} id={`category-${cat.id}`}>
                  <div className="mb-8 flex flex-col pt-6">
                    <h2 className="text-3xl font-sans text-gold-400 font-black tracking-widest uppercase drop-shadow-xl">{formatBrandText(cat.name)}</h2>
                    <div className="w-24 h-[1.5px] bg-gradient-to-r from-gold-600/60 to-transparent mt-4 mb-2 shadow-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {cat.items.map(item => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ))}
              {filteredCategories.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center">
                  <p className="text-gray-400 text-base font-black tracking-wide">{formatBrandText("Aradığınız kriterlere uygun ürün bulunamadı.")}</p>
                  <button 
                    onClick={() => {setSearchQuery(""); setActiveFilters(["all"]); setAllergenExclusions([]);}}
                    className="mt-6 text-[#D4AF37] text-sm font-black border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all pb-0.5 uppercase tracking-widest"
                  >
                    {formatBrandText("Filtreleri Temizle")}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* KDV Notice Footer */}
        <div className="mt-12 mb-6 text-center px-4">
           <div className="h-[1px] w-1/2 mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
           <p className="text-center text-[12px] text-gray-500 leading-relaxed max-w-[300px] mx-auto pb-6 uppercase tracking-[0.25em] font-black">
            {formatBrandText("Fiyatlarımıza KDV dahildir.")} <br/>
            {formatBrandText("Alerjen bilgisi için personelimize danışınız.")}
          </p>
        </div>

        {/* Integrated Footer - Main Menu */}
        <Footer settings={siteSettings} />
      </div>

      {/* Filter Bottom Sheet Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative bg-black/60 backdrop-blur-3xl rounded-t-3xl border-t border-white/10 p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] overflow-y-auto">
            <div className="w-14 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
            
            <h3 className="text-2xl font-sans text-white font-black mb-8 uppercase tracking-widest">{formatBrandText("Filtrele")}</h3>
            
            <div className="space-y-6">
              {/* Alkol / Tip */}
              <div>
                <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Alkol</p>
                <div className="flex flex-wrap gap-2">
                  {TASTE_FILTERS.map(f => (
                    <button key={f.id} onClick={() => toggleFilter(f.id)}
                      className={cn("flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                        activeFilters.includes(f.id) ? "bg-bordeaux-700 text-white border-transparent" : "bg-transparent text-gray-400 border-white/10 active:bg-white/5"
                      )}>
                      <span>{f.icon}</span> {f.label}
                      {activeFilters.includes(f.id) && <Check size={14} className="ml-1 opacity-70" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tat Profili */}
              <div>
                <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Tat Profili</p>
                <div className="flex flex-wrap gap-2">
                  {TASTE_PROFILES.map(f => (
                    <button key={f.id} onClick={() => toggleFilter(f.id)}
                      className={cn("flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                        activeFilters.includes(f.id) ? "bg-bordeaux-700 text-white border-transparent" : "bg-transparent text-gray-400 border-white/10 active:bg-white/5"
                      )}>
                      <span>{f.icon}</span> {f.label}
                      {activeFilters.includes(f.id) && <Check size={14} className="ml-1 opacity-70" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Alerjen Dışla */}
              <div>
                <p className="text-xs text-amber-500 mb-2 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Alerjenleri Dışla
                </p>
                <p className="text-[10px] text-gray-500 mb-3">Seçtiğiniz alerjenleri içeren ürünler gizlenecektir.</p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_FILTERS.map(f => (
                    <button key={f.id} onClick={() => toggleAllergen(f.id)}
                      className={cn("flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                        allergenExclusions.includes(f.id) ? "bg-amber-600/20 text-amber-300 border-amber-500/30" : "bg-transparent text-gray-400 border-white/10 active:bg-white/5"
                      )}>
                      <span>{f.icon}</span> {f.label}
                      {allergenExclusions.includes(f.id) && <Check size={14} className="ml-1 opacity-70" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="w-full mt-8 bg-bordeaux-700 hover:bg-bordeaux-600 text-white font-semibold rounded-2xl py-4 transition-colors text-sm"
            >
              Sonuçları Göster {activeFilterCount > 0 && `(${activeFilterCount} filtre)`}
            </button>

            {activeFilterCount > 0 && (
              <button 
                onClick={() => { setActiveFilters(["all"]); setAllergenExclusions([]); }}
                className="w-full mt-3 text-gray-500 text-sm hover:text-white transition-colors py-2"
              >
                Tüm Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Overlay Modal (NATIVE UX) */}
      {selectedCategoryId && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
          <div className="min-h-full flex flex-col p-4 sm:p-6 max-w-screen-md mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-transparent py-4 flex items-center mb-6">
              <button 
                onClick={() => setSelectedCategoryId(null)} 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-light bg-white/5 py-2 px-4 rounded-xl active:scale-95"
              >
                <ChevronRight size={18} strokeWidth={1.5} className="rotate-180" /> Geri
              </button>
            </div>

            {filteredCategories.filter(c => c.id === selectedCategoryId).map(cat => (
                <section key={cat.id} className="pb-24">
                  <div className="mb-8 flex flex-col">
                    <h2 className="text-4xl font-black text-[#D4AF37] tracking-widest uppercase drop-shadow-2xl">{formatBrandText(cat.name)}</h2>
                    <div className="w-20 h-[2px] bg-gradient-to-r from-[#D4AF37]/60 to-transparent mt-5 mb-3 shadow-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                     {cat.items.map(item => <ProductCard key={item.id} item={item} />)}
                  </div>

                  {/* KDV Notice and Integrated Footer for Category View - True Integration */}
                  <div className="mt-16 mb-6 text-center px-4">
                    <p className="text-center text-[12px] text-gray-500 leading-relaxed max-w-[300px] mx-auto pb-6 uppercase tracking-[0.25em] font-black">
                      {formatBrandText("Fiyatlarımıza KDV dahildir.")}
                    </p>
                  </div>
                  <Footer settings={siteSettings} />
                </section>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
