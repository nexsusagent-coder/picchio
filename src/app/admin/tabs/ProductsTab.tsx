"use client";

import { useState, useRef } from "react";
import { MenuItem, Category } from "@/lib/types";
import { ProductActions } from "../hooks/useProductActions";
import {
  CheckCircle2, XCircle, Plus, Trash2, Edit3, Save, Star,
  ImagePlus, X, Loader2, GripVertical, Upload, Copy, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext, closestCenter, MouseSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent, DragStartEvent
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTableRow } from "@/components/ui/Skeleton";

interface ProductsTabProps {
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  categories: Category[];
  loading: boolean;
  actions: ProductActions;
  onRefresh: () => Promise<void>;
}

function SortableProductRow({ item, isDragging, children }: {
  item: { id: string }; isDragging: boolean;
  children: (dragHandleProps: { listeners: SyntheticListenerMap; attributes: DraggableAttributes }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 0 20px rgba(212, 175, 55, 0.4)' : 'none',
    zIndex: isDragging ? 50 : 'auto' as const,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ listeners: listeners ?? ({} as SyntheticListenerMap), attributes })}
    </div>
  );
}

export default function ProductsTab({ items, setItems, categories, loading, actions, onRefresh }: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkCategory, setShowBulkCategory] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  const pa = actions;

  const dndSensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const filteredItems = items.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesIngredients = item.ingredients?.toLowerCase().includes(q);
      const matchesCat = categories.find(c => c.id === item.categoryId)?.name.toLowerCase().includes(q);
      if (!matchesName && !matchesIngredients && !matchesCat) return false;
    }
    if (priceMin && item.price && item.price < parseFloat(priceMin)) return false;
    if (priceMax && item.price && item.price > parseFloat(priceMax)) return false;
    return true;
  });

  const filteredForSort = pa.sortCategoryFilter === "all"
    ? filteredItems
    : filteredItems.filter(i => i.categoryId === pa.sortCategoryFilter);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleDragStart = (_event: DragStartEvent) => {
    pa.draggingId !== undefined; // just acknowledge reading for the interface
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filteredForSort.findIndex(i => i.id === active.id);
    const newIndex = filteredForSort.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredForSort, oldIndex, newIndex);
    const updatedWithOrder = reordered.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));
    setItems(prev => {
      const otherItems = prev.filter(i => !updatedWithOrder.find(u => u.id === i.id));
      return [...otherItems, ...updatedWithOrder].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    });
    pa.setSortOrderChanged(true);
  };

  if (loading && items.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div><h2 className="text-2xl font-semibold mb-1">Menu Urun Yonetimi</h2></div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Menu Urun Yonetimi</h2>
          <p className="text-neutral-400 text-sm">{items.length} urun kayitli</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("@/lib/api").then(m => m.exportProductsToCSV(items, categories)); }}
            className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Download size={16} /> CSV
          </button>
          <button onClick={() => { if (categories.length > 0) { pa.setNewCategory(categories[0].id); pa.setShowAddModal(true); } }}
            className="flex items-center gap-2 bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Yeni Urun
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Urunlerde ara..." className="flex-1" />
        <div className="flex gap-2">
          <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)}
            placeholder="Min TL" className="w-24 bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)}
            placeholder="Max TL" className="w-24 bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-4 flex-wrap">
          <span className="text-amber-400 text-sm font-medium">{selectedIds.size} urun secildi</span>
          <button
            onClick={async () => {
              if (!window.confirm(`${selectedIds.size} urunu silmek istediginize emin misiniz?`)) return;
              const ids = Array.from(selectedIds);
              const { bulkDeleteItems } = await import("@/lib/api");
              try {
                await bulkDeleteItems(ids);
                setItems(prev => prev.filter(i => !ids.includes(i.id)));
                setSelectedIds(new Set());
              } catch (err) { console.error(err); }
            }}
            className="text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Toplu Sil
          </button>
          <div className="relative">
            <button onClick={() => setShowBulkCategory(!showBulkCategory)}
              className="text-amber-400 hover:bg-amber-400/10 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5"
            >
              <Edit3 size={14} /> Kategori Degistir
            </button>
            {showBulkCategory && (
              <div className="absolute top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-xl p-3 shadow-xl z-50 min-w-[200px]">
                <select value={bulkCategoryId} onChange={e => setBulkCategoryId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm mb-2">
                  <option value="">Kategori secin...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  onClick={async () => {
                    if (!bulkCategoryId) return;
                    const ids = Array.from(selectedIds);
                    const { bulkUpdateCategory } = await import("@/lib/api");
                    try {
                      await bulkUpdateCategory(ids, bulkCategoryId);
                      setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, categoryId: bulkCategoryId } : i));
                      setSelectedIds(new Set());
                      setShowBulkCategory(false);
                    } catch (err) { console.error(err); }
                  }}
                  className="w-full bg-[#4a0e0e] text-white rounded-lg px-3 py-1.5 text-xs font-medium">Uygula</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <select value={pa.sortCategoryFilter} onChange={e => { pa.setSortCategoryFilter(e.target.value); pa.setSortOrderChanged(false); }}
          className="flex-1 bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-sm focus:outline-none text-neutral-300">
          <option value="all">Tum Kategoriler</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {pa.sortOrderChanged && (
          <button onClick={() => pa.saveSortOrder(items, pa.sortCategoryFilter)} disabled={pa.savingSortOrder}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
            {pa.savingSortOrder ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Siralamayi Kaydet
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input type="file" accept="image/*" className="hidden" ref={pa.fileInputRef}
        onChange={e => { if (e.target.files?.[0] && pa.editingImageId) { pa.handleImageUpload(pa.editingImageId, e.target.files[0]); } if (e.target) e.target.value = ""; }} />

      {/* Select All */}
      {filteredItems.length > 0 && (
        <label className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 cursor-pointer select-none">
          <input type="checkbox" checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
            onChange={toggleSelectAll} className="rounded border-neutral-600 bg-neutral-900" />
          Tumunu Sec ({filteredItems.length} urun)
        </label>
      )}

      {/* Product List */}
      {filteredItems.length === 0 ? (
        <EmptyState title="Urun bulunamadi" description={searchQuery ? `"${searchQuery}" ile eslesen urun yok.` : "Filtrelere uyan urun yok."} />
      ) : (
        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredForSort.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filteredForSort.map((item) => (
                <SortableProductRow key={item.id} item={item} isDragging={false}>
                  {({ listeners, attributes }) => (
                    <div className={cn(
                      "bg-neutral-800 rounded-xl border border-neutral-700 p-3 flex items-center gap-3 group transition-all",
                      selectedIds.has(item.id) && "border-amber-500/50 bg-amber-500/5"
                    )}>
                      {/* Checkbox */}
                      <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)}
                        className="shrink-0 rounded border-neutral-600 bg-neutral-900" />

                      {/* Drag Handle */}
                      <div {...listeners} {...attributes}
                        className="shrink-0 flex items-center justify-center w-8 h-10 rounded-lg bg-neutral-700/50 hover:bg-neutral-600 cursor-grab active:cursor-grabbing transition-colors touch-none"
                        title="Surukle">
                        <GripVertical size={16} className="text-neutral-400" />
                      </div>

                      {/* Image */}
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-700 border border-neutral-600 shrink-0 cursor-pointer group/img"
                        onClick={() => { pa.setEditingImageId(item.id); setTimeout(() => pa.fileInputRef.current?.click(), 50); }}>
                        {pa.uploadingImage === item.id && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader2 size={12} className="text-white animate-spin" />
                          </div>
                        )}
                        {item.image ? (
                          <>
                            <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover/img:scale-150 transition-transform duration-300" />
                            <button onClick={(e) => pa.removeImage(item.id, e)} className="absolute -top-0.5 -right-0.5 bg-red-600/90 text-white rounded-full p-0.5 z-20 hover:bg-red-500 scale-75"><X size={10} /></button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImagePlus size={12} className="text-neutral-500" /></div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {pa.editingId === item.id ? (
                          <div className="space-y-1">
                            <input value={pa.editName} onChange={e => pa.setEditName(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-sm w-full" placeholder="Urun adi" />
                            <input value={pa.editIngredients} onChange={e => pa.setEditIngredients(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-neutral-400" placeholder="Icerik" />
                            <input value={pa.editAllergens} onChange={e => pa.setEditAllergens(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-orange-400/70" placeholder="Alerjenler" />
                            <div className="grid grid-cols-2 gap-1">
                              <input value={pa.editTaste} onChange={e => pa.setEditTaste(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-amber-500/80" placeholder="Tat Yogunlugu" />
                              <input value={pa.editService} onChange={e => pa.setEditService(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-blue-400/80" placeholder="Servis Sekli" />
                            </div>
                            <div className="flex items-center gap-2 px-1">
                              <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={pa.editIsFavorite} onChange={e => pa.setEditIsFavorite(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-amber-500" /><span className="text-[10px] text-neutral-400">Favori</span></label>
                              <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={pa.editIsVegan} onChange={e => pa.setEditIsVegan(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-green-500" /><span className="text-[10px] text-neutral-400">Vegan</span></label>
                              <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={pa.editIsVegetarian} onChange={e => pa.setEditIsVegetarian(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-emerald-500" /><span className="text-[10px] text-neutral-400">Vejetaryen</span></label>
                            </div>
                            <select value={pa.editCategoryId} onChange={e => pa.setEditCategoryId(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] text-amber-100">
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-1">
                              <input type="number" value={pa.editCalories} onChange={e => pa.setEditCalories(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-amber-200/70" placeholder="Kcal" />
                              <input value={pa.editAllergenDetails} onChange={e => pa.setEditAllergenDetails(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-red-400/70 italic" placeholder="Alerjen Detayi" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <input type="number" value={pa.editPrice} onChange={e => pa.setEditPrice(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-md px-2 py-0.5 text-[10px] w-full" placeholder="Fiyat 1" />
                              <input type="number" value={pa.editPriceSecondary} onChange={e => pa.setEditPriceSecondary(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-md px-2 py-0.5 text-[10px] w-full" placeholder="Fiyat 2" />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{item.name}</span>
                              {item.isRecommended && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded uppercase">Oneri</span>}
                            </div>
                            <p className="text-[10px] text-neutral-500 truncate">{categories.find(c => c.id === item.categoryId)?.name || '—'}</p>
                            {item.ingredients && <p className="text-[9px] text-neutral-600 truncate">{item.ingredients}</p>}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        {item.price ? (
                          <span className="text-amber-400 font-mono text-sm">₺{item.price}</span>
                        ) : item.variants ? (
                          <span className="text-neutral-500 text-xs">Varyant</span>
                        ) : <span className="text-neutral-600 text-xs">—</span>}
                      </div>

                      {/* Status */}
                      <button onClick={() => pa.toggleAvailability(item.id, item.isAvailable)} className="shrink-0">
                        {item.isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-lg text-[10px] font-medium border border-green-400/20">
                            <CheckCircle2 size={10} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-lg text-[10px] font-medium border border-red-400/20">
                            <XCircle size={10} />
                          </span>
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                        {pa.editingId === item.id ? (
                          <>
                            <button onClick={pa.saveEdit} className="text-green-400 hover:bg-green-400/10 p-1 rounded-lg transition"><Save size={12} /></button>
                            <button onClick={pa.cancelEdit} className="text-neutral-400 hover:bg-white/5 p-1 rounded-lg transition"><X size={12} /></button>
                          </>
                        ) : (
                          <button onClick={() => pa.startEdit(item)} className="text-neutral-400 hover:text-white hover:bg-white/5 p-1 rounded-lg transition"><Edit3 size={12} /></button>
                        )}
                        <button onClick={() => pa.toggleRecommended(item.id, item.isRecommended)} className={cn("p-1 rounded-lg transition", item.isRecommended ? "text-amber-400" : "text-gray-600")}>
                          <Star size={12} className={item.isRecommended ? "fill-amber-400" : ""} />
                        </button>
                        <button onClick={async () => {
                          if (!window.confirm(`${item.name} urununu kopyalamak istediginize emin misiniz?`)) return;
                          const { duplicateItem } = await import("@/lib/api");
                          try { await duplicateItem(item); await onRefresh(); }
                          catch (err) { console.error(err); }
                        }} className="text-blue-400 hover:bg-blue-400/10 p-1 rounded-lg transition" title="Kopyala">
                          <Copy size={12} />
                        </button>
                        <button onClick={async () => {
                          if (!window.confirm("Bu urunu silmek istediginize emin misiniz?")) return;
                          await pa.deleteItem(item.id);
                        }} className="text-red-400 hover:bg-red-400/10 p-1 rounded-lg transition"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  )}
                </SortableProductRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={pa.showAddModal} onClose={() => pa.setShowAddModal(false)} title="Yeni Urun Ekle" size="md">
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="text-xs text-neutral-400 mb-2 block">Urun Gorseli</label>
            <div className="flex gap-3 items-start">
              {pa.newImagePreview ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-600 shrink-0">
                  <img src={pa.newImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <button onClick={pa.clearNewImage} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white"><X size={10} /></button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-600 flex items-center justify-center shrink-0 bg-neutral-900">
                  <ImagePlus size={20} className="text-neutral-500" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-xs px-3 py-2 rounded-lg transition-colors w-full justify-center">
                  <Upload size={14} />
                  {pa.newImagePreview ? "Gorseli Degistir" : "Gorsel Sec"}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) pa.handleNewImageSelect(e.target.files[0]); }} />
                </label>
                <p className="text-[10px] text-neutral-500 mt-1 text-center">JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Kategori</label>
            <select value={pa.newCategory} onChange={e => pa.setNewCategory(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Urun Adi</label>
            <input type="text" value={pa.newName} onChange={e => pa.setNewName(e.target.value)} placeholder="Or: Mojito"
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-neutral-400 mb-1 block">Fiyat 1 (TL)</label><input type="number" value={pa.newPrice} onChange={e => pa.setNewPrice(e.target.value)} placeholder="350" className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
            <div><label className="text-xs text-neutral-400 mb-1 block">Etiket 1</label><input type="text" value={pa.newPriceLabel} onChange={e => pa.setNewPriceLabel(e.target.value)} placeholder="Tek" className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-neutral-400 mb-1 block">Fiyat 2 (TL)</label><input type="number" value={pa.newPriceSecondary} onChange={e => pa.setNewPriceSecondary(e.target.value)} placeholder="550" className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
            <div><label className="text-xs text-neutral-400 mb-1 block">Etiket 2</label><input type="text" value={pa.newPriceSecondaryLabel} onChange={e => pa.setNewPriceSecondaryLabel(e.target.value)} placeholder="Duble" className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Icerik Bilgisi</label>
            <textarea value={pa.newIngredients} onChange={e => pa.setNewIngredients(e.target.value)} placeholder="Or: Votka · Lime Suyu · Seker" rows={2}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-neutral-400 mb-1 block">Tat Yogunlugu</label><input type="text" value={pa.newTaste} onChange={e => pa.setNewTaste(e.target.value)} placeholder="Or: Sert, Aromatik" className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
            <div><label className="text-xs text-neutral-400 mb-1 block">Servis Sekli</label><input type="text" value={pa.newService} onChange={e => pa.setNewService(e.target.value)} placeholder="Or: Rocks, Straight" className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-2 block font-semibold text-amber-500/80 tracking-widest uppercase">Yasal Bilgiler</label>
            <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-3 space-y-4">
              <div><label className="text-[10px] text-neutral-500 mb-1 block uppercase tracking-wider">Kalori (kcal)</label><input type="number" value={pa.newCalories} onChange={e => pa.setNewCalories(e.target.value)} placeholder="Or: 245" className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={pa.newIsVegan} onChange={e => pa.setNewIsVegan(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-green-600" /><span className="text-[11px] text-neutral-400 uppercase">Vegan</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={pa.newIsVegetarian} onChange={e => pa.setNewIsVegetarian(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-emerald-600" /><span className="text-[11px] text-neutral-400 uppercase">Vejetaryen</span></label>
              </div>
              <div><label className="text-[10px] text-neutral-500 mb-1 block uppercase tracking-wider">Detayli Alerjen Uyarisi</label><textarea value={pa.newAllergenDetails} onChange={e => pa.setNewAllergenDetails(e.target.value)} placeholder="Or: Bu urun gluten ve kuruyemis icermektedir..." rows={2} className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none italic" /></div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={pa.newIsFavorite} onChange={e => pa.setNewIsFavorite(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-amber-500" /><span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Musteri Favorisi Olarak Isaretle</span></label>
          <div><label className="text-xs text-neutral-400 mb-1 block">Alerjen Etiketleri (Kisa)</label><input type="text" value={pa.newAllergens} onChange={e => pa.setNewAllergens(e.target.value)} placeholder="Or: Sulfitler, Gluten" className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => pa.setShowAddModal(false)} className="flex-1 border border-neutral-600 text-neutral-300 rounded-xl py-2.5 text-sm hover:bg-neutral-700 transition">Iptal</button>
            <button onClick={pa.addItem} className="flex-1 bg-[#4a0e0e] hover:bg-[#660f0f] disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition flex items-center justify-center gap-2">
              Ekle
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
