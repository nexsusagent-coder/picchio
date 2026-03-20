"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "HOME", href: "/", icon: Home },
    { name: "MENU", href: "/menu", icon: Menu },
    { name: "SEARCH", href: "/menu#search", icon: Search },
    { name: "PROFILE", href: "/admin", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/5 pb-safe z-50">
      <div className="flex justify-around items-center max-w-2xl mx-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 gap-1 group transition-colors",
                isActive ? "text-gold-400" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Icon size={22} className={cn("transition-transform", isActive ? "scale-110" : "")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
