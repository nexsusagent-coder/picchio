"use client";

import { useState, useMemo, useEffect } from "react";
import * as api from "@/lib/api";
import { MenuItem, Category, AnnouncementBanner } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronRight, Check, Megaphone, X, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, items, anns] = await Promise.all([
          api.getCategories(),
          api.getItems(),
          api.getAnnouncements()
        ]);
        setCategories(cats);
        setAllItems(items);
        setAnnouncements(anns);
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
    <main className="min-h-screen bg-[#070101] text-gray-200 pb-20 selection:bg-bordeaux-800">
      
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 0%, rgba(26,5,5,1) 0%, rgba(0,0,0,1) 100%)"
      }} />

      <div className="relative z-10 max-w-2xl mx-auto pt-6 px-4">

        {/* Announcement Banners */}
        {activeAnnouncements.filter(a => !dismissedBanners.includes(a.id)).map(ann => (
          <div key={ann.id} className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 border animate-in slide-in-from-top-4",
            ann.type === "promo" ? "bg-[#4a0e0e]/30 border-[#4a0e0e]/50 text-amber-200" :
            ann.type === "warning" ? "bg-amber-900/20 border-amber-700/30 text-amber-300" :
            "bg-white/5 border-white/10 text-gray-300"
          )}>
            <Megaphone size={16} className="shrink-0 opacity-70" />
            <p className="text-xs flex-1 leading-relaxed">{ann.text}</p>
            <button onClick={() => setDismissedBanners(p => [...p, ann.id])} className="opacity-40 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
        
        {/* Top Mini Nav */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9">
              <Image src="/logo.png" alt="Picchio" fill className="object-contain" sizes="36px" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif text-gold-400 font-bold text-base sm:text-lg tracking-widest leading-none">Picchio Cocktail</h1>
              <p className="text-[9px] text-gray-500 tracking-[0.15em] uppercase mt-0.5">Premium Bar Menüsü</p>
            </div>
          </div>
          <Link href="/admin/login" className="p-1">
             <div className="w-7 h-7 rounded-full border border-gold-400/50 flex flex-col items-center justify-center gap-0.5 overflow-hidden transition-colors hover:border-gold-400">
                {/* Profile icon skeleton */}
                <div className="w-2 h-2 rounded-full bg-gold-400/80" />
                <div className="w-4 h-2 rounded-t-full bg-gold-400/80 translate-y-0.5" />
             </div>
          </Link>
        </div>

        {/* Hero Section */}
        <header className="flex flex-col items-center justify-center py-10 mb-8 relative rounded-2xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/hero-bg.png" 
              alt="" 
              fill 
              className="object-cover blur-[2px] scale-105"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
          </div>
          <div className="relative z-10 text-center px-6">
             <h2 className="text-3xl sm:text-4xl font-serif text-white font-bold mb-3 leading-tight tracking-wide drop-shadow-lg">
               The Art of the <br/><span className="text-gold-400 italic">Pour</span>
             </h2>
             <div className="w-12 h-[1px] bg-gold-500/60 mx-auto my-4" />
             <p className="text-[11px] sm:text-xs text-gray-300 max-w-[280px] mx-auto leading-relaxed font-medium drop-shadow-md">
               Unutulmuş klasikleri ve yenilikçi imza tarifleri, huzurlu bir lüks atmosferinde keşfedin.
             </p>
          </div>
        </header>

        {/* Search & Filter Row */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Kokteyl, malzeme veya içerik ara..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-bordeaux-700/50 transition-colors shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className={cn(
              "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition border relative",
              activeFilterCount > 0 ? "bg-bordeaux-800 border-bordeaux-600 text-white" : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
            )}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-[10px] text-black font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* ========== PREMIUM GÜNÜN ÖNERİLERİ ========== */}
        {!isFiltering && recommendedItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-white">Günün Önerileri</h2>
                <p className="text-[10px] text-gray-500">Barmenlerimizin bugünkü seçimleri</p>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory -mx-1 px-1">
              {recommendedItems.map(item => (
                <div key={item.id} className="snap-start shrink-0 w-[200px] sm:w-[230px]">
                  <div className="rounded-2xl overflow-hidden border border-amber-500/20 group shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transition-shadow">
                    {item.image && (
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="230px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-2 left-2">
                          <span className="bg-amber-500 text-[9px] text-black font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Önerilen</span>
                        </div>
                        {item.price && (
                          <span className="absolute bottom-2 right-2 bg-black/70 text-amber-400 text-sm font-bold px-2.5 py-1 rounded-xl backdrop-blur-sm border border-amber-500/20">
                            ₺{item.price}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-3 bg-gradient-to-b from-[#0d0202] to-[#070101]">
                      <h3 className="text-white font-serif font-semibold text-sm">{item.name}</h3>
                      {item.description && (
                        <p className="text-gray-400 text-[10px] mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                      )}
                      {item.ingredients && (
                        <p className="text-gray-500 text-[9px] mt-1.5 italic line-clamp-1">{item.ingredients}</p>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {item.tags?.map(tag => (
                          <span key={tag} className="text-[7px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/10">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Removed Sticky Nav as requested */}

        {/* Product Lists Sequentially */}
        <div className="space-y-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#4a0e0e] border-t-gold-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm italic">Menü yükleniyor...</p>
            </div>
          ) : (
            <>
              {filteredCategories.map(cat => (
                 <section key={cat.id} id={`category-${cat.id}`}>
                   <div className="mb-6 flex flex-col pt-4">
                     <h2 className="text-2xl font-serif text-gold-400 font-bold tracking-wide">{cat.name}</h2>
                     <div className="w-16 h-[1px] bg-gold-600/40 mt-3 mb-1" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {cat.items.map(item => (
                        <ProductCard key={item.id} item={item} />
                      ))}
                   </div>
                 </section>
              ))}
              
              {filteredCategories.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center">
                   <p className="text-gray-500 text-sm">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                   <button 
                     onClick={() => {setSearchQuery(""); setActiveFilters(["all"]); setAllergenExclusions([]);}}
                     className="mt-4 text-bordeaux-400 text-sm font-medium hover:underline"
                   >
                     Filtreleri Temizle
                   </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* KDV Notice & Quote Footer */}
        <div className="mt-20 mb-8 text-center px-4">
           <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-4 font-semibold">SOMMELIER RECOMMENDATION</p>
           <h3 className="text-2xl font-serif text-gray-300 italic leading-snug mx-auto max-w-[300px] mb-8">
             "Cocktails are a conversation between memory and the palate."
           </h3>
           <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="bg-gold-500 hover:bg-gold-400 text-black px-8 py-3.5 rounded-sm text-[10px] uppercase font-bold tracking-[0.2em] transition-colors mb-16">
             VIEW MENU COLLECTION
           </button>
           
           <div className="h-[1px] w-1/2 mx-auto bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />
           <p className="text-center text-[10px] text-gray-600 leading-relaxed max-w-[280px] mx-auto pb-4">
            Fiyatlarımız KDV dahildir. Tüm içeceklerimiz taze malzemelerle hazırlanmaktadır. 
            Alerjen bilgisi için personelimize danışınız.
          </p>
        </div>
      </div>

      {/* Filter Bottom Sheet Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative bg-[#0d0202] rounded-t-3xl border-t border-white/10 p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
            
            <h3 className="text-xl font-serif text-white font-semibold mb-6">Filtrele</h3>
            
            <div className="space-y-6">
              {/* Alkol / Tip */}
              <div>
                <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Alkol</p>
                <div className="flex flex-wrap gap-2">
                  {TASTE_FILTERS.map(f => (
                    <button key={f.id} onClick={() => toggleFilter(f.id)}
                      className={cn("flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                        activeFilters.includes(f.id) ? "bg-[#4a0e0e] text-white border-transparent" : "bg-transparent text-gray-400 border-white/10 active:bg-white/5"
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
                        activeFilters.includes(f.id) ? "bg-[#4a0e0e] text-white border-transparent" : "bg-transparent text-gray-400 border-white/10 active:bg-white/5"
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
              className="w-full mt-8 bg-[#4a0e0e] hover:bg-[#660f0f] text-white font-semibold rounded-2xl py-4 transition-colors text-sm"
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
    </main>
  );
}
