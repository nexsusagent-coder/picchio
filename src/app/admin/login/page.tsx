"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
    } else {
      if (data?.session) {
        // Set cookie so proxy.ts can authorize the request
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`;
      }
      window.location.href = "/admin"; // Başarılı girişte admin paneline yönlendir.
    }
  };

  return (
    <div className="min-h-screen bg-[#070101] flex items-center justify-center px-4" style={{
      background: "radial-gradient(circle at 50% 0%, rgba(26,5,5,1) 0%, rgba(0,0,0,1) 100%)"
    }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <Image src="/logo.png" alt="Picchio Cocktail" fill className="object-contain" sizes="96px" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="text-white font-sans text-2xl font-semibold text-center mb-1">Admin Girişi</h1>
          <p className="text-gray-500 text-sm text-center mb-7">Picchio Cocktail Yönetim Paneli</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@picchio.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a0e0e]/70 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a0e0e]/70 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a0e0e] hover:bg-[#660f0f] disabled:opacity-50 text-white font-semibold rounded-xl py-3.5 transition-colors text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>

        <p className="text-gray-600 text-xs text-center mt-6">
          Müşteri Menüsü →{" "}
          <a href="/menu" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            /menu
          </a>
        </p>
      </div>
    </div>
  );
}
