"use client";

import { useState, useRef } from "react";
import * as api from "@/lib/api";
import { MenuItem } from "@/lib/types";
import { publishChanges } from "@/app/actions";

export interface ProductActions {
  // Edit state
  editingId: string | null;
  editName: string;
  setEditName: (v: string) => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  editPriceSecondary: string;
  setEditPriceSecondary: (v: string) => void;
  editPriceLabel: string;
  setEditPriceLabel: (v: string) => void;
  editPriceSecondaryLabel: string;
  setEditPriceSecondaryLabel: (v: string) => void;
  editIngredients: string;
  setEditIngredients: (v: string) => void;
  editAllergens: string;
  setEditAllergens: (v: string) => void;
  editTaste: string;
  setEditTaste: (v: string) => void;
  editService: string;
  setEditService: (v: string) => void;
  editIsFavorite: boolean;
  setEditIsFavorite: (v: boolean) => void;
  editCalories: string;
  setEditCalories: (v: string) => void;
  editIsVegan: boolean;
  setEditIsVegan: (v: boolean) => void;
  editIsVegetarian: boolean;
  setEditIsVegetarian: (v: boolean) => void;
  editAllergenDetails: string;
  setEditAllergenDetails: (v: string) => void;
  editCategoryId: string;
  setEditCategoryId: (v: string) => void;
  editingImageId: string | null;
  setEditingImageId: (v: string | null) => void;
  uploadingImage: string | null;
  // Add product state
  showAddModal: boolean;
  setShowAddModal: (v: boolean) => void;
  newName: string;
  setNewName: (v: string) => void;
  newPrice: string;
  setNewPrice: (v: string) => void;
  newPriceSecondary: string;
  setNewPriceSecondary: (v: string) => void;
  newPriceLabel: string;
  setNewPriceLabel: (v: string) => void;
  newPriceSecondaryLabel: string;
  setNewPriceSecondaryLabel: (v: string) => void;
  newCategory: string;
  setNewCategory: (v: string) => void;
  newIngredients: string;
  setNewIngredients: (v: string) => void;
  newAllergens: string;
  setNewAllergens: (v: string) => void;
  newTaste: string;
  setNewTaste: (v: string) => void;
  newService: string;
  setNewService: (v: string) => void;
  newIsFavorite: boolean;
  setNewIsFavorite: (v: boolean) => void;
  newCalories: string;
  setNewCalories: (v: string) => void;
  newIsVegan: boolean;
  setNewIsVegan: (v: boolean) => void;
  newIsVegetarian: boolean;
  setNewIsVegetarian: (v: boolean) => void;
  newAllergenDetails: string;
  setNewAllergenDetails: (v: string) => void;
  newImageFile: File | null;
  newImagePreview: string | null;
  handleNewImageSelect: (file: File) => void;
  clearNewImage: () => void;
  // Sort order
  sortOrderChanged: boolean;
  setSortOrderChanged: (v: boolean) => void;
  savingSortOrder: boolean;
  sortCategoryFilter: string;
  setSortCategoryFilter: (v: string) => void;
  draggingId: string | null;
  // File input ref
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  // Actions
  startEdit: (item: MenuItem) => void;
  saveEdit: () => Promise<void>;
  cancelEdit: () => void;
  addItem: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string, current: boolean) => Promise<void>;
  toggleRecommended: (id: string, current: boolean | undefined) => Promise<void>;
  handleImageUpload: (id: string, file: File) => Promise<void>;
  removeImage: (id: string, e: React.MouseEvent) => Promise<void>;
  saveSortOrder: (items: MenuItem[], filterCategory: string) => Promise<void>;
}

