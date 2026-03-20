"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Settle time 3s + exit animation 0.5s = ~3.5s total splash time
    const timer = setTimeout(() => {
      setIsVisible(false);
      
      // Delay routing until exit animation finishes
      setTimeout(() => {
        router.push("/menu");
      }, 500); 

    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bordeaux-900 overflow-hidden"
          style={{
            background: "radial-gradient(circle at center, var(--color-bordeaux-800) 0%, var(--background) 100%)"
          }}
        >
          {/* subtle decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} 
          />
          
          <motion.div
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              delay: 0.2
            }}
            className="relative w-64 h-64 md:w-80 md:h-80"
          >
            <div className="absolute inset-0 bg-gold-400 blur-[80px] opacity-20 rounded-full animate-pulse"></div>
            <Image
              src="/logo.png"
              alt="Picchio Cocktail"
              fill
              priority
              className="object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
