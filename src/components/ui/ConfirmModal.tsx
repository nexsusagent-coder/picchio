"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmOptions {
  title: string;
  message: string;
  variant?: "danger" | "warning" | "default";
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleClose = useCallback(
    (result: boolean) => {
      state?.resolve(result);
      setState(null);
    },
    [state]
  );

  const isDanger = state?.options.variant === "danger";
  const isWarning = state?.options.variant === "warning";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => handleClose(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative bg-neutral-800 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isDanger
                      ? "bg-red-500/10 text-red-400"
                      : isWarning
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-neutral-700 text-neutral-300"
                  )}
                >
                  {isDanger ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{state.options.title}</h3>
                  <p className="text-neutral-400 text-xs mt-1 leading-relaxed">{state.options.message}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors border border-neutral-600"
                >
                  {state.options.cancelLabel || "Iptal"}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    isDanger
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : isWarning
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-[#4a0e0e] hover:bg-[#660f0f] text-white"
                  )}
                >
                  {state.options.confirmLabel || "Onayla"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmModalProvider");
  return ctx.confirm;
}
