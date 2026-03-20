"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

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
    <div className="min-h-screen bg-neutral-900" suppressHydrationWarning>
      <nav className="bg-black/80 border-b border-bordeaux-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-serif text-gold-400 text-lg tracking-wider">PICCHIO ADMIN PANEL</h1>
        <div className="flex items-center gap-4">
          {userEmail && <span className="text-gray-500 text-xs hidden sm:block">{userEmail}</span>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Çıkış</span>
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
