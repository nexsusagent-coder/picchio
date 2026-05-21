"use client";

import { useEffect, useState } from "react";
import { useAdminData } from "./hooks/useAdminData";
import { useProductActions } from "./hooks/useProductActions";
import { useCampaignActions } from "./hooks/useCampaignActions";
import { useCategoryActions } from "./hooks/useCategoryActions";
import { useAnnouncementActions } from "./hooks/useAnnouncementActions";
import { useSettingsActions } from "./hooks/useSettingsActions";
import { useToast } from "@/components/ui/Toast";
import {
  Package, Megaphone, Star, Settings, Tag, BarChart3, LayoutDashboard,
  Eye, ArrowUpDown, ScrollText
} from "lucide-react";
import * as api from "@/lib/api";
import { cn } from "@/lib/utils";

import DashboardTab from "./tabs/DashboardTab";
import ProductsTab from "./tabs/ProductsTab";
import AnnouncementsTab from "./tabs/AnnouncementsTab";
import CampaignsTab from "./tabs/CampaignsTab";
import CategoriesTab from "./tabs/CategoriesTab";
import ReportsTab from "./tabs/ReportsTab";
import FeaturedTab from "./tabs/FeaturedTab";
import SettingsTab from "./tabs/SettingsTab";
import PreviewTab from "./tabs/PreviewTab";
import ActivityLogTab from "./tabs/ActivityLogTab";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

