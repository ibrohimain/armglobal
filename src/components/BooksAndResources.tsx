/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BookOpen, FileText, FolderSync, Search, DownloadCloud, Eye, EyeOff, Plus, CheckCircle, Pencil, Trash2
} from "lucide-react";
import { LibraryResource } from "../types";

interface BooksAndResourcesProps {
  resources: LibraryResource[];
  onIncrementViews: (id: string) => Promise<void>;
  isAdmin: boolean;
  onAddNewResource?: (resource: Omit<LibraryResource, "id" | "viewsCount">) => Promise<void>;
  onDeleteResource?: (id: string) => Promise<void>;
  onEditResource?: (id: string, resource: Omit<LibraryResource, "id" | "viewsCount">) => Promise<void>;
}

export default function BooksAndResources({ 
  resources, 
  onIncrementViews, 
  isAdmin, 
  onAddNewResource,
  onDeleteResource,
  onEditResource
}: BooksAndResourcesProps) {
  const [activeTab, setActiveTab] = useState<"Kitob" | "Elektron resurs" | "Arxiv">("Kitob");
  const [searchQuery, setSearchQuery] = useState("");
  const [readingResource, setReadingResource] = useState<LibraryResource | null>(null);

  // Editing state
  const [editingRes, setEditingRes] = useState<LibraryResource | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLang, setEditLang] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editCategory, setEditCategory] = useState<"Kitob" | "Elektron resurs" | "Arxiv">("Kitob");
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  // New Resource Form (Admin Only inside this component or simple trigger)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLang, setNewLang] = useState("O'zbekcha");
  const [newYear, setNewYear] = useState("2026");
  const [newCategory, setNewCategory] = useState<"Kitob" | "Elektron resurs" | "Arxiv">("Kitob");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchCategory = res.category === activeTab;
      const lowerSearch = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        res.title.toLowerCase().includes(lowerSearch) ||
        res.author.toLowerCase().includes(lowerSearch) ||
        res.description.toLowerCase().includes(lowerSearch);
      
      return matchCategory && matchSearch;
    });
  }, [resources, activeTab, searchQuery]);

  const handleRead = async (res: LibraryResource) => {
    setReadingResource(res);
    try {
      await onIncrementViews(res.id);
    } catch (e) {
      console.error("Error incrementing views:", e);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor) {
      alert("Iltimos, sarlavha va muallifni kiriting!");
      return;
    }
    if (!onAddNewResource) return;

    setIsSubmitting(true);
    try {
      await onAddNewResource({
        title: newTitle,
        author: newAuthor,
        description: newDesc,
        category: newCategory,
        language: newLang,
        year: newYear
      });
      // reset
      setNewTitle("");
      setNewAuthor("");
      setNewDesc("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding resource:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (res: LibraryResource) => {
    setEditingRes(res);
    setEditTitle(res.title);
    setEditAuthor(res.author);
    setEditDesc(res.description || "");
    setEditLang(res.language || "O'zbekcha");
    setEditYear(res.year || "2026");
    setEditCategory(res.category);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;
    if (!editTitle.trim() || !editAuthor.trim()) {
      alert("Iltimos, sarlavha va muallifni to'ldiring!");
      return;
    }
    if (!onEditResource) return;

    setIsEditingSubmitting(true);
    try {
      await onEditResource(editingRes.id, {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        description: editDesc.trim(),
        language: editLang.trim(),
        year: editYear.trim(),
        category: editCategory
      });
      setEditingRes(null);
    } catch (err) {
      console.error("Error editing resource:", err);
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  return (
    <div id="books-resources-container" className="space-y-6">
      
      {/* Search and Tabs Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Kutubxona va Elektron Resurslar Fondi</h3>
            <p className="text-xs text-slate-400 mt-1">
              Axborot-resurs markazidagi adabiyotlar katalogi, elektron darsliklar va tarixiy arxiv materiallari.
            </p>
          </div>

          {/* Quick Stats overview */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase leading-none">Jami kitob fondi</span>
              <strong className="text-base text-slate-700 block mt-1 font-bold">{resources.length} <span className="text-xs font-normal">ta</span></strong>
            </div>
          </div>
        </div>

        {/* Tab selector and Search */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          
          {/* Custom Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("Kitob")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "Kitob" 
                  ? "bg-white text-sky-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Kitoblar fondi
            </button>
            <button
              onClick={() => setActiveTab("Elektron resurs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "Elektron resurs" 
                  ? "bg-white text-sky-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FolderSync className="w-4 h-4" />
              Elektron resurslar
            </button>
            <button
              onClick={() => setActiveTab("Arxiv")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "Arxiv" 
                  ? "bg-white text-sky-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              Arxiv materiallari
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Sarlavha, muallif, mavzu bo'yicha qidirish..."
              className="block w-full pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Admin upload trigger */}
          {isAdmin && onAddNewResource && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Yangi material qo'shish
            </button>
          )}

        </div>
      </div>

      {/* Admin Add resource inline form */}
      {isAdmin && showAddForm && onAddNewResource && (
        <form onSubmit={handleAdminSubmit} className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl space-y-4">
          <h4 className="font-bold text-indigo-900 text-sm">Yangi binoiy resurs yoki kitob qo'shish (Admin bo'limi)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Sarlavhasi / Nomi:</label>
              <input
                type="text"
                placeholder="Milliy moliya hisobi"
                className="mt-1 block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Muallif / Mas'ul:</label>
              <input
                type="text"
                placeholder="T. M. Marupov"
                className="mt-1 block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Tur / Toifa:</label>
                <select
                  className="mt-1 block w-full px-2 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                >
                  <option value="Kitob">Kitoblar fondi</option>
                  <option value="Elektron resurs">Elektron resurs</option>
                  <option value="Arxiv">Arxivlar</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Yili:</label>
                <input
                  type="text"
                  placeholder="2025"
                  className="mt-1 block w-full px-2 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none-2 focus:ring-sky-500"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Qisqa tavsifi / Mavzulari:</label>
              <input
                type="text"
                placeholder="Ushbu elektron qo'llanmada quyidagi fundamental boblar keltirilgan..."
                className="mt-1 block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Tili:</label>
              <input
                type="text"
                placeholder="O'zbekcha, Ruscha"
                className="mt-1 block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
          >
            {isSubmitting ? "Ma'lumotlar kiritilmoqda..." : "Tasdiqlab qo'shish"}
          </button>
        </form>
      )}

      {/* Grid List */}
      <div id="books-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 border border-slate-100 rounded-3xl text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <h5 className="font-semibold text-slate-600">Material topilmadi</h5>
            <p className="text-xs">Boshqa qidiruv so'zlarini sinab ko'ring.</p>
          </div>
        ) : (
          filteredResources.map(res => (
            <div 
              key={res.id} 
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-sky-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                    res.category === "Kitob" ? "bg-amber-100 text-amber-800" :
                    res.category === "Elektron resurs" ? "bg-cyan-100 text-cyan-800" :
                    "bg-indigo-100 text-indigo-800"
                  }`}>
                    {res.category}
                  </span>
                  
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <Eye className="w-3.5 h-3.5" />
                    {res.viewsCount || 0} marta ko'rildi
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1" title={res.title}>
                    {res.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{res.author}</p>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="border-t border-slate-50 mt-4 pt-3 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  <span className="font-medium mr-1">Yili:</span>
                  <strong className="text-slate-600 mr-3">{res.year || "Yo'q"}</strong>
                  <span className="font-medium mr-1">Tili:</span>
                  <strong className="text-slate-600 truncate max-w-[60px] inline-block align-bottom" title={res.language}>{res.language || "O'zbekcha"}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleStartEdit(res)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Ushbu materialni ("${res.title}") butunlay o'chirishni xohlaysizmi?`)) {
                            onDeleteResource?.(res.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-55 rounded-lg transition-all"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleRead(res)}
                    className="px-3 py-1.5 text-[10px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-all flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    foydalanish
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Read Resource modal */}
      {readingResource && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-100 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-extrabold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full uppercase">
                  Muhandislik Resursi
                </span>
                <h3 className="font-bold text-slate-800 text-lg md:text-xl mt-2 leading-snug">{readingResource.title}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Muallif: {readingResource.author}</p>
              </div>
              <button 
                onClick={() => setReadingResource(null)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <h5 className="font-bold text-slate-700">Material Haqida:</h5>
              <p>{readingResource.description}</p>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/50">
                <div>
                  <span className="text-slate-400 block font-medium">Nashr etilgan yili:</span>
                  <strong className="text-slate-700 font-semibold">{readingResource.year || "Noma'lum"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Til:</span>
                  <strong className="text-slate-700 font-semibold">{readingResource.language || "O'zbekcha / Inglizcha"}</strong>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sizning ushbu rersursga murojaatingiz qayd etildi va statistika yangilandi.</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReadingResource(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  alert("Siz tanlagan elektron resurs yoki darslik yuklab olish havolasiga muvaffaqiyatli yo'naltirilmoqda.");
                  setReadingResource(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <DownloadCloud className="w-4 h-4" />
                Darslikni yuklab olish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal (Admin Only) */}
      {editingRes && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-100 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-850 px-2.5 py-0.5 rounded-full uppercase">
                  Ma'muriy Tahrirlash
                </span>
                <h3 className="font-bold text-slate-800 text-base md:text-lg mt-2 leading-snug">
                  Material ma'lumotlarini tahrirlash
                </h3>
              </div>
              <button 
                onClick={() => setEditingRes(null)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Material Nomi / Sarlavha:</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Muallif / Mas'ul:</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-600">Toifa / Ustuvorligi:</label>
                  <select
                    className="block w-full px-2 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                  >
                    <option value="Kitob">Kitoblar fondi</option>
                    <option value="Elektron resurs">Elektron resurs</option>
                    <option value="Arxiv">Arxivlar</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Nashr Yili:</label>
                  <input
                    type="text"
                    className="block w-full px-2 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-slate-600">Tili:</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={editLang}
                    onChange={(e) => setEditLang(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Material Tavsifi:</label>
                <textarea
                  rows={3}
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRes(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  {isEditingSubmitting ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
