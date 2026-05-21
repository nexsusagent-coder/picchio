"use client";

import { cn } from "@/lib/utils";

const presets = [
  { label: "7 Gun", days: 7 },
  { label: "30 Gun", days: 30 },
  { label: "Bu Ay", days: "thisMonth" as const },
  { label: "Tum Zamanlar", days: 0 },
];

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  className?: string;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function thisMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  className,
}: DateRangePickerProps) {
  const handlePreset = (days: number | "thisMonth" | 0) => {
    const today = new Date().toISOString().split("T")[0];
    if (days === 0) {
      onRangeChange("2024-01-01", today);
    } else if (days === "thisMonth") {
      onRangeChange(thisMonthStart(), today);
    } else {
      onRangeChange(daysAgo(days), today);
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-stretch sm:items-center gap-3", className)}>
      <div className="flex bg-neutral-800 rounded-xl p-1 border border-neutral-700 gap-0.5">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePreset(p.days)}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap",
              "text-neutral-400 hover:text-white"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onRangeChange(e.target.value, endDate)}
          className="bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#4a0e0e] [color-scheme:dark]"
        />
        <span className="text-neutral-500 text-xs">—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onRangeChange(startDate, e.target.value)}
          className="bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#4a0e0e] [color-scheme:dark]"
        />
      </div>
    </div>
  );
}
