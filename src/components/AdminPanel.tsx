/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Database, Trash2, Plus, Download, Mail, Users, Building2, Bell, AlertTriangle, ArrowRight, ShieldCheck, Link, Calendar, Pencil
} from "lucide-react";
import { UsageLog, DatabaseResource, Announcement, FACULTIES } from "../types";

interface AdminPanelProps {
  logs: UsageLog[];
  databases: DatabaseResource[];
  onAddDatabase: (db: Omit<DatabaseResource, "id">) => Promise<void>;
  onDeleteDatabase: (id: string) => Promise<void>;
  onAddAnnouncement: (ann: Omit<Announcement, "id" | "date">) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onUpdateAnnouncement?: (id: string, ann: Partial<Announcement>) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  announcements: Announcement[];
}

export default function AdminPanel({ 
  logs, 
  databases, 
  onAddDatabase, 
  onDeleteDatabase, 
  onAddAnnouncement, 
  onDeleteAnnouncement,
  onUpdateAnnouncement,
  onDeleteLog,
  announcements 
}: AdminPanelProps) {
  
  // Tab states for inside admin panel
  const [adminTab, setAdminTab] = useState<"logs" | "databases" | "announcements">("logs");

  // Editing Announcement states
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editAnnTitle, setEditAnnTitle] = useState("");
  const [editAnnContent, setEditAnnContent] = useState("");
  const [editAnnAuthor, setEditAnnAuthor] = useState("");
  const [isAnnEditingSubmitting, setIsAnnEditingSubmitting] = useState(false);

  // Add Database states
  const [dbName, setDbName] = useState("");
  const [dbType, setDbType] = useState<"foreign" | "national">("foreign");
  const [dbUrl, setDbUrl] = useState("");
  const [dbDesc, setDbDesc] = useState("");
  const [isDbSubmitting, setIsDbSubmitting] = useState(false);

  // Add Announcement states
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annAuthor, setAnnAuthor] = useState("ARM Ma'muriyati");
  const [isAnnSubmitting, setIsAnnSubmitting] = useState(false);

  // Log filter states
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchFaculty = !selectedFaculty || l.faculty === selectedFaculty;
      const matchEmail = !searchEmail || l.userEmail.toLowerCase().includes(searchEmail.toLowerCase()) || l.userFullName.toLowerCase().includes(searchEmail.toLowerCase());
      return matchFaculty && matchEmail;
    });
  }, [logs, selectedFaculty, searchEmail]);

  const handleAddDbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbName.trim()) {
      alert("Iltimos, baza nomini kiriting!");
      return;
    }
    setIsDbSubmitting(true);
    try {
      await onAddDatabase({
        name: dbName.trim(),
        type: dbType,
        url: dbUrl.trim(),
        description: dbDesc.trim()
      });
      // reset
      setDbName("");
      setDbUrl("");
      setDbDesc("");
      alert("Yangi baza mivaffaqiyatli kiritildi!");
    } catch (err) {
      console.error(err);
      alert("Xatolik: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDbSubmitting(false);
    }
  };

  const handleAddAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert("Iltimos, yangilik sarlavhasi va kontentini to'ldiring!");
      return;
    }
    setIsAnnSubmitting(true);
    try {
      await onAddAnnouncement({
        title: annTitle.trim(),
        content: annContent.trim(),
        author: annAuthor.trim()
      });
      // reset
      setAnnTitle("");
      setAnnContent("");
      alert("Institut yangiliklar e'loni muvaffaqiyatli chop etildi!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnnSubmitting(false);
    }
  };

  const handleStartEditAnn = (ann: Announcement) => {
    setEditingAnn(ann);
    setEditAnnTitle(ann.title);
    setEditAnnContent(ann.content);
    setEditAnnAuthor(ann.author || "ARM Ma'muriyati");
  };

  const handleEditAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;
    if (!editAnnTitle.trim() || !editAnnContent.trim()) {
      alert("Sarlavha va kontentni to'ldiring!");
      return;
    }
    if (!onUpdateAnnouncement) return;

    setIsAnnEditingSubmitting(true);
    try {
      await onUpdateAnnouncement(editingAnn.id, {
        title: editAnnTitle.trim(),
        content: editAnnContent.trim(),
        author: editAnnAuthor.trim()
      });
      setEditingAnn(null);
      alert("Yangilik muvaffaqiyatli tahrirlandi!");
    } catch (err) {
      console.error("Error updating announcement:", err);
    } finally {
      setIsAnnEditingSubmitting(false);
    }
  };

  // Mock Export to CSV function
  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      alert("Eksport qilish uchun ma'lumotlar mavjud emas!");
      return;
    }
    
    const headers = ["ID", "Tadqiqotchi", "Pochta", "Toifa", "Fakultet", "Kafedra", "Kutubxona/Baza", "Foydalanish Maqsadi", "Sana/Vaqt", "Izoh"];
    const rows = filteredLogs.map(l => [
      l.id,
      l.userFullName,
      l.userEmail,
      l.userType,
      l.faculty,
      l.department,
      l.databaseName,
      l.purpose,
      l.timestamp,
      l.notes || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JizPI_ARM_Statistika_Eksport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-panel-container" className="space-y-6">
      
      {/* Admin Panel Header / Info Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">ARM Ma'muri Boshqaruv Ofisi (Admin Panel)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Tizim boshqaruvchisi Umar Abdullayev sifatida tizimga kirdingiz. Har qanday ma'lumotni monitoring qiling va unga ta'sir o'tkaza olasiz.
          </p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl w-fit shrink-0 border border-slate-700">
          <button
            onClick={() => setAdminTab("logs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === "logs" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Tashriflar & Logs
          </button>
          <button
            onClick={() => setAdminTab("databases")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === "databases" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Katalog Bazalari
          </button>
          <button
            onClick={() => setAdminTab("announcements")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === "announcements" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Kutubxona e'lonlari
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: RAW LOGS */}
      {adminTab === "logs" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-850 text-base">Haqiqiy Vaqtdagi Hisobotlar logi</h3>
              <p className="text-[11px] text-slate-400">Tashrif buyurgan xorijiy va milliy bazalar qaydlari jadvali</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold flex items-center gap-1.5"
                title="CSV shaklida yuklab olish"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Eksport (CSV)
              </button>
            </div>
          </div>

          {/* Table Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fakultet bo'yicha filter:</label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              >
                <option value="">Barchasi</option>
                {FACULTIES.map(fac => (
                  <option key={fac.name} value={fac.name}>{fac.name}</option>
                ))}
                <option value="Mehmon">Mehmonlar (Institutdan tashqari)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Pochta yoki Ism bo'yicha qidirish:</label>
              <input
                type="text"
                placeholder="Masalan: Abdullayev..."
                className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 w-full text-center">
                <span className="text-[10px] text-slate-400 font-medium block">Saralangan natijalar soni</span>
                <strong className="text-sm font-bold text-slate-700 block mt-0.5">{filteredLogs.length} ta qayd</strong>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <th className="p-3 font-semibold text-[10px] uppercase">Ism-Familiya / Pochta</th>
                  <th className="p-3 font-semibold text-[10px] uppercase">Fakultet & Kafedra</th>
                  <th className="p-3 font-semibold text-[10px] uppercase">Foydalangan Bazasi</th>
                  <th className="p-3 font-semibold text-[10px] uppercase">Maqsadi / Izoh</th>
                  <th className="p-3 font-semibold text-[10px] uppercase">Sana</th>
                  <th className="p-3 font-semibold text-[10px] uppercase text-center">O'chirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400">
                      Hech qanday log qaydlari topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => {
                    const localTime = new Date(log.timestamp).toLocaleString("uz-UZ", {
                      year: "numeric", month: "numeric", day: "numeric",
                      hour: "numeric", minute: "numeric"
                    });
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{log.userFullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.userType} • {log.userEmail}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-700 font-medium">{log.faculty}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.department}</p>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 font-bold rounded text-[10px] uppercase ${
                            log.isCustomDatabase ? "bg-purple-100 text-purple-800" : "bg-sky-100 text-sky-800"
                          }`}>
                            {log.databaseName}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-700">
                            {log.purpose === "Scientific Research" && "Ilmiy izlanish"}
                            {log.purpose === "Dissertation" && "Dissertatsiya"}
                            {log.purpose === "Lesson Preparation" && "Darsga tayyorgarlik"}
                            {log.purpose === "News Study" && "Yangiliklar tahlili"}
                            {log.purpose === "Other" && (log.customPurposeDetail || "Boshqa")}
                          </p>
                          {log.notes && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic" title={log.notes}>
                              "{log.notes}"
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 font-medium whitespace-nowrap">
                          {localTime}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm("Ushbu yozuvni va unga tegishli barcha statistikani ro'yxatdan butunlay o'chirasizmi?")) {
                                onDeleteLog(log.id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Yozuvni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW 2: DATABASE COPIES */}
      {adminTab === "databases" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form: Add database */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Yozma xorijiy/milliy kutubxona qo'shish</h3>
              <p className="text-[11px] text-slate-400">Tadqiqotchilar ro'yxatidan oson tanlashlari uchun qo'shimcha baza qo'shing.</p>
            </div>

            <form onSubmit={handleAddDbSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Baza Nomi (Sarlavhasi):</label>
                <input
                  type="text"
                  placeholder="Masalan: SpringerLink, Scopus va hk."
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Tur / Kelib chiqishi:</label>
                  <select
                    className="block w-full px-2 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value as any)}
                  >
                    <option value="foreign">Xorijiy baza</option>
                    <option value="national">Milliy baza</option>
                  </select>
                </div>

                <div className="space-y-1 font-semibold">
                  <label className="font-bold text-slate-600">Baza URL havolasi:</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={dbUrl}
                    onChange={(e) => setDbUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Baza haqida qisqacha tavsif:</label>
                <textarea
                  rows={3}
                  placeholder="Elsevier kompaniyasi bazasining tabiiy fanlari..."
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={dbDesc}
                  onChange={(e) => setDbDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isDbSubmitting}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Bazani ro'yxatga kiritish
              </button>
            </form>
          </div>

          {/* List Database catalog */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Siz boshqarayotgan va qo'shilgan elektron bazalar ro'yxati</h3>
              <p className="text-[11px] text-slate-400">Ushbu bazalar tadqiqot shakli catalog cardlarida foydalanuvchilarga ko'rinadi</p>
            </div>

            <div className="space-y-2.5">
              {databases.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Hozircha tizimga qo'shimcha maxsus bazalar qo'shilmagan.
                </div>
              ) : (
                databases.map(db => (
                  <div key={db.id} className="p-3.5 rounded-xl border border-slate-100 flex items-start justify-between hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-sm">{db.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          db.type === "foreign" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {db.type === "foreign" ? "Xorijiy" : "Milliy"}
                        </span>
                        {db.url && (
                          <a href={db.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-600 text-[10px] inline-flex items-center gap-0.5">
                            <Link className="w-3 h-3" />
                            {db.url}
                          </a>
                        )}
                      </div>
                      <p className="text-slate-400 leading-normal">{db.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm("Ushbu bazani tizim ro'yxatidan mutloqo o'chirasizmi?")) {
                          onDeleteDatabase(db.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW 3: INSTITUT ANNOUNCEMENTS */}
      {adminTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Announcement */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Yangi ilmiy yangilik va e'lon chop etish</h3>
              <p className="text-[11px] text-slate-400">Yangiliklar foydalanuvchilar kirishi bilan ularning darchasida paydo bo'ladi.</p>
            </div>

            <form onSubmit={handleAddAnnSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Sarlavha:</label>
                <input
                  type="text"
                  placeholder="Yangi SpringerLink grant rersursidan foydalanish boshlandi!"
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Yozuvchi / Mas'ul:</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={annAuthor}
                  onChange={(e) => setAnnAuthor(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Tavsiloti va matni:</label>
                <textarea
                  rows={5}
                  placeholder="Hurmatli ilmiy izlanuvchilar va muhandislar, kutubxonamizda..."
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isAnnSubmitting}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                E'lonni chop etish
              </button>
            </form>
          </div>

          {/* List announcements */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hozirgi e'lonlar va yangiliklar</h3>
              <p className="text-[11px] text-slate-400">Bizning barcha foydalanuvchilarimizga ko'rinadigan e'lonlar arxivi</p>
            </div>

            <div className="space-y-3.5">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Hozircha tizimda e'lonlar mavjud emas.
                </div>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl border border-slate-100 shadow-xs flex items-start justify-between hover:bg-slate-50 transition-colors">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-500 shrink-0" />
                        <h4 className="font-bold text-slate-800 text-sm">{ann.title}</h4>
                      </div>
                      <p className="text-slate-500 leading-normal">{ann.content}</p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ann.date}
                        </span>
                        <span>Mualiff: {ann.author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEditAnn(ann)}
                        className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors"
                        title="E'lonni tahrirlash"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Ushbu e'lonni o'chirib yuborsangiz, foydalanuvchilar darchasidan ham o'chib ketadi. Rozimisiz?")) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Yangilikni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Edit Announcement Modal */}
      {editingAnn && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-850 px-2.5 py-0.5 rounded-full uppercase">
                  Ma'muriyat
                </span>
                <h3 className="font-bold text-slate-800 text-base md:text-lg mt-2 leading-snug">
                  E'lonni tahrirlash
                </h3>
              </div>
              <button 
                onClick={() => setEditingAnn(null)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditAnnSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Sarlavha (Mavzu):</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editAnnTitle}
                  onChange={(e) => setEditAnnTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">E'lon mazmuni / Kontenti:</label>
                <textarea
                  rows={4}
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editAnnContent}
                  onChange={(e) => setEditAnnContent(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Muallif nomi:</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={editAnnAuthor}
                  onChange={(e) => setEditAnnAuthor(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isAnnEditingSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  {isAnnEditingSubmitting ? "Saqlanmoqda..." : "E'lonni yangilash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
