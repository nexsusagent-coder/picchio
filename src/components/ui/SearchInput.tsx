"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Ara...",
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search size={16} className="absolute left-3 text-neutral-500 shrink-0" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-800 border border-neutral-600 rounded-xl pl-10 pr-8 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[#4a0e0e] transition-colors"
      />
      {localValue && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-2.5 text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