export function useProductActions(
  items: MenuItem[],
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>,
  categories: { id: string; name: string }[],
  refresh: () => Promise<void>,
  showNotification: (message: string, type?: "success" | "error") => void,
): ProductActions {
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
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

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

  const [sortOrderChanged, setSortOrderChanged] = useState(false);
  const [savingSortOrder, setSavingSortOrder] = useState(false);
  const [sortCategoryFilter, setSortCategoryFilter] = useState<string>("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNewImageSelect = (file: File) => {
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const clearNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview(null);
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

  const cancelEdit = () => setEditingId(null);

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
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
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
              }
            : item
        )
      );
      setEditingId(null);
      showNotification("Urun basariyla guncellendi.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen bir hata";
      console.error(err);
      showNotification(`Guncelleme hatasi: ${msg}`, "error");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.deleteItem(id);
      await publishChanges();
      setItems((prev) => prev.filter((i) => i.id !== id));
      showNotification("Urun silindi.");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await api.updateItem(id, { is_available: !current });
      await publishChanges();
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isAvailable: !current } : i)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRecommended = async (id: string, current: boolean | undefined) => {
    try {
      await api.updateItem(id, { is_recommended: !current });
      await publishChanges();
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRecommended: !current } : i)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingImage(id);
    try {
      const url = await api.uploadProductImage(file, id);
      await api.updateItem(id, { image_url: url });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, image: url } : item)));
    } catch (err) {
      console.error("Image upload error:", err);
      showNotification("Gorsel yuklenemedi.", "error");
    } finally {
      setUploadingImage(null);
      setEditingImageId(null);
    }
  };

  const removeImage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.updateItem(id, { image_url: null });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, image: undefined } : item)));
    } catch (err) {
      console.error("Gorsel silinemedi:", err);
      showNotification("Gorsel silinemedi.", "error");
    }
  };

  const addItem = async () => {
    if (!newName.trim()) return;
    try {
      const id = `item-${Date.now()}`;
      let imageUrl: string | undefined;
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
      await refresh();
      setNewName(""); setNewPrice(""); setNewPriceSecondary(""); setNewPriceLabel(""); setNewPriceSecondaryLabel("");
      setNewIngredients(""); setNewAllergens(""); setNewTaste(""); setNewService("");
      setNewIsFavorite(false); setNewCalories(""); setNewIsVegan(false); setNewIsVegetarian(false);
      setNewAllergenDetails(""); setNewImagePreview(null); setNewImageFile(null);
      setShowAddModal(false);
      showNotification("Yeni urun basariyla eklendi.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen bir hata";
      console.error(err);
      showNotification(`Urun ekleme hatasi: ${msg}`, "error");
    }
  };

  const saveSortOrder = async (itemsToSort: MenuItem[], filterCategory: string) => {
    setSavingSortOrder(true);
    try {
      const updates = itemsToSort
        .filter((i) => filterCategory === "all" || i.categoryId === filterCategory)
        .map((item, idx) => ({ id: item.id, sort_order: idx + 1 }));
      await api.updateSortOrders(updates);
      await publishChanges();
      setSortOrderChanged(false);
    } catch (err) {
      console.error("Sort order save error:", err);
      showNotification("Siralama kaydedilemedi.", "error");
    } finally {
      setSavingSortOrder(false);
    }
  };

  return {
    editingId, editName, setEditName, editPrice, setEditPrice,
    editPriceSecondary, setEditPriceSecondary, editPriceLabel, setEditPriceLabel,
    editPriceSecondaryLabel, setEditPriceSecondaryLabel,
    editIngredients, setEditIngredients, editAllergens, setEditAllergens,
    editTaste, setEditTaste, editService, setEditService,
    editIsFavorite, setEditIsFavorite, editCalories, setEditCalories,
    editIsVegan, setEditIsVegan, editIsVegetarian, setEditIsVegetarian,
    editAllergenDetails, setEditAllergenDetails, editCategoryId, setEditCategoryId,
    editingImageId, setEditingImageId, uploadingImage,
    showAddModal, setShowAddModal,
    newName, setNewName, newPrice, setNewPrice,
    newPriceSecondary, setNewPriceSecondary, newPriceLabel, setNewPriceLabel,
    newPriceSecondaryLabel, setNewPriceSecondaryLabel,
    newCategory, setNewCategory, newIngredients, setNewIngredients,
    newAllergens, setNewAllergens, newTaste, setNewTaste, newService, setNewService,
    newIsFavorite, setNewIsFavorite, newCalories, setNewCalories,
    newIsVegan, setNewIsVegan, newIsVegetarian, setNewIsVegetarian,
    newAllergenDetails, setNewAllergenDetails,
    newImageFile, newImagePreview, handleNewImageSelect, clearNewImage,
    sortOrderChanged, setSortOrderChanged, savingSortOrder,
    sortCategoryFilter, setSortCategoryFilter, draggingId,
    fileInputRef,
    startEdit, saveEdit, cancelEdit, addItem, deleteItem,
    toggleAvailability, toggleRecommended, handleImageUpload, removeImage, saveSortOrder,
  };
}
