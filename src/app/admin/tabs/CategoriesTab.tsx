"use client";

import { Category } from "@/lib/types";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface CategoriesTabProps {
  categories: Category[];
  editingCategoryId: string | null;
  editCategoryName: string;
  setEditCategoryName: (v: string) => void;
  setEditingCategoryId: (v: string | null) => void;
  showAddCategoryModal: boolean;
  setShowAddCategoryModal: (v: boolean) => void;
  newCatName: string;
  setNewCatName: (v: string) => void;
  newCatOrder: string;
  setNewCatOrder: (v: string) => void;
  onSaveEdit: (catId: string) => Promise<void>;
  onDelete: (catId: string) => Promise<void>;
  onAdd: () => Promise<void>;
}

export default function CategoriesTab({
  categories, editingCategoryId, editCategoryName, setEditCategoryName,
  setEditingCategoryId, showAddCategoryModal, setShowAddCategoryModal,
  newCatName, setNewCatName, newCatOrder, setNewCatOrder,
  onSaveEdit, onDelete, onAdd,
}: CategoriesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Kategori Yonetimi</h2>
          <p className="text-neutral-400 text-sm">{categories.length} kategori mevcut</p>
        </div>
        <button onClick={() => setShowAddCategoryModal(true)}
          className="flex items-center gap-2 bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Yeni Kategori
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="Henuz kategori eklenmedi" description="Ilk kategoriyi ekleyerek baslayin." />
      ) : (
        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-900/50 border-b border-neutral-700">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Sira</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Kategori Adi</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-amber-500/60">#{cat.order}</span>
                  </td>
                  <td className="px-6 py-4">
                    {editingCategoryId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)}
                          className="bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:border-[#4a0e0e]" autoFocus />
                        <button onClick={() => onSaveEdit(cat.id)} className="text-green-400 p-1.5 hover:bg-green-400/10 rounded-lg"><Save size={16} /></button>
                        <button onClick={() => setEditingCategoryId(null)} className="text-neutral-500 p-1.5 hover:bg-white/5 rounded-lg"><X size={16} /></button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-white uppercase tracking-tight">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingCategoryId(cat.id); setEditCategoryName(cat.name); }}
                        className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition"><Edit3 size={16} /></button>
                      <button onClick={() => onDelete(cat.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)} title="Yeni Kategori Ekle" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Kategori Adi</label>
            <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Orn: SICAK KAHVELER"
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Siralama (Opsiyonel)</label>
            <input type="number" value={newCatOrder} onChange={(e) => setNewCatOrder(e.target.value)}
              placeholder={String(categories.length + 1)}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAddCategoryModal(false)} className="flex-1 border border-neutral-600 text-neutral-300 rounded-xl py-2.5 text-sm hover:bg-neutral-700 transition">Iptal</button>
            <button onClick={onAdd} className="flex-1 bg-[#4a0e0e] hover:bg-[#660f0f] text-white rounded-xl py-2.5 text-sm font-medium transition">Ekle</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
