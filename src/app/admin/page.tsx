"use client";

import { useState, useRef, useEffect } from "react";
import * as api from "@/lib/api";
import { MenuItem, Category, AnnouncementBanner, SiteSettings, Campaign } from "@/lib/types";
import { publishChanges } from "@/app/actions";
import {
  CheckCircle2, XCircle, Plus, Trash2, Edit3, Save, Megaphone,
  ToggleLeft, ToggleRight, Star, Package, AlertTriangle, ImagePlus, X, Loader2, Settings, Tag, GripVertical, ArrowUpDown, BarChart3, Martini, Sparkles
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
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

type AdminTab = "products" | "announcements" | "featured" | "settings" | "campaigns" | "categories" | "reports";

// Sortable product row component
function SortableProductRow({ item, isDragging, children }: { 
  item: { id: string }; isDragging: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (dragHandleProps: { listeners: any; attributes: any }) => React.ReactNode 
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
      {children({ listeners: listeners ?? {}, attributes })}
    </div>
  );
}

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementBanner[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampTitle, setNewCampTitle] = useState("");
  const [newCampDesc, setNewCampDesc] = useState("");
  const [newCampType, setNewCampType] = useState<Campaign["type"]>("discount");
  const [newCampPrice, setNewCampPrice] = useState("");
  const [newCampEndDate, setNewCampEndDate] = useState("");
  const [newCampImageFiles, setNewCampImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [newCampImagePreviews, setNewCampImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);

  // Category Management State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatOrder, setNewCatOrder] = useState("");

  // Product CRUD State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPriceSecondary, setEditPriceSecondary] = useState("");
  const [editPriceLabel, setEditPriceLabel] = useState("");
  const [editPriceSecondaryLabel, setEditPriceSecondaryLabel] = useState("");
  const [editIngredients, setEditIngredients] = useState("");
  const [editAllergens, setEditAllergens] = useState("");
  const [editTaste, setEditTaste] = useState("");
  const [editService, setEditService] = useState("");
  const [editIsFavorite, setEditIsFavorite] = useState(false);
  const [editCalories, setEditCalories] = useState("");
  const [editIsVegan, setEditIsVegan] = useState(false);
  const [editIsVegetarian, setEditIsVegetarian] = useState(false);
  const [editAllergenDetails, setEditAllergenDetails] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  // Image editing
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPriceSecondary, setNewPriceSecondary] = useState("");
  const [newPriceLabel, setNewPriceLabel] = useState("");
  const [newPriceSecondaryLabel, setNewPriceSecondaryLabel] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newIngredients, setNewIngredients] = useState("");
  const [newAllergens, setNewAllergens] = useState("");
  const [newTaste, setNewTaste] = useState("");
  const [newService, setNewService] = useState("");
  const [newIsFavorite, setNewIsFavorite] = useState(false);
  const [newCalories, setNewCalories] = useState("");
  const [newIsVegan, setNewIsVegan] = useState(false);
  const [newIsVegetarian, setNewIsVegetarian] = useState(false);
  const [newAllergenDetails, setNewAllergenDetails] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Add announcement
  const [newAnnText, setNewAnnText] = useState("");
  const [newAnnType, setNewAnnType] = useState<"info" | "warning" | "promo">("promo");

  // Settings state
  const [savingSettings, setSavingSettings] = useState(false);

  // Sort order state
  const [sortOrderChanged, setSortOrderChanged] = useState(false);
  const [savingSortOrder, setSavingSortOrder] = useState(false);
  const [sortCategoryFilter, setSortCategoryFilter] = useState<string>("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [cats, its, anns, sets, camps, stats] = await Promise.all([
        api.getCategories(),
        api.getItems(),
        api.getAnnouncements(),
        api.getSiteSettings(),
        api.getCampaigns(),
        api.getAnalyticsSummary(),
      ]);
      setCategories(cats);
      setItems(its);
      setAnnouncements(anns);
      setSiteSettings(sets);
      setCampaigns(camps);
      setAnalyticsSummary(stats);
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
      await publishChanges();
      setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable: !current } : i));
    } catch (err) { console.error(err); }
  };

  const toggleRecommended = async (id: string, current: boolean | undefined) => {
    try {
      await api.updateItem(id, { is_recommended: !current });
      await publishChanges();
      setItems(prev => prev.map(i => i.id === id ? { ...i, isRecommended: !current } : i));
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price?.toString() || "");
    setEditPriceSecondary(item.priceSecondary?.toString() || "");
    setEditPriceLabel(item.priceLabel || "");
    setEditPriceSecondaryLabel(item.priceSecondaryLabel || "");
    setEditIngredients(item.ingredients || "");
    setEditAllergens(item.allergens || "");
    setEditTaste(item.tasteIntensity || "");
    setEditService(item.serviceStyle || "");
    setEditIsFavorite(item.isFavorite || false);
    setEditCalories(item.calories?.toString() || "");
    setEditIsVegan(item.isVegan || false);
    setEditIsVegetarian(item.isVegetarian || false);
    setEditAllergenDetails(item.allergenDetails || "");
    setEditCategoryId(item.categoryId);
    setEditingImageId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.updateItem(editingId, { 
        name: editName, 
        price: editPrice ? parseFloat(editPrice) : null, 
        price_secondary: editPriceSecondary ? parseFloat(editPriceSecondary) : null,
        price_label: editPriceLabel || null,
        price_secondary_label: editPriceSecondaryLabel || null,
        ingredients: editIngredients,
        allergens: editAllergens || null,
        is_favorite: editIsFavorite,
        taste_intensity: editTaste || null,
        service_style: editService || null,
        calories: (editCalories && !isNaN(parseInt(editCalories))) ? parseInt(editCalories) : null,
        is_vegan: editIsVegan,
        is_vegetarian: editIsVegetarian,
        allergen_details: editAllergenDetails || null,
        category_id: editCategoryId,
      });
      await publishChanges();
      setItems(prev => prev.map(item => 
        item.id === editingId ? { 
          ...item, 
          name: editName, 
          price: editPrice ? parseFloat(editPrice) : undefined, 
          priceSecondary: editPriceSecondary ? parseFloat(editPriceSecondary) : undefined,
          priceLabel: editPriceLabel || undefined,
          priceSecondaryLabel: editPriceSecondaryLabel || undefined,
          ingredients: editIngredients,
          allergens: editAllergens || undefined,
          isFavorite: editIsFavorite,
          tasteIntensity: editTaste || undefined,
          serviceStyle: editService || undefined,
          calories: editCalories ? parseInt(editCalories) : undefined,
          isVegan: editIsVegan,
          isVegetarian: editIsVegetarian,
          allergenDetails: editAllergenDetails || undefined,
          categoryId: editCategoryId,
        } : item
      ));
      setEditingId(null);
      showNotification("Ürün başarıyla güncellendi.");
    } catch (err: any) { 
      console.error(err);
      alert(`Güncelleme hatası: ${err?.message || "Bilinmeyen bir hata"}`);
    }
  };

  const cancelEdit = () => setEditingId(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !siteSettings) return;
    
    setSavingSettings(true);
    try {
      const url = await api.uploadSiteAsset(file, "hero_logo");
      const updated = { ...siteSettings, hero_logo_url: url };
      setSiteSettings(updated);
      await api.updateSiteSettings(updated);
      await publishChanges();
      showNotification("Logo başarıyla yüklendi.");
    } catch (err: any) {
      console.error(err);
      alert(`Logo yüklenirken hata oluştu: ${err?.message || "Lütfen internet bağlantınızı ve yetkilerinizi kontrol edin."}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteItem(id);
      await publishChanges();
      setItems(prev => prev.filter(i => i.id !== id));
      showNotification("Ürün silindi.");
    } catch (err) { console.error(err); }
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingImage(id);
    try {
      const url = await api.uploadProductImage(file, id);
      await api.updateItem(id, { image_url: url });
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

  const removeImage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu ürünün görselini kaldırmak istediğinize emin misiniz?")) return;
    try {
      await api.updateItem(id, { image_url: null });
      setItems(prev => prev.map(item => item.id === id ? { ...item, image: undefined } : item));
    } catch (err) {
      console.error("Görsel silinemedi:", err);
      alert("Görsel silinemedi.");
    }
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
        priceSecondary: newPriceSecondary ? parseFloat(newPriceSecondary) : undefined,
        priceLabel: newPriceLabel.trim() || undefined,
        priceSecondaryLabel: newPriceSecondaryLabel.trim() || undefined,
        description: "",
        ingredients: newIngredients.trim() || undefined,
        allergens: newAllergens.trim() || undefined,
        isAvailable: true,
        image: imageUrl,
        isFavorite: newIsFavorite,
        tasteIntensity: newTaste.trim() || undefined,
        serviceStyle: newService.trim() || undefined,
        calories: (newCalories && !isNaN(parseInt(newCalories))) ? parseInt(newCalories) : undefined,
        isVegan: newIsVegan,
        isVegetarian: newIsVegetarian,
        allergenDetails: newAllergenDetails.trim() || undefined,
      });

      await publishChanges();
      await refreshData();
      setNewName("");
      setNewPrice("");
      setNewPriceSecondary("");
      setNewPriceLabel("");
      setNewPriceSecondaryLabel("");
      setNewIngredients("");
      setNewAllergens("");
      setNewTaste("");
      setNewService("");
      setNewIsFavorite(false);
      setNewCalories("");
      setNewIsVegan(false);
      setNewIsVegetarian(false);
      setNewAllergenDetails("");
      setNewImagePreview(null);
      setShowAddModal(false);
      showNotification("Yeni ürün başarıyla eklendi.");
    } catch (err: any) {
      console.error(err);
      alert(`Ürün ekleme hatası: ${err?.message || "Bilinmeyen bir hata"}`);
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

  const toggleCampaign = async (id: string, current: boolean) => {
    try {
      await api.updateCampaign(id, { is_active: !current });
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
    } catch (err) { console.error(err); }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteCampaign(id);
      await publishChanges();
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err: any) { 
      console.error("Delete campaign error:", err); 
      alert("Kampanya silinemedi: " + (err.message || "Bilinmeyen sunucu hatası."));
    }
  };
  const startEditCampaign = (camp: Campaign) => {
    setEditingCampaign(camp);
    setNewCampTitle(camp.title);
    setNewCampDesc(camp.description || "");
    setNewCampType(camp.type);
    setNewCampPrice(camp.price?.toString() || "");
    setNewCampEndDate(camp.endDate || "");
    
    const previews = [null, null, null] as (string | null)[];
    if (camp.imageUrls) {
      camp.imageUrls.forEach((url, i) => { if (i < 3) previews[i] = url; });
    }
    setNewCampImagePreviews(previews);
    setNewCampImageFiles([null, null, null]);
    setActiveTab("campaigns");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCampImageSelect = (file: File, index: number) => {
    const newFiles = [...newCampImageFiles];
    newFiles[index] = file;
    setNewCampImageFiles(newFiles);
    
    const newPreviews = [...newCampImagePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setNewCampImagePreviews(newPreviews);
  };

  const addCampaign = async () => {
    if (!newCampTitle.trim()) return;
    setLoading(true);
    try {
      const campId = editingCampaign ? editingCampaign.id : `camp-${Date.now()}`;
      const finalImageUrls: string[] = [];

      for (let i = 0; i < 3; i++) {
        const file = newCampImageFiles[i];
        const preview = newCampImagePreviews[i];
        
        if (file) {
          const url = await api.uploadCampaignImage(file, campId);
          finalImageUrls.push(url);
        } else if (preview && editingCampaign?.imageUrls?.[i]) {
          // Only keep old image if it wasn't cleared in UI
          finalImageUrls.push(editingCampaign.imageUrls[i]);
        }
      }

      const campData = {
        title: newCampTitle.trim(),
        description: newCampDesc.trim() || null,
        type: newCampType,
        imageUrls: finalImageUrls,
        price: newCampPrice ? parseFloat(newCampPrice) : null,
        isActive: editingCampaign ? editingCampaign.isActive : true,
        endDate: newCampEndDate || null,
      };

      if (editingCampaign) {
        await api.updateCampaign(campId, {
          title: campData.title,
          description: campData.description as string | null,
          type: campData.type,
          image_urls: campData.imageUrls,
          price: campData.price,
          is_active: campData.isActive,
          end_date: campData.endDate,
          // @ts-ignore - explicitly clearing legacy field if it still exists in DB
          image_url: null
        });
      } else {
        await api.insertCampaign({ 
          ...campData, 
          id: campId,
          // @ts-ignore - ensure legacy field is handled
          image_url: null 
        } as Campaign);
      }

      await publishChanges();
      await refreshData();
      setNewCampTitle("");
      setNewCampDesc("");
      setNewCampPrice("");
      setNewCampType("discount");
      setNewCampEndDate("");
      setNewCampImageFiles([null, null, null]);
      setNewCampImagePreviews([null, null, null]);
      showNotification(editingCampaign ? "Kampanya güncellendi." : "Yeni kampanya eklendi.");
    } catch (err: any) {
      console.error(err);
      alert(`Kampanya kaydedilemedi: ${err?.message || "Bilinmeyen bir hata oluştu"}`);
    } finally {
      setLoading(false);
    }
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
      await publishChanges();
      setAnnouncements(prev => [...prev, ann]);
      setNewAnnText("");
      showNotification("Duyuru eklendi.");
    } catch (err) { console.error(err); }
  };

  // ========== CATEGORY MANAGEMENT ==========
  const saveCategoryEdit = async (catId: string) => {
    if (!editCategoryName.trim()) return;
    try {
      await api.updateCategory(catId, { name: editCategoryName.trim() });
      await publishChanges();
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, name: editCategoryName.trim() } : c));
      setEditingCategoryId(null);
      showNotification("Kategori adı güncellendi.");
    } catch (err) { console.error(err); }
  };

  const deleteCategory = async (catId: string) => {
    const productsInCat = items.filter(i => i.categoryId === catId);
    if (productsInCat.length > 0) {
      alert(`Bu kategoride ${productsInCat.length} adet ürün bulunmaktadır. Önce bu ürünleri başka bir kategoriye taşımalı veya silmelisiniz.`);
      return;
    }
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteCategory(catId);
      await publishChanges();
      setCategories(prev => prev.filter(c => c.id !== catId));
      showNotification("Kategori silindi.");
    } catch (err) { console.error(err); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const id = `c-${Date.now()}`;
      const newCat: Category = {
        id,
        name: newCatName.trim(),
        order: newCatOrder ? parseInt(newCatOrder) : categories.length + 1,
        isActive: true
      };
      await api.insertCategory(newCat);
      await publishChanges();
      setCategories(prev => [...prev, newCat].sort((a,b) => a.order - b.order));
      setNewCatName("");
      setNewCatOrder("");
      setShowAddCategoryModal(false);
      showNotification("Yeni kategori oluşturuldu.");
    } catch (err) { console.error(err); }
  };

  // ========== DND-KIT SORT ORDER LOGIC ==========
  const dndSensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const filteredItemsForSort = sortCategoryFilter === "all"
    ? items
    : items.filter(i => i.categoryId === sortCategoryFilter);

  const handleDragStart = (_event: DragStartEvent) => {
    setDraggingId(_event.active.id as string);
    // Mobil titreşim geri bildirimi
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredItemsForSort.findIndex(i => i.id === active.id);
    const newIndex = filteredItemsForSort.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredItemsForSort, oldIndex, newIndex);
    
    // Update sortOrder values
    const updatedWithOrder = reordered.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    // Merge back into full items list
    setItems(prev => {
      const otherItems = prev.filter(i => !updatedWithOrder.find(u => u.id === i.id));
      return [...otherItems, ...updatedWithOrder].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    });
    setSortOrderChanged(true);
  };

  const saveSortOrder = async () => {
    setSavingSortOrder(true);
    try {
      const updates = items
        .filter(i => sortCategoryFilter === "all" || i.categoryId === sortCategoryFilter)
        .map((item, idx) => ({ id: item.id, sort_order: idx + 1 }));
      await api.updateSortOrders(updates);
      await publishChanges();
      setSortOrderChanged(false);
    } catch (err) {
      console.error("Sort order save error:", err);
      alert("Sıralama kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSavingSortOrder(false);
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "products", label: "Ürünler", icon: <Package size={16} /> },
    { id: "announcements", label: "Duyurular", icon: <Megaphone size={16} /> },
    { id: "campaigns", label: "Kampanyalar", icon: <Tag size={16} /> },
    { id: "categories", label: "Kategorileri Yönet", icon: <ArrowUpDown size={16} /> },
    { id: "reports", label: "Raporlar", icon: <BarChart3 size={16} /> },
    { id: "featured", label: "Öne Çıkanlar", icon: <Star size={16} /> },
    { id: "settings", label: "Site Ayarları", icon: <Settings size={16} /> },
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
    <div className="p-4 sm:p-6 w-full text-neutral-200">
      
      {/* Notifications */}
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300",
          notification.type === 'success' ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"
        )}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}
      
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
                          <img src={newImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Fiyat 1 (₺)</label>
                      <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="350"
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Etiket 1 (Örn: Tek)</label>
                      <input type="text" value={newPriceLabel} onChange={e => setNewPriceLabel(e.target.value)} placeholder="Tek"
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Fiyat 2 (₺) — ops</label>
                      <input type="number" value={newPriceSecondary} onChange={e => setNewPriceSecondary(e.target.value)} placeholder="550"
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Etiket 2 (Örn: Duble)</label>
                      <input type="text" value={newPriceSecondaryLabel} onChange={e => setNewPriceSecondaryLabel(e.target.value)} placeholder="Duble"
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">İçerik Bilgisi — opsiyonel</label>
                    <textarea value={newIngredients} onChange={e => setNewIngredients(e.target.value)} placeholder="Ör: Votka · Lime Suyu · Şeker"
                      rows={2}
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Tat Yoğunluğu</label>
                      <input type="text" value={newTaste} onChange={e => setNewTaste(e.target.value)} placeholder="Ör: Sert, Aromatik"
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">Servis Şekli</label>
                      <input type="text" value={newService} onChange={e => setNewService(e.target.value)} placeholder="Ör: Rocks, Straight"
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-2 block font-semibold text-amber-500/80 tracking-widest uppercase">Yasal Bilgiler (1 Temmuz Uyumu)</label>
                    <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-3 space-y-4">
                      <div>
                        <label className="text-[10px] text-neutral-500 mb-1 block uppercase tracking-wider">Kalori (kcal)</label>
                        <input type="number" value={newCalories} onChange={e => setNewCalories(e.target.value)} placeholder="Ör: 245"
                          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group/vegan">
                          <input type="checkbox" checked={newIsVegan} onChange={e => setNewIsVegan(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-green-600 focus:ring-green-500/20" />
                          <span className="text-[11px] text-neutral-400 group-hover/vegan:text-green-500 transition-colors uppercase">Vegan</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group/veg">
                          <input type="checkbox" checked={newIsVegetarian} onChange={e => setNewIsVegetarian(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-emerald-600 focus:ring-emerald-500/20" />
                          <span className="text-[11px] text-neutral-400 group-hover/veg:text-emerald-500 transition-colors uppercase">Vejetaryen</span>
                        </label>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 mb-1 block uppercase tracking-wider">Detaylı Alerjen Uyarısı</label>
                        <textarea value={newAllergenDetails} onChange={e => setNewAllergenDetails(e.target.value)} placeholder="Ör: Bu ürün glüten ve kuruyemiş içermektedir..."
                          rows={2}
                          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 resize-none italic"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer group/infav">
                      <input type="checkbox" checked={newIsFavorite} onChange={e => setNewIsFavorite(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-amber-500 focus:ring-amber-500/20" />
                      <span className="text-xs text-neutral-400 group-hover/infav:text-amber-500 transition-colors uppercase tracking-wider font-medium">Müşteri Favorisi Olarak İşaretle</span>
                    </label>
                  </div>
                  
                  {/* Common Allergens (Tags) - Keeping for backwards compatibility */}
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">Alerjen Etiketleri (Kısa) — opsiyonel</label>
                    <input type="text" value={newAllergens} onChange={e => setNewAllergens(e.target.value)} placeholder="Ör: Sülfitler, Gluten"
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
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

          {/* Category filter + Sort save */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <ArrowUpDown size={16} className="text-neutral-400 shrink-0" />
              <select
                value={sortCategoryFilter}
                onChange={e => { setSortCategoryFilter(e.target.value); setSortOrderChanged(false); }}
                className="flex-1 bg-neutral-800 border border-neutral-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a0e0e] text-neutral-300"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {sortOrderChanged && (
              <button
                onClick={saveSortOrder}
                disabled={savingSortOrder}
                className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-amber-900/30"
              >
                {savingSortOrder ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Sıralamayı Kaydet
              </button>
            )}
          </div>

          <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredItemsForSort.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {filteredItemsForSort.map((item) => (
                  <SortableProductRow key={item.id} item={item} isDragging={draggingId === item.id}>
                    {({ listeners, attributes }) => (
                      <div className={cn(
                        "bg-neutral-800 rounded-xl border border-neutral-700 p-3 flex items-center gap-3 group transition-all",
                        draggingId === item.id && "ring-2 ring-amber-500/40"
                      )}>
                        {/* Drag Handle */}
                        <div
                          {...listeners}
                          {...attributes}
                          className="shrink-0 flex items-center justify-center w-8 h-10 rounded-lg bg-neutral-700/50 hover:bg-neutral-600 cursor-grab active:cursor-grabbing transition-colors touch-none"
                          title="Sürükle"
                        >
                          <GripVertical size={16} className="text-neutral-400" />
                        </div>

                        {/* Image */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-700 border border-neutral-600 shrink-0 cursor-pointer"
                          onClick={() => { setEditingImageId(item.id); setTimeout(() => fileInputRef.current?.click(), 50); }}
                        >
                          {uploadingImage === item.id && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                              <Loader2 size={12} className="text-white animate-spin" />
                            </div>
                          )}
                          {item.image ? (
                            <>
                              <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                              <button onClick={(e) => removeImage(item.id, e)} className="absolute -top-0.5 -right-0.5 bg-red-600/90 text-white rounded-full p-0.5 z-20 hover:bg-red-500 scale-75"><X size={10} /></button>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImagePlus size={12} className="text-neutral-500" /></div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {editingId === item.id ? (
                            <div className="space-y-1">
                              <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-sm w-full" placeholder="Ürün adı" />
                              <input value={editIngredients} onChange={e => setEditIngredients(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-neutral-400" placeholder="İçerik" />
                              <input value={editAllergens} onChange={e => setEditAllergens(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-orange-400/70" placeholder="Alerjenler" />
                              <div className="grid grid-cols-2 gap-1">
                                <input value={editTaste} onChange={e => setEditTaste(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-amber-500/80" placeholder="Tat Yoğunluğu (Sert, Tatlı vb.)" title="Tat Yoğunluğu" />
                                <input value={editService} onChange={e => setEditService(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-blue-400/80" placeholder="Servis Şekli (Rocks, Straight vb.)" title="Servis Şekli" />
                              </div>
                              <div className="flex items-center gap-2 px-1">
                                <label className="flex items-center gap-1.5 cursor-pointer group/fav">
                                  <input type="checkbox" checked={editIsFavorite} onChange={e => setEditIsFavorite(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-amber-500 focus:ring-amber-500/20" />
                                  <span className="text-[10px] text-neutral-400 group-hover/fav:text-amber-500 transition-colors">Favori</span>
                                </label>
                                <div className="h-3 w-[1px] bg-neutral-700 mx-1" />
                                <label className="flex items-center gap-1.5 cursor-pointer group/vegan">
                                  <input type="checkbox" checked={editIsVegan} onChange={e => setEditIsVegan(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-green-500 focus:ring-green-500/20" />
                                  <span className="text-[10px] text-neutral-400 group-hover/vegan:text-green-500 transition-colors">Vegan</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer group/veg">
                                  <input type="checkbox" checked={editIsVegetarian} onChange={e => setEditIsVegetarian(e.target.checked)} className="rounded border-neutral-600 bg-neutral-900 text-emerald-500 focus:ring-emerald-500/20" />
                                  <span className="text-[10px] text-neutral-400 group-hover/veg:text-emerald-500 transition-colors">Vejetaryen</span>
                                </label>
                              </div>
                              <div className="mt-1">
                                <label className="text-[10px] text-neutral-500 mb-0.5 block uppercase">Kategori Değiştir</label>
                                <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}
                                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] text-amber-100"
                                >
                                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <input type="number" value={editCalories} onChange={e => setEditCalories(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-amber-200/70" placeholder="Kcal" title="Kalori" />
                                <input value={editAllergenDetails} onChange={e => setEditAllergenDetails(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-lg px-2 py-1 text-[10px] w-full text-red-400/70 italic" placeholder="Detaylı Alerjen Uyarısı" title="Alerjen Detayı" />
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-md px-2 py-0.5 text-[10px] w-full" placeholder="Fiyat 1" />
                                <input type="number" value={editPriceSecondary} onChange={e => setEditPriceSecondary(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-md px-2 py-0.5 text-[10px] w-full" placeholder="Fiyat 2" />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm truncate">{item.name}</span>
                                {item.isRecommended && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded uppercase">Öneri</span>}
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
                        <button onClick={() => toggleAvailability(item.id, item.isAvailable)} className="shrink-0">
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
                        <div className="flex items-center gap-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                          {editingId === item.id ? (
                            <>
                              <button onClick={saveEdit} className="text-green-400 hover:bg-green-400/10 p-1 rounded-lg transition"><Save size={12} /></button>
                              <button onClick={cancelEdit} className="text-neutral-400 hover:bg-white/5 p-1 rounded-lg transition"><X size={12} /></button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(item)} className="text-neutral-400 hover:text-white hover:bg-white/5 p-1 rounded-lg transition"><Edit3 size={12} /></button>
                          )}
                          <button onClick={() => toggleRecommended(item.id, item.isRecommended)} className={cn("p-1 rounded-lg transition", item.isRecommended ? "text-amber-400" : "text-gray-600")}>
                            <Star size={12} className={item.isRecommended ? "fill-amber-400" : ""} />
                          </button>
                          <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:bg-red-400/10 p-1 rounded-lg transition"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    )}
                  </SortableProductRow>
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

      {/* ========== CAMPAIGNS TAB ========== */}
      {activeTab === "campaigns" && (
        <div>
          <h2 className="text-2xl font-semibold mb-1">Kampanya Yönetimi</h2>
          <p className="text-neutral-400 text-sm mb-6">Ana menü sayfasındaki "Özel Fırsatlar" alanını buradan yönetin.</p>

          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 mb-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              {editingCampaign ? <Edit3 size={14} /> : <Plus size={14} />} 
              {editingCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Ekle"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-400 mb-3 block">Kampanya Görselleri / GIF (Maks. 3)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="flex flex-col gap-2">
                      {newCampImagePreviews[idx] ? (
                        <div className="relative aspect-[2/1] rounded-xl overflow-hidden border border-neutral-600 bg-neutral-900 group">
                          <img src={newCampImagePreviews[idx]!} alt={`Preview ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                          <button 
                            onClick={() => {
                              const nextPreviews = [...newCampImagePreviews];
                              nextPreviews[idx] = null;
                              setNewCampImagePreviews(nextPreviews);
                              const nextFiles = [...newCampImageFiles];
                              nextFiles[idx] = null;
                              setNewCampImageFiles(nextFiles);
                            }} 
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="aspect-[2/1] rounded-xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center bg-neutral-900/50 cursor-pointer hover:border-neutral-500 transition-colors">
                          <ImagePlus size={20} className="text-neutral-600 mb-1" />
                          <span className="text-[10px] text-neutral-500">Görsel {idx + 1}</span>
                          <input type="file" accept="image/*,.gif" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCampImageSelect(e.target.files[0], idx); }} />
                        </label>
                      )}
                      {newCampImagePreviews[idx] && (
                        <label className="cursor-pointer text-center py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors">
                          <span className="text-[10px] text-neutral-300 font-medium">Değiştir</span>
                          <input type="file" accept="image/*,.gif" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCampImageSelect(e.target.files[0], idx); }} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-500 mt-2 italic">* .gif formatı desteklenir. Hareketli görseller PWA'da otomatik oynatılır.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-400 mb-1 block">Kampanya Başlığı *</label>
                <input type="text" value={newCampTitle} onChange={e => setNewCampTitle(e.target.value)}
                  placeholder="Ör: 1+1 Shot Kampanyası"
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-400 mb-1 block">Açıklama</label>
                <input type="text" value={newCampDesc} onChange={e => setNewCampDesc(e.target.value)}
                  placeholder="Ör: Her shot alana ikincisi bedava!"
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Kampanya Tipi</label>
                <select value={newCampType} onChange={e => setNewCampType(e.target.value as Campaign["type"])}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                >
                  <option value="discount">İndirim</option>
                  <option value="bundle">Paket Teklif</option>
                  <option value="animated">Animasyonlu (1+1 vb.)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Fiyat (₺)</label>
                <input type="number" value={newCampPrice} onChange={e => setNewCampPrice(e.target.value)}
                  placeholder="Ör: 350"
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-neutral-400 mb-1 block">Bitiş Tarihi (FOMO etiket için, opsiyonel)</label>
                <input type="datetime-local" value={newCampEndDate} onChange={e => setNewCampEndDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e] [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              {editingCampaign && (
                <button onClick={() => {
                  setEditingCampaign(null); setNewCampTitle(""); setNewCampDesc("");
                  setNewCampPrice(""); setNewCampEndDate(""); 
                  setNewCampImagePreviews([null, null, null]); 
                  setNewCampImageFiles([null, null, null]);
                }}
                  className="flex-1 border border-neutral-600 text-neutral-300 px-5 py-2.5 rounded-xl text-sm font-medium transition hover:bg-neutral-700"
                >
                  İptal
                </button>
              )}
              <button onClick={addCampaign} disabled={loading}
                className={cn("w-full bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2", 
                  editingCampaign ? "flex-1" : "w-full"
                )}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {editingCampaign ? "Değişiklikleri Kaydet" : "Kampanyayı Ekle"}
              </button>
            </div>
          </div>

          {/* Kampanya Listesi */}
          <div className="space-y-3">
            {campaigns.length === 0 && (
              <p className="text-neutral-500 text-sm text-center py-8">Henüz kampanya eklenmedi.</p>
            )}
            {campaigns.map(camp => (
              <div key={camp.id} className={cn(
                "flex items-start gap-4 bg-neutral-800 border rounded-xl px-5 py-4 transition-colors",
                camp.isActive ? "border-[#D4AF37]/20" : "border-neutral-700 opacity-60"
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{camp.title}</p>
                    <span className={cn(
                      "text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold",
                      camp.type === "animated" ? "bg-amber-500/20 text-amber-400" :
                      camp.type === "bundle" ? "bg-purple-500/20 text-purple-400" :
                      "bg-blue-500/20 text-blue-400"
                    )}>
                      {camp.type === "animated" ? "Animasyonlu" : camp.type === "bundle" ? "Paket" : "İndirim"}
                    </span>
                    {camp.isActive
                      ? <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Aktif</span>
                      : <span className="text-[9px] bg-neutral-700 text-neutral-400 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Pasif</span>
                    }
                  </div>
                  {camp.description && <p className="text-xs text-neutral-400 mt-1">{camp.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {camp.price !== undefined && (
                      <span className="text-[#D4AF37] text-xs font-semibold">₺{camp.price}</span>
                    )}
                    {camp.endDate && (
                      <span className="text-[10px] text-orange-400">Bitiş: {new Date(camp.endDate).toLocaleString("tr-TR")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEditCampaign(camp)}
                    className="text-white hover:bg-neutral-700 p-2 rounded-lg transition"
                    title="Düzenle"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => toggleCampaign(camp.id, camp.isActive)}
                    className={cn("p-2 rounded-lg transition", camp.isActive ? "text-amber-400 hover:bg-amber-400/10" : "text-green-400 hover:bg-green-400/10")}
                    title={camp.isActive ? "Pasife Al" : "Aktife Al"}
                  >
                    {camp.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => deleteCampaign(camp.id)}
                    className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition"
                    title="Kampanyayı Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== CATEGORIES TAB ========== */}
      {activeTab === "categories" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Kategori Yönetimi</h2>
              <p className="text-neutral-400 text-sm">{categories.length} kategori mevcut</p>
            </div>
            <button onClick={() => setShowAddCategoryModal(true)}
              className="flex items-center gap-2 bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Yeni Kategori
            </button>
          </div>

          <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900/50 border-b border-neutral-700">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Sıra</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Kategori Adı</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">İşlemler</th>
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
                          <input 
                            type="text" 
                            value={editCategoryName} 
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:border-[#4a0e0e]"
                            autoFocus
                          />
                          <button onClick={() => saveCategoryEdit(cat.id)} className="text-green-400 p-1.5 hover:bg-green-400/10 rounded-lg"><Save size={16} /></button>
                          <button onClick={() => setEditingCategoryId(null)} className="text-neutral-500 p-1.5 hover:bg-white/5 rounded-lg"><X size={16} /></button>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-white uppercase tracking-tight">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingCategoryId(cat.id); setEditCategoryName(cat.name); }}
                          className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Category Modal */}
          {showAddCategoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddCategoryModal(false)} />
              <div className="relative bg-neutral-800 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-lg font-semibold mb-4">Yeni Kategori Ekle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">Kategori Adı</label>
                    <input 
                      type="text" 
                      value={newCatName} 
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Örn: SICAK KAHVELER"
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">Sıralama (Opsiyonel)</label>
                    <input 
                      type="number" 
                      value={newCatOrder} 
                      onChange={(e) => setNewCatOrder(e.target.value)}
                      placeholder={String(categories.length + 1)}
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowAddCategoryModal(false)} className="flex-1 border border-neutral-600 text-neutral-300 rounded-xl py-2.5 text-sm hover:bg-neutral-700 transition">İptal</button>
                    <button onClick={handleAddCategory} className="flex-1 bg-[#4a0e0e] hover:bg-[#660f0f] text-white rounded-xl py-2.5 text-sm font-medium transition">Ekle</button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                      <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
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
      {/* ========== SETTINGS TAB ========== */}
      {activeTab === "settings" && (
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold mb-1">Site Ayarları</h2>
          <p className="text-neutral-400 text-sm mb-6">Müşteri menüsünün alt kısmında yer alan iletişim ve sosyal medya bilgilerini yönetin.</p>

          {!siteSettings ? (
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 text-center text-neutral-500 text-sm">Ayar verisi yüklenemedi. Lütfen önce SQL tablosunu oluşturun.</div>
          ) : (
            <div className="space-y-8">
              {/* BRAND MANAGEMENT SECTION */}
              <div className="bg-neutral-900/50 border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Settings size={80} className="text-[#D4AF37]" />
                 </div>
                 <h3 className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Tag size={16} /> Logo ve Başlık
                 </h3>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                       <div className="relative w-32 h-32 rounded-2xl bg-neutral-800 border-2 border-dashed border-neutral-700 overflow-hidden group/logo flex items-center justify-center shrink-0">
                          {siteSettings.hero_logo_url ? (
                             <img src={siteSettings.hero_logo_url} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-2" />
                          ) : (
                             <div className="text-neutral-600 text-center p-4">
                                <ImagePlus size={32} className="mx-auto mb-2 opacity-20" />
                                <span className="text-[10px] uppercase font-bold tracking-tighter">Logo Henüz Yok</span>
                             </div>
                          )}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                             <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                             <div className="text-white text-center">
                                <ImagePlus size={20} className="mx-auto mb-1" />
                                <span className="text-[10px] font-bold uppercase">Değiştir</span>
                             </div>
                          </label>
                       </div>
                       
                       <div className="flex-1 space-y-4">
                          <div>
                             <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2 font-medium">Menü Ana Başlığı (Logo Altı)</label>
                             <input type="text" value={siteSettings.menu_title || ""} onChange={e => setSiteSettings({ ...siteSettings, menu_title: e.target.value })}
                               placeholder="Örn: Picchio Cocktail Bar Menüsü"
                               className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                             />
                          </div>
                          
                          <div className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/50">
                             <div>
                                <p className="text-xs font-semibold text-white">Üst Bar Görünürlüğü</p>
                                <p className="text-[10px] text-neutral-500">Profil ikonu olan ince şeridi göster/gizle.</p>
                             </div>
                             <button onClick={() => setSiteSettings({ ...siteSettings, is_header_visible: !siteSettings.is_header_visible })}
                               className={cn("p-1.5 rounded-lg transition-colors", siteSettings.is_header_visible ? "text-[#D4AF37]" : "text-neutral-600")}
                             >
                                {siteSettings.is_header_visible ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* DYNAMIC DESIGN SYSTEM SECTION */}
              <div className="bg-neutral-800/80 border border-neutral-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full" />
                 <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Sparkles size={16} className="text-amber-400" /> Tasarım ve Stil Özelleştirme
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Colors Group */}
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter mb-2 border-b border-neutral-700 pb-1">Renk Paleti</p>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                             <label className="block text-[10px] text-neutral-400 uppercase font-bold">Ana Renk</label>
                             <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-xl">
                                <input type="color" value={siteSettings.primary_color || "#4E0000"} 
                                  onChange={e => setSiteSettings({...siteSettings, primary_color: e.target.value})}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none" 
                                />
                                <span className="text-[10px] uppercase font-mono text-neutral-400">{siteSettings.primary_color || "#4E0000"}</span>
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="block text-[10px] text-neutral-400 uppercase font-bold">Yardımcı Renk</label>
                             <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-xl">
                                <input type="color" value={siteSettings.secondary_color || "#1a0404"} 
                                  onChange={e => setSiteSettings({...siteSettings, secondary_color: e.target.value})}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none" 
                                />
                                <span className="text-[10px] uppercase font-mono text-neutral-400">{siteSettings.secondary_color || "#1a0404"}</span>
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="block text-[10px] text-neutral-400 uppercase font-bold">Altın / Vurgu</label>
                             <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-xl">
                                <input type="color" value={siteSettings.accent_gold || "#D4AF37"} 
                                  onChange={e => setSiteSettings({...siteSettings, accent_gold: e.target.value})}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none" 
                                />
                                <span className="text-[10px] uppercase font-mono text-neutral-400">{siteSettings.accent_gold || "#D4AF37"}</span>
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="block text-[10px] text-neutral-400 uppercase font-bold">Buton Rengi</label>
                             <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-xl">
                                <input type="color" value={siteSettings.button_color || "#4a0e0e"} 
                                  onChange={e => setSiteSettings({...siteSettings, button_color: e.target.value})}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none" 
                                />
                                <span className="text-[10px] uppercase font-mono text-neutral-400">{siteSettings.button_color || "#4a0e0e"}</span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3 pt-2">
                          <label className="block text-[10px] text-neutral-400 uppercase font-bold border-t border-neutral-700 pt-3">Arka Plan Gradyanı</label>
                          <div className="flex items-center gap-4">
                             <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-xl">
                                <input type="color" value={siteSettings.bg_gradient_start || "#4E0000"} 
                                  onChange={e => setSiteSettings({...siteSettings, bg_gradient_start: e.target.value})}
                                  className="w-8 h-8 rounded-lg cursor-pointer" 
                                />
                                <span className="text-[10px] uppercase font-mono text-neutral-400">Başlangıç</span>
                             </div>
                             <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-xl">
                                <input type="color" value={siteSettings.bg_gradient_end || "#000000"} 
                                  onChange={e => setSiteSettings({...siteSettings, bg_gradient_end: e.target.value})}
                                  className="w-8 h-8 rounded-lg cursor-pointer" 
                                />
                                <span className="text-[10px] uppercase font-mono text-neutral-400">Bitiş</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Styling Group */}
                    <div className="space-y-5">
                       <p className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter mb-2 border-b border-neutral-700 pb-1">Genel Stil ve Efektler</p>
                       
                       <div className="space-y-4">
                          {/* Font Family */}
                          <div>
                             <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-2">Yazı Tipi (Font)</label>
                             <select value={siteSettings.font_family || 'Inter'} 
                               onChange={e => setSiteSettings({...siteSettings, font_family: e.target.value})}
                               className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50"
                             >
                                <option value="Inter">Modern Sans (Inter)</option>
                                <option value="Serif">Klasik Serif (Georgia)</option>
                                <option value="Classic">Zamansız (Times)</option>
                                <option value="system-ui">Sistem Yazı Tipi</option>
                             </select>
                          </div>

                          {/* Border Radius Slider */}
                          <div>
                             <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] text-neutral-400 uppercase font-bold">Köşe Yumuşaklığı</label>
                                <span className="text-[10px] text-amber-500 font-bold">{siteSettings.border_radius || 12}px</span>
                             </div>
                             <input type="range" min="0" max="40" value={siteSettings.border_radius || 12} 
                               onChange={e => setSiteSettings({...siteSettings, border_radius: parseInt(e.target.value)})}
                               className="w-full accent-amber-500 h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer" 
                             />
                          </div>

                          {/* Glass Blur Slider */}
                          <div>
                             <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] text-neutral-400 uppercase font-bold">Cam Efekti (Blur)</label>
                                <span className="text-[10px] text-amber-500 font-bold">{siteSettings.glass_blur || 12}px</span>
                             </div>
                             <input type="range" min="0" max="32" value={siteSettings.glass_blur || 12} 
                               onChange={e => setSiteSettings({...siteSettings, glass_blur: parseInt(e.target.value)})}
                               className="w-full accent-amber-500 h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer" 
                             />
                          </div>

                          {/* Noise Opacity Slider */}
                          <div>
                             <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] text-neutral-400 uppercase font-bold">Arka Plan Dokusu (Noise)</label>
                                <span className="text-[10px] text-amber-500 font-bold">%{Math.round((siteSettings.noise_opacity || 0.05) * 100)}</span>
                             </div>
                             <input type="range" min="0" max="20" step="1" value={(siteSettings.noise_opacity || 0.05) * 100} 
                               onChange={e => setSiteSettings({...siteSettings, noise_opacity: parseInt(e.target.value) / 100})}
                               className="w-full accent-amber-500 h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer" 
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-[11px] font-bold text-white mb-1 uppercase tracking-tight">Önemli Not</p>
                       <p className="text-[10px] text-neutral-400 leading-relaxed">
                          Burada yaptığınız değişiklikler tüm menü sayısını ve ziyaretçi deneyimini anında etkiler. 
                          Değişikliklerin kaydedilmesi için en alttaki <strong>"Kaydet"</strong> butonuna basmayı unutmayın.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5 space-y-4">
                 <h3 className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">İletişim ve Adres Bilgileri</h3>
                 <div>
                    <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">Fiziksel Adres</label>
                    <input type="text" value={siteSettings.address} onChange={e => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                    />
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">Telefon</label>
                      <input type="text" value={siteSettings.phone} onChange={e => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">WhatsApp Linki</label>
                      <input type="text" value={siteSettings.whatsapp_url} onChange={e => setSiteSettings({ ...siteSettings, whatsapp_url: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">Instagram Linki</label>
                      <input type="text" value={siteSettings.instagram_url} onChange={e => setSiteSettings({ ...siteSettings, instagram_url: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">Google Maps Linki</label>
                      <input type="text" value={siteSettings.maps_url} onChange={e => setSiteSettings({ ...siteSettings, maps_url: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">Çalışma Saatleri</label>
                    <input type="text" value={siteSettings.working_hours} onChange={e => setSiteSettings({ ...siteSettings, working_hours: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      placeholder="Örn: Hafta İçi: 18:00 - 02:00 | Hafta Sonu: 18:00 - 04:00"
                    />
                 </div>

                 <div>
                    <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1.5 font-medium">Alt Bilgi Metni (Copyright)</label>
                    <input type="text" value={siteSettings.footer_text || ""} onChange={e => setSiteSettings({ ...siteSettings, footer_text: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#4a0e0e]"
                      placeholder="Örn: © 2026 Picchio Cocktail Bar"
                    />
                 </div>

                 <div className="pt-4 border-t border-neutral-700 flex justify-end">
                    <button onClick={async () => {
                      setSavingSettings(true);
                      try {
                        await api.updateSiteSettings(siteSettings);
                        await publishChanges();
                        alert("Ayarlar başarıyla kaydedildi!");
                      } catch (err) {
                        console.error(err);
                        alert("Kaydedilirken hata oluştu.");
                      } finally {
                        setSavingSettings(false);
                      }
                    }} disabled={savingSettings}
                      className="flex items-center gap-2 bg-[#4a0e0e] hover:bg-[#660f0f] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                    >
                      {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                      Kaydet
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== REPORTS TAB ========== */}
      {activeTab === "reports" && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Analiz ve Raporlar</h2>
                <p className="text-neutral-400 text-sm">Son 7 günün etkileşim verileri.</p>
              </div>
              <div className="flex bg-neutral-800 rounded-xl p-1 border border-neutral-700">
                 <div className="px-4 py-1.5 bg-[#4a0e0e] text-white text-xs font-bold rounded-lg shadow-lg">7 GÜN</div>
              </div>
           </div>

           {/* Charts Grid */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-neutral-800/50 backdrop-blur-sm rounded-3xl border border-neutral-700 p-6">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-8">Günlük Etkileşimler</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsSummary?.dailyStats || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666" 
                        fontSize={10} 
                        tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')} 
                      />
                      <YAxis stroke="#666" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                      <Line type="monotone" name="Görüntülenme" dataKey="views" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" name="Tıklanma" dataKey="clicks" stroke="#4a0e0e" strokeWidth={3} dot={{ fill: '#4a0e0e', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0f0404] rounded-3xl border border-[#4a0e0e]/30 p-6 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={120} className="text-amber-500" />
                 </div>
                 <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2">Toplam Etkileşim</h3>
                 <p className="text-4xl font-black text-white">
                    {analyticsSummary?.dailyStats?.reduce((acc: number, curr: any) => acc + (curr.views || 0) + (curr.clicks || 0), 0) || 0}
                 </p>
                 <div className="flex gap-4 mt-6">
                    <div>
                       <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Görüntülenme</p>
                       <p className="text-lg font-bold text-white">{analyticsSummary?.dailyStats?.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0) || 0}</p>
                    </div>
                    <div className="w-[1px] h-10 bg-neutral-800" />
                    <div>
                       <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Tıklanma</p>
                       <p className="text-lg font-bold text-white">{analyticsSummary?.dailyStats?.reduce((acc: number, curr: any) => acc + (curr.clicks || 0), 0) || 0}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Top Lists Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-neutral-800 rounded-3xl border border-neutral-700 p-6">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                       <Martini size={14} className="text-amber-500" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">En Çok İncelenen Ürünler</h3>
                 </div>
                 <div className="space-y-3">
                    {analyticsSummary?.topProductIds?.map((stat: any, idx: number) => {
                      const item = items.find(i => i.id === stat.id);
                      return (
                        <div key={stat.id} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-2xl border border-neutral-800 group hover:border-amber-500/20 transition-colors">
                           <div className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-xs font-black rounded-lg text-neutral-500">#{idx + 1}</div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{item?.name || 'Bilinmeyen Ürün'}</p>
                              <p className="text-[10px] text-neutral-500 truncate">{categories.find(c => c.id === item?.categoryId)?.name}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-amber-500">{stat.count}</p>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">Görüntülenme</p>
                           </div>
                        </div>
                      );
                    })}
                    {!analyticsSummary?.topProductIds?.length && <p className="text-center py-6 text-neutral-600 text-sm italic">Henüz yeterli veri toplanmadı.</p>}
                 </div>
              </div>

              {/* Top Categories */}
              <div className="bg-neutral-800 rounded-3xl border border-neutral-700 p-6">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#4a0e0e]/10 rounded-lg flex items-center justify-center border border-[#4a0e0e]/20">
                       <ArrowUpDown size={14} className="text-red-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">En Çok İncelenen Kategoriler</h3>
                 </div>
                 <div className="space-y-3">
                    {analyticsSummary?.topCategoryIds?.map((stat: any, idx: number) => {
                      const cat = categories.find(c => c.id === stat.id);
                      return (
                        <div key={stat.id} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-2xl border border-neutral-800 hover:border-[#4a0e0e]/20 transition-colors">
                           <div className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-xs font-black rounded-lg text-neutral-500">#{idx + 1}</div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{cat?.name || 'Bilinmeyen Kategori'}</p>
                              <p className="text-[10px] text-neutral-500">Menüde yoğun ilgi gören bölüm</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-red-500">{stat.count}</p>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">İlgi Skoru</p>
                           </div>
                        </div>
                      );
                    })}
                    {!analyticsSummary?.topCategoryIds?.length && <p className="text-center py-6 text-neutral-600 text-sm italic">Henüz yeterli veri toplanmadı.</p>}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
