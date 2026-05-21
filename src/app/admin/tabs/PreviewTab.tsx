"use client";

import { RefreshCw } from "lucide-react";

export default function PreviewTab() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Canli Menu Onizleme</h2>
      <p className="text-neutral-400 text-sm mb-6">Musterilerin gordugu canli menuyu buradan goruntuleyin.</p>

      <div className="flex justify-center">
        <div className="w-full max-w-[375px]">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                Canli Onizleme
              </span>
              <button
                onClick={() => {
                  const iframe = document.getElementById("menu-preview-iframe") as HTMLIFrameElement;
                  iframe?.contentWindow?.location.reload();
                }}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-[10px]"
              >
                <RefreshCw size={12} />
                Yenile
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-black"
              style={{ aspectRatio: "375/812" }}>
              <iframe
                id="menu-preview-iframe"
                src="/menu"
                className="absolute inset-0 w-full h-full"
                title="Menu Onizleme"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
          <p className="text-[10px] text-neutral-600 text-center mt-3">
            Bu onizleme, yayinlanmis son hali gosterir. Degisiklikleri gormek icin once &ldquo;Hemen Yayinla&rdquo; butonuna basin.
          </p>
        </div>
      </div>
    </div>
  );
}
