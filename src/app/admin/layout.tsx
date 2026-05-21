"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles, Loader2 } from "lucide-react";
import { publishChanges } from "@/app/actions";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { ConfirmModalProvider } from "@/components/ui/ConfirmModal";

function AdminNav() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? null);
      else router.push("/admin/login");
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <nav className="bg-black/80 border-b border-white/5 px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <h1 className="font-sans text-gold-400 text-lg tracking-wider font-bold">PICCHIO ADMIN PANEL</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={async () => {
            setIsPublishing(true);
            try {
              const res = await publishChanges();
              if (res.success) toast.success("Menu basariyla guncellendi ve yayinlandi!");
              else toast.error("Yayinlama sirasinda bir hata olustu: " + res.error);
            } catch (err) {
              toast.error("Hata: " + String(err));
            } finally {
              setIsPublishing(false);
            }
          }}
          disabled={isPublishing}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#b8972f] disabled:opacity-50 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
        >
          {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span className="hidden sm:inline">Hemen Yayinla</span>
        </button>

        {userEmail && <span className="text-gray-500 text-xs hidden sm:block">{userEmail}</span>}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={15} />
          <span className="hidden sm:block">Cikis</span>
        </button>
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmModalProvider>
        <div className="min-h-screen bg-black w-full" suppressHydrationWarning>
          <AdminNav />
          <main className="w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </ConfirmModalProvider>
    </ToastProvider>
  );
}
