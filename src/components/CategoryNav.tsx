import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
}: {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}) {
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-bordeaux-800/50 py-3 -mx-4 px-4 overflow-x-auto select-none no-scrollbar">
      <div className="flex gap-3">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
            activeCategory === null
              ? "bg-gold-500/20 text-gold-400 border-gold-500/50"
              : "bg-bordeaux-900/50 text-gray-400 border-transparent hover:text-white"
          )}
        >
          Tümü / Öne Çıkanlar
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              activeCategory === c.id
                ? "bg-gold-500/20 text-gold-400 border-gold-500/50"
                : "bg-bordeaux-900/50 text-gray-400 border-transparent hover:text-white"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