type AdminTab = "dashboard" | "products" | "announcements" | "campaigns" | "categories" | "reports" | "featured" | "settings" | "preview" | "activity";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const { items, categories, announcements, campaigns, siteSettings, analyticsSummary, loading, refresh, setData } = useAdminData();
  const toast = useToast();

  const products = useProductActions(items, (newItems) => {
    if (typeof newItems === "function") {
      setData(prev => ({ ...prev, items: newItems(prev.items) }));
    } else {
      setData(prev => ({ ...prev, items: newItems }));
    }
  }, categories as Array<{ id: string; name: string }>, refresh, toast.success);

  const campActions = useCampaignActions(
    (newCamps) => {
      if (typeof newCamps === "function") {
        setData(prev => ({ ...prev, campaigns: newCamps(prev.campaigns) }));
      } else {
        setData(prev => ({ ...prev, campaigns: newCamps }));
      }
    },
    refresh, toast.success
  );

  const catActions = useCategoryActions(
    (newCats) => {
      if (typeof newCats === "function") {
        setData(prev => ({ ...prev, categories: newCats(prev.categories) }));
      } else {
        setData(prev => ({ ...prev, categories: newCats }));
      }
    },
    items, toast.success
  );

  const annActions = useAnnouncementActions(
    (newAnns) => {
      if (typeof newAnns === "function") {
        setData(prev => ({ ...prev, announcements: newAnns(prev.announcements) }));
      } else {
        setData(prev => ({ ...prev, announcements: newAnns }));
      }
    },
    toast.success
  );

  const settingsActions = useSettingsActions(
    siteSettings,
    (newSettings) => {
      if (typeof newSettings === "function") {
        setData(prev => ({ ...prev, siteSettings: newSettings(prev.siteSettings) }));
      } else {
        setData(prev => ({ ...prev, siteSettings: newSettings }));
      }
    },
    toast.success
  );

  useEffect(() => { refresh(); }, []);

  const tabOrder: AdminTab[] = ["dashboard", "products", "announcements", "campaigns", "categories", "reports", "featured", "settings", "preview", "activity"];

  useKeyboardShortcuts({
    "Ctrl+1": () => setActiveTab("dashboard"),
    "Ctrl+2": () => setActiveTab("products"),
    "Ctrl+3": () => setActiveTab("announcements"),
    "Ctrl+4": () => setActiveTab("campaigns"),
    "Ctrl+5": () => setActiveTab("categories"),
    "Ctrl+6": () => setActiveTab("reports"),
    "Ctrl+7": () => setActiveTab("featured"),
    "Ctrl+8": () => setActiveTab("settings"),
    "Ctrl+9": () => setActiveTab("preview"),
    "Ctrl+0": () => setActiveTab("activity"),
  });

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "products", label: "Urunler", icon: <Package size={16} /> },
    { id: "announcements", label: "Duyurular", icon: <Megaphone size={16} /> },
    { id: "campaigns", label: "Kampanyalar", icon: <Tag size={16} /> },
    { id: "categories", label: "Kategoriler", icon: <ArrowUpDown size={16} /> },
    { id: "reports", label: "Raporlar", icon: <BarChart3 size={16} /> },
    { id: "featured", label: "One Cikanlar", icon: <Star size={16} /> },
    { id: "settings", label: "Ayarlar", icon: <Settings size={16} /> },
    { id: "preview", label: "Onizleme", icon: <Eye size={16} /> },
    { id: "activity", label: "Gunluk", icon: <ScrollText size={16} /> },
  ];

  return (
    <div className="p-4 sm:p-6 w-full text-neutral-200">
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

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <DashboardTab
          items={items} categories={categories}
          analyticsSummary={analyticsSummary}
          activeCampaigns={campaigns.filter(c => c.isActive).length}
          loading={loading}
          onNavigate={(tab) => setActiveTab(tab as AdminTab)}
          onOpenAddProduct={() => {
            setActiveTab("products");
            setTimeout(() => {
              if (categories.length > 0) {
                products.setNewCategory(categories[0].id);
                products.setShowAddModal(true);
              }
            }, 100);
          }}
        />
      )}
      {activeTab === "products" && (
        <ProductsTab
          items={items}
          setItems={(newItems) => {
            if (typeof newItems === "function") setData(prev => ({ ...prev, items: newItems(prev.items) }));
            else setData(prev => ({ ...prev, items: newItems }));
          }}
          categories={categories}
          loading={loading}
          actions={products}
          onRefresh={refresh}
        />
      )}
      {activeTab === "announcements" && (
        <AnnouncementsTab
          announcements={announcements}
          newAnnText={annActions.newAnnText} setNewAnnText={annActions.setNewAnnText}
          newAnnType={annActions.newAnnType} setNewAnnType={annActions.setNewAnnType}
          onAdd={annActions.addAnnouncement}
          onToggle={annActions.toggleAnnouncement}
          onDelete={annActions.deleteAnnouncement}
        />
      )}
      {activeTab === "campaigns" && (
        <CampaignsTab
          campaigns={campaigns}
          newCampTitle={campActions.newCampTitle} setNewCampTitle={campActions.setNewCampTitle}
          newCampDesc={campActions.newCampDesc} setNewCampDesc={campActions.setNewCampDesc}
          newCampType={campActions.newCampType} setNewCampType={campActions.setNewCampType}
          newCampPrice={campActions.newCampPrice} setNewCampPrice={campActions.setNewCampPrice}
          newCampEndDate={campActions.newCampEndDate} setNewCampEndDate={campActions.setNewCampEndDate}
          newCampStartDate={campActions.newCampStartDate} setNewCampStartDate={campActions.setNewCampStartDate}
          newCampImageFiles={campActions.newCampImageFiles} newCampImagePreviews={campActions.newCampImagePreviews}
          editingCampaign={campActions.editingCampaign} savingCampaign={campActions.savingCampaign}
          onStartEdit={(camp) => { campActions.startEditCampaign(camp); setActiveTab("campaigns"); }}
          onReset={campActions.resetCampaignForm}
          onImageSelect={campActions.handleCampImageSelect} onClearImage={campActions.clearCampImage}
          onSave={campActions.saveCampaign}
          onToggle={campActions.toggleCampaign}
          onDelete={campActions.deleteCampaign}
        />
      )}
      {activeTab === "categories" && (
        <CategoriesTab
          categories={categories}
          editingCategoryId={catActions.editingCategoryId}
          editCategoryName={catActions.editCategoryName}
          setEditCategoryName={catActions.setEditCategoryName}
          setEditingCategoryId={catActions.setEditingCategoryId}
          showAddCategoryModal={catActions.showAddCategoryModal}
          setShowAddCategoryModal={catActions.setShowAddCategoryModal}
          newCatName={catActions.newCatName} setNewCatName={catActions.setNewCatName}
          newCatOrder={catActions.newCatOrder} setNewCatOrder={catActions.setNewCatOrder}
          onSaveEdit={catActions.saveCategoryEdit}
          onDelete={catActions.deleteCategory}
          onAdd={catActions.addCategory}
        />
      )}
      {activeTab === "reports" && (
        <ReportsTab
          analyticsSummary={analyticsSummary}
          items={items}
          categories={categories}
          loading={loading}
        />
      )}
      {activeTab === "featured" && (
        <FeaturedTab
          items={items}
          categories={categories}
          onToggleRecommended={products.toggleRecommended}
        />
      )}
      {activeTab === "settings" && (
        <SettingsTab
          siteSettings={siteSettings}
          setSiteSettings={(newSettings) => {
            if (typeof newSettings === "function") setData(prev => ({ ...prev, siteSettings: newSettings(prev.siteSettings) }));
            else setData(prev => ({ ...prev, siteSettings: newSettings }));
          }}
          savingSettings={settingsActions.savingSettings}
          onLogoUpload={settingsActions.handleLogoUpload}
          onSave={settingsActions.saveSettings}
        />
      )}
      {activeTab === "preview" && <PreviewTab />}
      {activeTab === "activity" && <ActivityLogTab />}
    </div>
  );
}
