"use client";

import { motion } from "framer-motion";
import { Sparkles, Wrench, Instagram, MessageCircle, Clock, MapPin, Wine, RefreshCw } from "lucide-react";

interface MaintenanceScreenProps {
  title?: string;
  subtitle?: string;
  message?: string;
}

export function MaintenanceScreen({
  title = "SİZLER İÇİN YENİLENİYORUZ",
  subtitle = "PICCHIO COCKTAIL BAR",
  message = "Değerli misafirlerimiz, menümüz sizlere daha iyi ve kusursuz bir deneyim sunabilmek adına kısa süreli bir güncelleme ve bakım çalışmasındadır. Çok yakında yenilenen lezzetlerimizle tekrar hizmetinizde olacağız.",
}: MaintenanceScreenProps) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden px-4 py-8 select-none"
         style={{
           background: "radial-gradient(circle at 50% 30%, #4a0a0a 0%, #1c0404 45%, #050101 100%)"
         }}
    >
      {/* Background Decorative Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      {/* Ambient Gold & Crimson Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-[#D4AF37]/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#800000]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg mx-auto rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Logo Container with Golden Glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[#D4AF37]/25 rounded-full blur-2xl animate-pulse" />
          <img
            src="/logo.png"
            alt="Picchio Cocktail Bar"
            className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
          />
        </motion.div>

        {/* Maintenance Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase mb-4"
        >
          <Wrench size={13} className="animate-bounce" />
          <span>{subtitle}</span>
          <Sparkles size={13} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase font-sans mb-3 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Decorative Divider */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-2 opacity-75" />

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed my-4 px-2"
        >
          {message}
        </motion.p>

        {/* Status Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-5 text-left text-xs"
        >
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-300">
            <Clock size={16} className="text-[#D4AF37] shrink-0" />
            <div>
              <div className="font-semibold text-white">Çalışma Saatleri</div>
              <div className="text-[11px] text-neutral-400">18:00 - 02:00 / 04:00</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-300">
            <MapPin size={16} className="text-[#D4AF37] shrink-0" />
            <div>
              <div className="font-semibold text-white">Konum</div>
              <div className="text-[11px] text-neutral-400">Alsancak, İzmir</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action Buttons (Instagram & WhatsApp) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="w-full flex flex-col sm:flex-row gap-3 mt-2"
        >
          <a
            href="https://instagram.com/picchiococktail"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b38f28] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Instagram size={16} />
            <span>Instagram'da Takip Et</span>
          </a>

          <a
            href="https://wa.me/905551234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
          >
            <MessageCircle size={16} className="text-emerald-400" />
            <span>Garson / İletişim</span>
          </a>
        </motion.div>

        {/* Refresh Note */}
        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-neutral-500">
          <RefreshCw size={12} className="animate-spin text-[#D4AF37]/60" />
          <span>Sayfa otomatik güncellenmektedir</span>
        </div>
      </motion.div>
    </div>
  );
}
