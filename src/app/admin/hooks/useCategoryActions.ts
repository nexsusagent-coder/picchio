"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { Category } from "@/lib/types";
import { publishChanges } from "@/app/actions";

export function useCategoryActions(
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  items: { categoryId: string }[],
  showNotification: (message: string, type?: "success" | "error") => void,
) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatOrder, setNewCatOrder] = useState("");

  const saveCategoryEdit = async (catId: string) => {
    if (!editCategoryName.trim()) return;
    try {
      await api.updateCategory(catId, { name: editCategoryName.trim() });
      await publishChanges();
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, name: editCategoryName.trim() } : c))
      );
      setEditingCategoryId(null);
      showNotification("Kategori adi guncellendi.");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (catId: string) => {
    const productsInCat = items.filter((i) => i.categoryId === catId);
    if (productsInCat.length > 0) {
      showNotification(
        `Bu kategoride ${productsInCat.length} adet urun bulunmaktadir. Once bu urunleri baska bir kategoriye tasimali veya silmelisiniz.`,
        "error"
      );
      return;
    }
    try {
      await api.deleteCategory(catId);
      await publishChanges();
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showNotification("Kategori silindi.");
    } catch (err) {
      console.error(err);
    }
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const id = `c-${Date.now()}`;
      const newCat: Category = {
        id,
        name: newCatName.trim(),
        order: newCatOrder ? parseInt(newCatOrder) : 0,
        isActive: true,
      };
      await api.insertCategory(newCat);
      await publishChanges();
      setCategories((prev) =>
        [...prev, newCat].sort((a, b) => a.order - b.order)
      );
      setNewCatName("");
      setNewCatOrder("");
      setShowAddCategoryModal(false);
      showNotification("Yeni kategori olusturuldu.");
    } catch (err) {
      console.error(err);
    }
  };

  return {
    editingCategoryId, setEditingCategoryId,
    editCategoryName, setEditCategoryName,
    showAddCategoryModal, setShowAddCategoryModal,
    newCatName, setNewCatName,
    newCatOrder, setNewCatOrder,
    saveCategoryEdit, deleteCategory, addCategory,
  };
}
