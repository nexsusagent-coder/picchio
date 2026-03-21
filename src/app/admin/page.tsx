"use client";

import { useState, useRef, useEffect } from "react";
import * as api from "@/lib/api";
import { MenuItem, Category, AnnouncementBanner } from "@/lib/types";
import { 
  CheckCircle2, XCircle, Plus, Trash2, Edit3, Save, Megaphone, 
  ToggleLeft, ToggleRight, Star, Package, AlertTriangle, ImagePlus, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type AdminTab = "products" | "announcements" | "featured";

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [loading, setLoading] = useState(true);

  // Product CRUD State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editIngredients, setEditIngredients] = useState("");

  // Image editing
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newIngredients, setNewIngredients] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Add announcement
  const [newAnnText, setNewAnnText] = useState("");
  const [newAnnType, setNewAnnType] = useState<"info" | "warning" | "promo">("promo");

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [cats, its, anns] = await Promise.all([
        api.getCategories(),
        api.getItems(),
        api.getAnnouncements()
      ]);
      setCategories(cats);
      setItems(its);
      setAnnouncements(anns);
      if (cats.length > 0 && !newCategory) setNewCategory(cats[0].id);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await api.updateItem(id, { is_available: !current });
      setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable: !current } : i));
    } catch (err) { console.error(err); }
  };

  const toggleRecommended = async (id: string, current: boolean | undefined) => {
    try {
      await api.updateItem(id, { is_recommended: !current });
      setItems(prev => prev.map(i => i.id === id ? { ...i, isRecommended: !current } : i));
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price?.toString() || "");
    setEditIngredients(item.ingredients || "");
    setEditingImageId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.updateItem(editingId, { 
        name: editName, 
        price: editPrice ? parseFloat(editPrice) : null, 
        ingredients: editIngredients 
      });
      setItems(prev => prev.map(item => 
        item.id === editingId ? { ...item, name: editName, price: editPrice ? parseFloat(editPrice) : undefined, ingredients: editIngredients } : item
      ));
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const cancelEdit = () => setEditingId(null);

  const deleteItem = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingImage(id);
    try {
      const url = await api.uploadProductImage(file, id);
      await api.updateItem(id, { image: url });
      setItems(prev => prev.map(item => item.id === id ? { ...item, image: url } : item));
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Görsel yüklenemedi.");
    } finally {
      setUploadingImage(null);
      setEditingImageId(null);
    }
  };

  const handleNewImageSelect = (file: File) => {
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const addItem = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const id = `item-${Date.now()}`;
      let imageUrl = undefined;
      
      if (newImageFile) {
        imageUrl = await api.uploadProductImage(newImageFile, id);
      }

      await api.insertItem({
        id,
        categoryId: newCategory,
        name: newName.trim(),
        price: newPrice ? parseFloat(newPrice) : undefined,
        ingredients: newIngredients.trim() || undefined,
        image: imageUrl,
        isAvailable: true,
      });

      await refreshData();
      setNewName("");
      setNewPrice("");
      setNewIngredients("");
      setNewImageFile(null);
      setNewImagePreview(null);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Ürün eklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnnouncement = async (id: string, current: boolean) => {
    try {
      await api.updateAnnouncement(id, { is_active: !current });
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !current } : a));
    } catch (err) { console.error(err); }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error(err); }
  };

  const addAnnouncement = async () => {
    if (!newAnnText.trim()) return;
    try {
      const ann: AnnouncementBanner = {
        id: `ann-${Date.now()}`,
        text: newAnnText.trim(),
        isActive: true,
        type: newAnnType,
      };
      await api.insertAnnouncement(ann);
      setAnnouncements(prev => [...prev, ann]);
      setNewAnnText("");
    } catch (err) { console.error(err); }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "products", label: "Ürünler", icon: <Package size={16} /> },
    { id: "announcements", label: "Duyurular", icon: <Megaphone size={16} /> },
    { id: "featured", label: "Öne Çıkanlar", icon: <Star size={16} /> },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-gold-500 animate-spin" />
          <p className="text-neutral-500 font-medium">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto text-neutral-200">
      
      {/* Tab Bar */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border",
              activeTab === tab.id ? "bg-[#4a0e0e] text-white border-[#4a0e0e]" : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ========== PRODUCTS TAB ========== */}
      {activeTab === "products" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Menü Ürün Yönetimi</h2>
              <p className="text-neutral-400 text-sm">{items.length} ürün kayıtlı</p>
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Yeni Ürün
            </button>
          </div>

          {/* Add Product Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
              <div className="relative bg-neutral-800 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Yeni Ürün Ekle</h3>
                <div className="space-y-4">
                  {/* Image Upload for new item */}
                  <div>
                    <label className="text-xs text-neutral-400 mb-2 block">Ürün Görseli</label>
                    <div className="flex gap-3 items-start">
                      {newImagePreview ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-600 shrink-0">
                          <Image src={newImagePreview} alt="Preview" fill className="object-cover" sizes="80px" />
                          <button onClick={() => {setNewImagePreview(null); setNewImageFile(null);}} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white">
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-600 flex items-center justify-center shrink-0 bg-neutral-900">
                          <ImagePlus size={20} className="text-neutral-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="cursor-pointer flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-xs px-3 py-2 rounded-lg transition-colors w-full justify-center">
                          <ImagePlus size={14} />
                          {newImagePreview ? "Görseli Değiştir" : "Görsel Seç"}
                          <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleNewImageSelect(e.target.files[0]); }} />
                        </label>
                        <p className="text-[10px] text-neutral-500 mt-1 text-center">JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">Kategori</label>
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">Ürün Adı</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ör: Mojito"
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">Fiyat (₺) — opsiyonel</label>
                    <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="399"
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">İçerik Bilgisi — opsiyonel</label>
                    <textarea value={newIngredients} onChange={e => setNewIngredients(e.target.value)} placeholder="Ör: Votka · Lime Suyu · Şeker"
                      rows={2}
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e] resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 border border-neutral-600 text-neutral-300 rounded-xl py-2.5 text-sm hover:bg-neutral-700 transition">İptal</button>
                    <button onClick={addItem} disabled={loading} className="flex-1 bg-[#4a0e0e] hover:bg-[#660f0f] disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition flex items-center justify-center gap-2">
                      {loading && <Loader2 size={14} className="animate-spin" />}
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input for image upload on existing products */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={e => {
              if (e.target.files?.[0] && editingImageId) {
                handleImageUpload(editingImageId, e.target.files[0]);
              }
              if (e.target) e.target.value = "";
            }}
          />

          {/* Products Table */}
          <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-700">
                    <th className="p-4 font-medium text-neutral-400 text-xs uppercase tracking-wider w-16">Görsel</th>
                    <th className="p-4 font-medium text-neutral-400 text-xs uppercase tracking-wider">Ürün Adı</th>
                    <th className="p-4 font-medium text-neutral-400 text-xs uppercase tracking-wider">Kategori</th>
                    <th className="p-4 font-medium text-neutral-400 text-xs uppercase tracking-wider">Fiyat</th>
                    <th className="p-4 font-medium text-neutral-400 text-xs uppercase tracking-wider text-center">Durum</th>
                    <th className="p-4 font-medium text-neutral-400 text-xs uppercase tracking-wider text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-700/30 transition-colors group">
                      <td className="p-3 pl-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-700 border border-neutral-600 group/img cursor-pointer"
                          onClick={() => { setEditingImageId(item.id); setTimeout(() => fileInputRef.current?.click(), 50); }}
                        >
                          {uploadingImage === item.id ? (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                              <Loader2 size={16} className="text-white animate-spin" />
                            </div>
                          ) : null}
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus size={16} className="text-neutral-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <ImagePlus size={14} className="text-white" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {editingId === item.id ? (
                          <div className="space-y-1.5">
                            <input value={editName} onChange={e => setEditName(e.target.value)}
                              className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-sm w-full"
                              placeholder="Ürün adı"
                            />
                            <input value={editIngredients} onChange={e => setEditIngredients(e.target.value)}
                              className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-xs w-full text-neutral-400"
                              placeholder="İçerik bilgisi (opsiyonel)"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-sm">
                              {item.name}
                              {item.isRecommended && <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">Öneri</span>}
                              {item.isSignature && <span className="ml-1 text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase">İmza</span>}
                            </span>
                            {item.ingredients && (
                              <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{item.ingredients}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-neutral-400">
                        {categories.find((c: Category) => c.id === item.categoryId)?.name || '-'}
                      </td>
                      <td className="p-4">
                        {editingId === item.id ? (
                          <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                            className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-sm w-20"
                          />
                        ) : (
                          item.price ? <span className="text-amber-400 font-mono text-sm">₺{item.price}</span> : 
                          item.variants ? <span className="text-neutral-500 text-xs">Varyantlı</span> : 
                          <span className="text-neutral-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleAvailability(item.id, item.isAvailable)} className="transition-transform active:scale-95">
                          {item.isAvailable ? (
                            <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg text-xs font-medium border border-green-400/20">
                              <CheckCircle2 size={12} /> Stokta
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-lg text-xs font-medium border border-red-400/20">
                              <XCircle size={12} /> Tükendi
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          {editingId === item.id ? (
                            <>
                              <button onClick={saveEdit} className="text-green-400 hover:bg-green-400/10 p-1.5 rounded-lg transition"><Save size={14} /></button>
                              <button onClick={cancelEdit} className="text-neutral-400 hover:bg-white/5 p-1.5 rounded-lg transition"><X size={14} /></button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(item)} className="text-neutral-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition"><Edit3 size={14} /></button>
                          )}
                          <button onClick={() => toggleRecommended(item.id, item.isRecommended)} className={cn("p-1.5 rounded-lg transition", item.isRecommended ? "text-amber-400 hover:bg-amber-400/10" : "text-gray-600 hover:bg-white/5")}>
                            <Star size={14} className={item.isRecommended ? "fill-amber-400" : ""} />
                          </button>
                          <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========== ANNOUNCEMENTS TAB ========== */}
      {activeTab === "announcements" && (
        <div>
          <h2 className="text-2xl font-semibold mb-1">Duyuru Banner Yönetimi</h2>
          <p className="text-neutral-400 text-sm mb-6">Müşteri menüsünde gösterilecek duyuruları buradan yönetin.</p>

          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 mb-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Plus size={14} /> Yeni Duyuru Ekle</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={newAnnText} onChange={e => setNewAnnText(e.target.value)}
                placeholder="Duyuru metni yazın..."
                className="flex-1 bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
              />
              <select value={newAnnType} onChange={e => setNewAnnType(e.target.value as "info" | "warning" | "promo")}
                className="bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="promo">🎉 Promosyon</option>
                <option value="info">ℹ️ Bilgi</option>
                <option value="warning">⚠️ Uyarı</option>
              </select>
              <button onClick={addAnnouncement} className="bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap">Ekle</button>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className={cn("flex items-center gap-4 bg-neutral-800 border rounded-xl px-5 py-4 transition-colors", ann.isActive ? "border-green-500/20" : "border-neutral-700 opacity-60")}>
                <div className="flex-1">
                  <p className="text-sm">{ann.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium",
                      ann.type === "promo" ? "bg-amber-500/10 text-amber-400" :
                      ann.type === "warning" ? "bg-orange-500/10 text-orange-400" :
                      "bg-blue-500/10 text-blue-400"
                    )}>{ann.type === "promo" ? "Promosyon" : ann.type === "warning" ? "Uyarı" : "Bilgi"}</span>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium",
                      ann.isActive ? "bg-green-500/10 text-green-400" : "bg-neutral-700 text-neutral-400"
                    )}>{ann.isActive ? "Aktif" : "Pasif"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleAnnouncement(ann.id, ann.isActive)} className={cn("p-2 rounded-lg transition", ann.isActive ? "text-amber-400 hover:bg-amber-400/10" : "text-green-400 hover:bg-green-400/10")}>
                    {ann.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => deleteAnnouncement(ann.id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== FEATURED TAB ========== */}
      {activeTab === "featured" && (
        <div>
          <h2 className="text-2xl font-semibold mb-1">Günün Önerileri Yönetimi</h2>
          <p className="text-neutral-400 text-sm mb-6">Menüde öne çıkacak ürünleri seçin (Star ikonuyla işaretleyin).</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(item => {
              const isRec = item.isRecommended;
              return (
                <button key={item.id} onClick={() => toggleRecommended(item.id, isRec)}
                  className={cn("flex items-center gap-3 p-4 rounded-xl border text-left transition-colors",
                    isRec ? "bg-amber-500/10 border-amber-500/30 text-white" : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600"
                  )}
                >
                  <Star size={16} className={isRec ? "text-amber-400 fill-amber-400" : "text-neutral-500"} />
                  {item.image && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{categories.find((c: Category) => c.id === item.categoryId)?.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
