import { SiteSettings } from "@/lib/types";
import { Instagram, MapPin, MessageCircle } from "lucide-react";
import { formatBrandText } from "@/lib/utils";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  if (!settings) return null;

  return (
    <footer className="w-full bg-[#000000] pt-20 pb-20 relative z-50">
      <div className="max-w-md mx-auto px-6 flex flex-col items-center">
        
        {/* 1. Tidy Social Action Row */}
        <div className="flex items-center justify-center gap-12 mb-16 underline-offset-8">
          {settings.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:scale-110 transition-transform">
              <Instagram size={20} strokeWidth={1.5} />
            </a>
          )}
          {settings.whatsapp_url && (
            <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:scale-110 transition-transform">
              <MessageCircle size={20} strokeWidth={1.5} />
            </a>
          )}
          {settings.maps_url && (
            <a href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:scale-110 transition-transform">
              <MapPin size={20} strokeWidth={1.5} />
            </a>
          )}
        </div>

        {/* 2. Organized Information Stack (Derli Toplu) */}
        <div className="flex flex-col items-center gap-10 text-center mb-16 w-full">
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] text-[#D4AF37]/50 tracking-[0.4em] font-semibold uppercase">Adres</span>
            <p className="text-[12px] text-white/70 font-light leading-relaxed">{settings.address}</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] text-[#D4AF37]/50 tracking-[0.4em] font-semibold uppercase">İletişim</span>
            <p className="text-[12px] text-white/70 font-light tracking-[0.1em]">{settings.phone}</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <span className="text-[9px] text-[#D4AF37]/50 tracking-[0.4em] font-semibold uppercase">Çalışma Saatleri</span>
            <div className="px-5 py-2 rounded-full border border-white/5 bg-white/[0.02] flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#D4AF37] animate-pulse" />
              <p className="text-[11px] text-white/50 font-medium tracking-wide italic">
                {settings.working_hours || "Her Gün: 18:00 - 02:00"}
              </p>
            </div>
          </div>

        </div>

        {/* 3. Refined Legal Warning (Premium) */}
        <div className="w-full flex flex-col items-center pt-10 border-t border-white/5">
          <p className="text-[17px] sm:text-[19px] text-white/90 font-black tracking-[0.3em] uppercase mb-5 text-center drop-shadow-2xl">
            {formatBrandText("+18 yaş için uygundur")}
          </p>
          <p className="text-[10px] text-white/30 tracking-[0.6em] font-black uppercase text-center">
            {formatBrandText(settings.footer_text || "© 2026 Picchio Cocktail Bar")}
          </p>
        </div>
      </div>
    </footer>
  );
}
