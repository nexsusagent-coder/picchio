import { SiteSettings } from "@/lib/types";
import { Instagram, MapPin, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  if (!settings) return null;

  return (
    <footer className="w-full bg-[#0a0505] border-t border-white/[0.05] mt-auto py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Logo / Brand Name */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-[#c9a84c] uppercase">PICCHIO</h2>
          <div className="w-8 h-[1px] bg-[#c9a84c]/50 mt-3 mb-1" />
          <p className="text-[10px] tracking-[0.3em] text-[#8a8070] uppercase">Cocktail Bar</p>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col space-y-3 text-sm text-[#9a917e]">
          {settings.address && (
            <p className="flex items-center justify-center gap-2">
              <MapPin size={14} className="text-[#c9a84c]" />
              <span className="max-w-[280px] leading-snug">{settings.address}</span>
            </p>
          )}
          {settings.phone && (
            <p className="flex items-center justify-center gap-2">
              <Phone size={14} className="text-[#c9a84c]" />
              {settings.phone}
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {settings.instagram_url && (
            <Link href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/[0.03] border border-white/[0.05] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-all duration-300">
              <Instagram size={18} />
            </Link>
          )}
          {settings.whatsapp_url && (
            <Link href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/[0.03] border border-white/[0.05] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-all duration-300">
              <MessageCircle size={18} />
            </Link>
          )}
          {settings.maps_url && (
            <Link href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/[0.03] border border-white/[0.05] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-all duration-300">
              <MapPin size={18} />
            </Link>
          )}
        </div>

        {/* Legal */}
        <div className="pt-6 flex flex-col items-center space-y-2 text-[#6b6358] text-[10px] uppercase tracking-wider">
          <p>Lütfen sorumlu tüketiniz. 18+</p>
          <p>&copy; {new Date().getFullYear()} Picchio Cocktail Bar. Tüm Hakları Saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
