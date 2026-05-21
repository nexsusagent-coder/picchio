"use client";

import { SiteSettings } from "@/lib/types";
import { Loader2, Save, ImagePlus, Settings, Tag, Sparkles, AlertTriangle, Download, Upload } from "lucide-react";
import * as api from "@/lib/api";
import { cn } from "@/lib/utils";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface SettingsTabProps {
  siteSettings: SiteSettings | null;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  savingSettings: boolean;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSave: () => Promise<void>;
}

export default function SettingsTab({
  siteSettings, setSiteSettings, savingSettings, onLogoUpload, onSave,
}: SettingsTabProps) {
  if (!siteSettings) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-1">Site Ayarlari</h2>
        <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 text-center text-neutral-500 text-sm mt-6">
          Ayar verisi yuklenemedi. Lutfen once SQL tablosunu olusturun.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-1">Site Ayarlari</h2>
      <p className="text-neutral-400 text-sm mb-6">Musteri menusunun alt kisminda yer alan iletisim ve sosyal medya bilgilerini yonetin.</p>

      <div className="space-y-8">
        {/* Brand Section */}
        <div className="bg-neutral-900/50 border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Settings size={80} className="text-[#D4AF37]" />
          </div>
          <h3 className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            <Tag size={16} /> Logo ve Baslik
          </h3>
          <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative w-32 h-32 rounded-2xl bg-neutral-800 border-2 border-dashed border-neutral-700 overflow-hidden group/logo flex items-center justify-center shrink-0">
                {siteSettings.hero_logo_url ? (
                  <img src={siteSettings.hero_logo_url} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-neutral-600 text-center p-4">
                    <ImagePlus size={32} className="mx-auto mb-2 opacity-20" />
                    <span className="text-[10px] uppercase font-bold tracking-tighter">Logo Henuz Yok</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
                  <div className="text-white text-center">
                    <ImagePlus size={20} className="mx-auto mb-1" />
                    <span className="text-[10px] font-bold uppercase">Degistir</span>
                  </div>
                </label>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2 font-medium">Menu Ana Basligi (Logo Alti)</label>
                  <input type="text" value={siteSettings.menu_title || ""} onChange={e => setSiteSettings({ ...siteSettings, menu_title: e.target.value })}
                    placeholder="Orn: Picchio Cocktail Bar Menusu"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors" />
                </div>
                <div className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/50">
                  <div>
                    <p className="text-xs font-semibold text-white">Ust Bar Gorunurlugu</p>
                    <p className="text-[10px] text-neutral-500">Profil ikonu olan ince seridi goster/gizle.</p>
                  </div>
                  <button onClick={() => setSiteSettings({ ...siteSettings, is_header_visible: !siteSettings.is_header_visible })}
                    className={cn("p-1.5 rounded-lg transition-colors", siteSettings.is_header_visible ? "text-[#D4AF37]" : "text-neutral-600")}>
                    {siteSettings.is_header_visible ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design System */}
        <div className="bg-neutral-800/80 border border-neutral-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full" />
          <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" /> Tasarim ve Stil Ozelestirme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter mb-2 border-b border-neutral-700 pb-1">Renk Paleti</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Ana Renk", key: "primary_color" as const, fallback: "#4E0000" },
                  { label: "Yardimci Renk", key: "secondary_color" as const, fallback: "#1a0404" },
                  { label: "Altin / Vurgu", key: "accent_gold" as const, fallback: "#D4AF37" },
                  { label: "Buton Rengi", key: "button_color" as const, fallback: "#4a0e0e" },
                ].map(({ label, key, fallback }) => {
                  const value = siteSettings[key] || fallback;
                  return (
                  <div className="space-y-1.5" key={key}>
                    <label className="block text-[10px] text-neutral-400 uppercase font-bold">{label}</label>
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-xl">
                      <input type="color" value={value}
                        onChange={e => setSiteSettings({ ...siteSettings, [key]: e.target.value } as unknown as SiteSettings)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none" />
                      <span className="text-[10px] uppercase font-mono text-neutral-400">{value}</span>
                    </div>
                  </div>
                )})}
              </div>
            </div>
            <div className="space-y-5">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter mb-2 border-b border-neutral-700 pb-1">Genel Stil ve Efektler</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-2">Yazi Tipi (Font)</label>
                  <select value={siteSettings.font_family || 'Inter'}
                    onChange={e => setSiteSettings({ ...siteSettings, font_family: e.target.value } as SiteSettings)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50">
                    <option value="Inter">Modern Sans (Inter)</option>
                    <option value="Serif">Klasik Serif (Georgia)</option>
                    <option value="Classic">Zamansiz (Times)</option>
                    <option value="system-ui">Sistem Yazi Tipi</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] text-neutral-400 uppercase font-bold">Kose Yumusakligi</label>
                    <span className="text-[10px] text-amber-500 font-bold">{siteSettings.border_radius || 12}px</span>
                  </div>
                  <input type="range" min="0" max="40" value={siteSettings.border_radius || 12}
                    onChange={e => setSiteSettings({ ...siteSettings, border_radius: parseInt(e.target.value) } as SiteSettings)}
                    className="w-full accent-amber-500 h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] text-neutral-400 uppercase font-bold">Cam Efekti (Blur)</label>
                    <span className="text-[10px] text-amber-500 font-bold">{siteSettings.glass_blur || 12}px</span>
                  </div>
                  <input type="range" min="0" max="32" value={siteSettings.glass_blur || 12}
                    onChange={e => setSiteSettings({ ...siteSettings, glass_blur: parseInt(e.target.value) } as SiteSettings)}
                    className="w-full accent-amber-500 h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] text-neutral-400 uppercase font-bold">Arka Plan Dokusu (Noise)</label>
                    <span className="text-[10px] text-amber-500 font-bold">%{Math.round((siteSettings.noise_opacity || 0.05) * 100)}</span>
                  </div>
                  <input type="range" min="0" max="20" step="1" value={(siteSettings.noise_opacity || 0.05) * 100}
                    onChange={e => setSiteSettings({ ...siteSettings, noise_opacity: parseInt(e.target.value) / 100 } as SiteSettings)}
                    className="w-full accent-amber-500 h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 space-y-4">
          <h3 className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">Iletisim ve Adres Bilgileri</h3>
          {[
            { label: "Fiziksel Adres", key: "address" as keyof SiteSettings },
            { label: "Telefon", key: "phone" as keyof SiteSettings },
            { label: "WhatsApp Linki", key: "whatsapp_url" as keyof SiteSettings },
            { label: "Instagram Linki", key: "instagram_url" as keyof SiteSettings },
            { label: "Google Maps Linki", key: "maps_url" as keyof SiteSettings },
            { label: "Calisma Saatleri", key: "working_hours" as keyof SiteSettings },
            { label: "Alt Bilgi Metni (Copyright)", key: "footer_text" as keyof SiteSettings },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">{label}</label>
              <input type="text" value={(siteSettings[key] as string) || ""}
                onChange={e => setSiteSettings({ ...siteSettings, [key]: e.target.value } as SiteSettings)}
                className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
            </div>
          ))}

          <div className="pt-4 border-t border-neutral-700 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <button onClick={async () => {
                try {
                  const backup = await api.createBackup();
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `yedek_${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) { console.error("Backup error:", err); }
              }}
                className="flex items-center gap-2 border border-neutral-600 text-neutral-300 px-4 py-2 rounded-xl text-xs font-medium hover:bg-neutral-700 transition-colors">
                <Download size={14} /> Yedek Al
              </button>
              <label className="flex items-center gap-2 border border-amber-600/30 text-amber-400 px-4 py-2 rounded-xl text-xs font-medium hover:bg-amber-600/10 transition-colors cursor-pointer">
                <Upload size={14} /> Geri Yukle
                <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!window.confirm("Yedekten geri yukleme tum verileri DEGISTIRECEKTIR. Devam etmek istediginize emin misiniz?")) return;
                  try {
                    await api.restoreBackup(file);
                    alert("Yedek basariyla geri yuklendi! Sayfayi yenileyin.");
                    window.location.reload();
                  } catch (err) { alert("Geri yuklenemedi: " + (err instanceof Error ? err.message : "Dosya bozuk.")); }
                  if (e.target) e.target.value = "";
                }} />
              </label>
            </div>
            <button onClick={onSave} disabled={savingSettings}
              className="flex items-center gap-2 bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50">
              {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
