/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Plus, Database, CheckCircle2, Bookmark, FileText, ArrowRight, ExternalLink, 
  HelpCircle, Trash2, Edit2, Share2, Globe, Users, Trophy, GraduationCap, Clock, Save, X, Eye, Check
} from "lucide-react";
import { UserProfile, DatabaseResource, UsageLog, FACULTIES } from "../types";
import { DEFAULT_DATABASES } from "../data/defaults";

interface ResearchFormProps {
  user: UserProfile;
  catalogDatabases: DatabaseResource[];
  logs: UsageLog[];
  onAddLog: (logData: Omit<UsageLog, "id" | "userId" | "userFullName" | "userEmail" | "userType" | "faculty" | "department" | "timestamp">) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  onUpdateLog: (id: string, updatedFields: Partial<UsageLog>) => Promise<void>;
}

export default function ResearchForm({ 
  user, 
  catalogDatabases, 
  logs, 
  onAddLog, 
  onDeleteLog,
  onUpdateLog 
}: ResearchFormProps) {
  
  // Tab within the Research logging panel
  const [subTab, setSubTab] = useState<"form" | "my-logs" | "public-logs" | "leaders">("form");

  // Log Form states
  const [selectedDb, setSelectedDb] = useState<string>("scopus");
  const [customDbName, setCustomDbName] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [purpose, setPurpose] = useState<UsageLog["purpose"]>("Scientific Research");
  const [customPurpose, setCustomPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showPublic, setShowPublic] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Editing Log states (inline editing of a specific log item)
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editDbName, setEditDbName] = useState<string>("");
  const [editPurpose, setEditPurpose] = useState<UsageLog["purpose"]>("Scientific Research");
  const [editCustomPurpose, setEditCustomPurpose] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [editShowPublic, setEditShowPublic] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Combine default databases and custom added databases from catalog
  const mergedDatabases = useMemo(() => {
    const list = [...DEFAULT_DATABASES];
    catalogDatabases.forEach(cdb => {
      if (!list.some(d => d.id === cdb.id)) {
        list.push({ ...cdb, isCustom: true });
      }
    });
    return list;
  }, [catalogDatabases]);

  const handleSelectDb = (id: string) => {
    setIsCustomMode(false);
    setSelectedDb(id);
  };

  const handleSelectCustomMode = () => {
    setIsCustomMode(true);
    setSelectedDb("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalDbId = selectedDb;
      let finalDbName = "";

      if (isCustomMode) {
        if (!customDbName.trim()) {
          alert("Iltimos, xorijiy yoki milliy baza nomini kiriting!");
          setIsSubmitting(false);
          return;
        }
        finalDbId = customDbName.toLowerCase().replace(/\s+/g, "-");
        finalDbName = customDbName.trim();
      } else {
        const found = mergedDatabases.find(d => d.id === selectedDb);
        finalDbName = found ? found.name : selectedDb;
      }

      await onAddLog({
        databaseId: finalDbId,
        databaseName: finalDbName,
        isCustomDatabase: isCustomMode,
        purpose,
        customPurposeDetail: purpose === "Other" ? customPurpose.trim() : "",
        notes: notes.trim(),
        showPublic: showPublic
      });

      // Clear form
      setCustomDbName("");
      setCustomPurpose("");
      setNotes("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      
      // automatically jump to user logs tab to see the post
      setSubTab("my-logs");
    } catch (err) {
      console.error("Error creating log:", err);
      alert("Xatolik yuz berdi: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger inline editing mode for a log item
  const startEditLog = (log: UsageLog) => {
    setEditingLogId(log.id);
    setEditDbName(log.databaseName);
    setEditPurpose(log.purpose as any);
    setEditCustomPurpose(log.customPurposeDetail || "");
    setEditNotes(log.notes || "");
    setEditShowPublic(log.showPublic !== false); // default to true if undefined
  };

  const handleUpdateSubmit = async (e: React.FormEvent, logId: string) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onUpdateLog(logId, {
        databaseName: editDbName.trim(),
        purpose: editPurpose,
        customPurposeDetail: editPurpose === "Other" ? editCustomPurpose.trim() : "",
        notes: editNotes.trim(),
        showPublic: editShowPublic
      });
      setEditingLogId(null);
      alert("Ma'lumotlar tahrirlandi va saqlandi!");
    } catch (err) {
      alert("Xatolik: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUpdating(false);
    }
  };

  // Derived user statistics for display
  const userLogs = useMemo(() => {
    return logs.filter(l => l.userEmail === user.email);
  }, [logs, user.email]);

  const publicLogs = useMemo(() => {
    return logs.filter(l => l.showPublic === true && l.userEmail !== user.email);
  }, [logs, user.email]);

  // Leaders calculations - overall top contributors
  const leaderBoardUsers = useMemo(() => {
    const userMap: Record<string, { email: string; fullName: string; type: string; faculty: string; count: number; foreignShare: number }> = {};
    
    logs.forEach(l => {
      if (!userMap[l.userEmail]) {
        userMap[l.userEmail] = {
          email: l.userEmail,
          fullName: l.userFullName,
          type: l.userType,
          faculty: l.faculty,
          count: 0,
          foreignShare: 0
        };
      }
      userMap[l.userEmail].count += 1;
      
      // Determine if they accessed a foreign database
      const isScopusOrScienceDirect = ["scopus", "sciencedirect", "springerlink", "webofscience"].includes(l.databaseId?.toLowerCase() || "");
      if (isScopusOrScienceDirect || !l.isCustomDatabase) {
        userMap[l.userEmail].foreignShare += 1;
      }
    });

    return Object.values(userMap).sort((a, b) => b.count - a.count);
  }, [logs]);

  // Leaderboard per Faculty
  const leaderBoardFaculty = useMemo(() => {
    const facMap: Record<string, number> = {};
    logs.forEach(l => {
      facMap[l.faculty] = (facMap[l.faculty] || 0) + 1;
    });
    return Object.entries(facMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count);
  }, [logs]);

  // Database type counts for context
  const hasNationalVSForeignCounts = useMemo(() => {
    let foreign = 0;
    let national = 0;
    logs.forEach(l => {
      const isForeign = !["ziyonet", "nat-lib", "e-kutubxona"].includes(l.databaseId?.toLowerCase() || "") && l.databaseName.toLowerCase() !== "milliy kutubxona";
      if (isForeign) foreign++;
      else national++;
    });
    return { foreign, national };
  }, [logs]);

  return (
    <div id="research-form-panel" className="space-y-6">
      
      {/* Sub Tabs controller */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex bg-slate-100 p-1 rounded-xl scrollbar-none overflow-x-auto max-w-full">
          <button
            onClick={() => setSubTab("form")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === "form" 
                ? "bg-white text-sky-650 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="w-4 h-4 text-sky-600" />
            Tashrifni Qayd etish
          </button>
          
          <button
            onClick={() => setSubTab("my-logs")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === "my-logs" 
                ? "bg-white text-sky-650 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-500" />
            Mening Qaydlarim ({userLogs.length} ta)
          </button>

          <button
            onClick={() => setSubTab("public-logs")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === "public-logs" 
                ? "bg-white text-sky-650 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            Ommaviy Izlanishlar ({logs.filter(l => l.showPublic === true).length} ta)
          </button>

          <button
            onClick={() => setSubTab("leaders")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === "leaders" 
                ? "bg-white text-sky-650 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            Liderlar & Faollar kesimi
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
            Xorijiy: <strong>{hasNationalVSForeignCounts.foreign}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
            Milliy: <strong>{hasNationalVSForeignCounts.national}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COMPONENT COLUMN: Info box or Leaderboard snippets depending on context */}
        <div className="space-y-6">
          
          {/* User Details Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-sky-600" />
              Sizning profilingiz
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-600">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[9px]">Foydalanuvchi ismi</p>
                <p className="font-black text-slate-800 mt-0.5 text-sm">{user.fullName}</p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase text-[9px]">Pochta manzili</p>
                <p className="font-mono text-slate-700 mt-0.5">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">Fakultet</p>
                  <p className="font-bold text-slate-850 mt-0.5 truncate" title={user.faculty}>{user.faculty}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">Kafedra/Ish xonasi</p>
                  <p className="font-bold text-slate-850 mt-0.5 truncate" title={user.department}>{user.department}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase text-[9px]">O'rni/Statusi</p>
                <span className="inline-block mt-1 px-2 py-0.5 font-bold bg-sky-50 text-sky-600 rounded-md border border-sky-100">
                  {user.userType === "Researcher" && "Ilmiy tadqiqotchi"}
                  {user.userType === "Teacher" && "O'qituvchi ustoz"}
                  {user.userType === "PhD" && "Tayanch doktorant (PhD)"}
                  {user.userType === "Master" && "Magistrant talaba"}
                  {user.userType === "Student" && "Iqtidorli talaba"}
                  {user.userType === "Guest" && "Mehmon / Tashrif buyuruvchi"}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-1">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-indigo-650" />
                Tajriba almashish tizimi (Public)
              </h4>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                Tizimda <strong>"Hammaga ulashish"</strong> tugmasi mavjud. Uni faollashtirsangiz, boshqa hamkasblaringiz siz qaysi mavzularda, qanday kalit so'zlarda qidiruv o'tkazayotganingizni ko'rib o'rganishlari va manfaat olishlari mumkin.
              </p>
            </div>
          </div>

          {/* Quick Leaders snippet */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Eng faol liderlar
              </h4>
              <span className="text-[9px] bg-sky-600 px-2 py-0.5 rounded-full font-bold">Top 3</span>
            </div>

            <div className="space-y-3">
              {leaderBoardUsers.slice(0, 3).map((item, idx) => (
                <div key={item.email} className="flex items-center justify-between gap-3 text-xs bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60 font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${
                      idx === 0 ? "bg-amber-400 text-slate-900" :
                      idx === 1 ? "bg-slate-300 text-slate-900" :
                      "bg-amber-600 text-white"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-extrabold text-slate-200 truncate">{item.fullName}</p>
                      <p className="text-[9px] text-slate-500 truncate">{item.faculty}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sky-400 shrink-0 text-[11px]">{item.count} marta</span>
                </div>
              ))}
              {leaderBoardUsers.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center py-2">Hozircha ma'lumotlar yo'q</p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RENDER SELECTED SUB-TAB CONTENT */}
        <div className="lg:col-span-2">
          
          {/* TAB 1: FORM TAB */}
          {subTab === "form" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Yangi Tashrif va Foydalanishni Ro'yxatga Olish</h3>
                <p className="text-xs text-slate-400 mt-1">Siz foydalanayotgan bazani katalogdan tanlang yoki yangisini qo'shing, so'ngra foydalanish maqsadi va ish natijangizni qayd eting.</p>
              </div>

              {showSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 flex items-start gap-3 transition-opacity">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">Muvaffaqiyatli qayd etildi!</p>
                    <p className="mt-1 text-emerald-600 leading-normal">
                      Sizning hisobotingiz tizimga qo'shildi hamda institut statistikasida real vaqtda aks ettirilmoqda. Rahmat!
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Databases Selection Catalog */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">1. Foydalanilgan elektron baza yoki kutubxona:</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {mergedDatabases.map(db => (
                      <button
                        key={db.id}
                        type="button"
                        onClick={() => handleSelectDb(db.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-20 ${
                          selectedDb === db.id && !isCustomMode
                            ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-xs"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 block truncate max-w-[110px]">{db.name}</span>
                            {db.url && (
                              <a 
                                href={db.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-sky-600 transition-colors"
                                title="Bazada tadqiqotni boshlash"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal" title={db.description}>
                            {db.description}
                          </p>
                        </div>
                        <span className={`absolute bottom-2 right-2 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          db.type === "foreign" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {db.type === "foreign" ? "Xorijiy" : "Milliy"}
                        </span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleSelectCustomMode}
                      className={`p-3 rounded-xl border text-left transition-all h-20 flex flex-col justify-center items-center gap-1 text-slate-500 ${
                        isCustomMode
                          ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <Plus className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-bold text-slate-700">Boshqa maxsus baza</span>
                    </button>
                  </div>
                </div>

                {/* Custom Database Name Input */}
                {isCustomMode && (
                  <div className="bg-sky-50/40 border border-sky-100 p-4 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Maxsus xorijiy yoki milliy baza sarlavhasini kiriting:</label>
                    <input
                      type="text"
                      placeholder="M-n: Emerald Publishing, Oxford Academic va hk."
                      className="block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                      value={customDbName}
                      onChange={(e) => setCustomDbName(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Eslatma: Ushbu baza tizimga simulyatsiya sifatida qo'shiladi va boshqa izlanuvchilarga ham namuna sifatida ko'rinadi.
                    </p>
                  </div>
                )}

                {/* Purpose of use */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">2. Foydalanish muqsadi:</label>
                    <select
                      className="block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value as any)}
                    >
                      <option value="Scientific Research">Ilmiy tadqiqot & Maqola yozish</option>
                      <option value="Dissertation">Dissertatsiya ishi (PhD, DSc, Magistr)</option>
                      <option value="Lesson Preparation">Ma'ruza va tajriba dars ssenariysi</option>
                      <option value="News Study">Jahon ilmiy yangiliklarini tahlil qilish</option>
                      <option value="Other">Boshqa maqsadlar uchun</option>
                    </select>
                  </div>

                  {purpose === "Other" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Maqsadingiz sarlavhasi:</label>
                      <input
                        type="text"
                        placeholder="Masalan: Grant loyihasi topshirig'i"
                        className="block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                        value={customPurpose}
                        onChange={(e) => setCustomPurpose(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Additional details notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">3. Amalga oshirilgan ish tahlili & izoh (Nima ish qildingiz):</label>
                  <textarea
                    rows={3}
                    placeholder="Masalan: 'Suyuqliklar gidrodinamikasi' mavzusidagi oxirgi 3 yillik xorijiy maqolalarni yuklab oldim va adabiyotlar tahlilini tahrirladim."
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 leading-normal"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Hammaga Ko'rsatish toggle checkbox */}
                <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="showPublicCheckbox"
                    className="w-4 h-4 text-sky-600 mt-1 rounded border-slate-350 focus:ring-sky-500"
                    checked={showPublic}
                    onChange={(e) => setShowPublic(e.target.checked)}
                  />
                  <div className="text-xs">
                    <label htmlFor="showPublicCheckbox" className="font-bold text-slate-800 cursor-pointer block">
                      Hammaga ko'rsatish (Ommaviy tajriba ulashish)
                    </label>
                    <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                      Belgilansa, nima ish qilgandigingiz va foydalangan bazangiz nomi ommaviy reyting sahifasida boshqalarga manfaat ko'rsatish uchun e'lon qilinadi. Shaxsiy pochtangiz faqat qisman yashirin holatda ko'rinadi.
                    </p>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-xs font-black text-white bg-sky-650 hover:bg-sky-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-55"
                  >
                    {isSubmitting ? "Ma'lumot yuborilmoqda..." : "Yangi tashrif hisoboti yozish va qayd etish"}
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 2: MY LOGS TAB WITH EDITING & DELETING */}
          {subTab === "my-logs" && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Mening tashrif va faoliyat qaydlarim tarixi</h3>
                <p className="text-xs text-slate-400 mt-0.5">O'zingiz kiritgan barcha log qaydlari ro'yxati. Ularni tahrirlashingiz yoki o'chirishingiz mumkin.</p>
              </div>

              <div className="space-y-4">
                {userLogs.length === 0 ? (
                  <div className="text-center p-12 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-400 text-xs">
                    <FileText className="w-10 h-10 mx-auto text-slate-350 mb-2" />
                    Hozircha siz hech qanday tashrif hisoboti kiritmadingiz. Yuqoridagi "Tashrifni Qayd etish" bo'limida birinchi logingizni qo'shing.
                  </div>
                ) : (
                  userLogs.map(log => {
                    const localTime = new Date(log.timestamp).toLocaleString("uz-UZ", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                    });
                    
                    const isEditingThis = editingLogId === log.id;

                    return (
                      <div key={log.id} className="border border-slate-150 rounded-2xl p-4 hover:bg-slate-50/40 transition-colors relative">
                        
                        {isEditingThis ? (
                          // Inline Editing Form
                          <form onSubmit={(e) => handleUpdateSubmit(e, log.id)} className="space-y-4 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="font-bold text-sky-600 flex items-center gap-1">
                                <Edit2 className="w-4.5 h-4.5" />
                                Qaydni tahrirlash
                              </span>
                              <button 
                                type="button" 
                                onClick={() => setEditingLogId(null)}
                                className="text-slate-400 hover:text-slate-600 font-bold"
                              >
                                Bekor qilish
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-slate-600">Baza Nomi:</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 font-bold text-slate-750"
                                  value={editDbName}
                                  onChange={(e) => setEditDbName(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-slate-600">Foydalanish maqsadi:</label>
                                <select
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 font-semibold"
                                  value={editPurpose}
                                  onChange={(e) => setEditPurpose(e.target.value as any)}
                                >
                                  <option value="Scientific Research">Ilmiy tadqiqot & Maqola yozish</option>
                                  <option value="Dissertation">Dissertatsiya ishi (PhD, DSc)</option>
                                  <option value="Lesson Preparation">Ma'ruza va dars tayyorgarligi</option>
                                  <option value="News Study">Ilmiy yangiliklarni o'rganish</option>
                                  <option value="Other">Boshqa maqsadlar</option>
                                </select>
                              </div>
                            </div>

                            {editPurpose === "Other" && (
                              <div className="space-y-1">
                                <label className="font-bold text-slate-600">Maxsus maqsad tavsifi:</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                                  value={editCustomPurpose}
                                  onChange={(e) => setEditCustomPurpose(e.target.value)}
                                />
                              </div>
                            )}

                            <div className="space-y-1">
                              <label className="font-bold text-slate-600">Nima ish qildingiz (Izoh/Tahlil):</label>
                              <textarea
                                rows={2}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`editPub-${log.id}`}
                                checked={editShowPublic}
                                onChange={(e) => setEditShowPublic(e.target.checked)}
                              />
                              <label htmlFor={`editPub-${log.id}`} className="font-bold text-slate-700 cursor-pointer">
                                Hammaga ko'rsatish (Ommaviy ulashish)
                              </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingLogId(null)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
                              >
                                Yopish
                              </button>
                              <button
                                type="submit"
                                disabled={isUpdating}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center gap-1"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {isUpdating ? "Saqlanmoqda..." : "Saqlash"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          // Normal Display Mode
                          <div className="space-y-3.5 text-xs">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-slate-800 text-sm">{log.databaseName}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    log.isCustomDatabase ? "bg-purple-100 text-purple-800" : "bg-sky-100 text-sky-850"
                                  }`}>
                                    {log.isCustomDatabase ? "Custom" : "Katalog"}
                                  </span>
                                  {log.showPublic ? (
                                    <span className="bg-emerald-150 text-emerald-800 border border-emerald-250 text-[8px] px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                                      <Globe className="w-2.5 h-2.5" />
                                      Ommaviy ulashilgan
                                    </span>
                                  ) : (
                                    <span className="bg-slate-100 text-slate-500 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                      Shaxsiy qayd
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium select-none">
                                  <Clock className="w-3 h-3 text-slate-350" />
                                  Kiritilgan sana: {localTime}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => startEditLog(log)}
                                  className="p-1.5 border border-slate-100 rounded-lg hover:border-sky-300 text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                                  title="O'zgartirish/Tahrirlash"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm("Rostdan ham ushbu hisobotingizni o'chirib tashlamoqchimisiz?")) {
                                      await onDeleteLog(log.id);
                                    }
                                  }}
                                  className="p-1.5 border border-slate-100 rounded-lg hover:border-red-300 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                  title="Butunlay o'chirish"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-2">
                              <div>
                                <span className="font-semibold text-slate-450 block text-[9px] uppercase">Maqsad:</span>
                                <strong className="text-slate-800 font-bold">
                                  {log.purpose === "Scientific Research" && "Ilmiy izlanish & Maqola tayyorlash"}
                                  {log.purpose === "Dissertation" && "Dissertatsiya ustida ishlash"}
                                  {log.purpose === "Lesson Preparation" && "O'quv dars amaliyotiga tayyorgarlik"}
                                  {log.purpose === "News Study" && "Jahon ilmiy yangiliklar tahlili"}
                                  {log.purpose === "Other" && (log.customPurposeDetail || "Boshqa maqsadlar")}
                                </strong>
                              </div>
                              {log.notes && (
                                <div className="border-t border-slate-200/50 pt-2 text-[11px] leading-relaxed text-slate-650">
                                  <span className="font-bold text-slate-500 block text-[9px] uppercase mb-0.5">Amalga oshirilgan ish kodi / hisoboti:</span>
                                  "{log.notes}"
                                </div>
                              )}
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PUBLIC RESEARCHES */}
          {subTab === "public-logs" && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  Ommaviy tajriba ulashish va tadqiqotlar maydoni
                </h3>
                <p className="text-xs text-slate-405">Hamkasblarimiz qaysi bazalardan qanday ilmiy maqsadlarda foydalanayotganini real vaqtda kuzatib, o'zlashtiring!</p>
              </div>

              <div className="space-y-4">
                {logs.filter(l => l.showPublic === true).length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-xs font-semibold">Tizimda ommaviy ulashilgan qaydlar hozircha mavjud emas.</p>
                ) : (
                  logs.filter(l => l.showPublic === true).map(log => {
                    const localTime = new Date(log.timestamp).toLocaleString("uz-UZ", {
                      year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
                    });
                    
                    // anonymize email a bit: jasur@gmail.com -> j***r@gmail.com
                    const anonymizeEmail = (email: string) => {
                      const split = email.split("@");
                      if (split[0].length <= 2) return `***@${split[1]}`;
                      return `${split[0][0]}***${split[0][split[0].length - 1]}@${split[1]}`;
                    };

                    return (
                      <div key={log.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 hover:border-sky-100 hover:shadow-xs transition-all space-y-3">
                        <div className="flex items-start justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-800">{log.userFullName}</span>
                              <span className="text-[10px] text-slate-400">({anonymizeEmail(log.userEmail)})</span>
                              
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[8px] font-bold px-1.5 rounded">
                                {log.userType === "Researcher" ? "Tadqiqotchi" : 
                                 log.userType === "PhD" ? "PhD" : 
                                 log.userType === "Teacher" ? "O'qituvchi" : "Xodim"}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase">{log.faculty} • {log.department}</p>
                          </div>
                          
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{localTime}</span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-100/50 text-xs space-y-1.5">
                          <p className="flex items-center gap-1">
                            <span className="text-slate-400 font-medium">Baza:</span>
                            <span className="font-extrabold text-sky-650 inline-flex items-center gap-0.5">
                              {log.databaseName}
                            </span>
                          </p>
                          <p className="leading-relaxed">
                            <span className="text-slate-400 font-medium block text-[10px]">Maqsad:</span>
                            <strong className="text-slate-700 font-semibold">
                              {log.purpose === "Scientific Research" && "Ilmiy tadqiqot & Maqola ustida izlanish"}
                              {log.purpose === "Dissertation" && "Dissertatsiya (PhD, DSc) ishlari"}
                              {log.purpose === "Lesson Preparation" && "O'qituvchi ustoz dars tayyorligi"}
                              {log.purpose === "News Study" && "Chet el ilmiy yangiliklar o'rganishi"}
                              {log.purpose === "Other" && (log.customPurposeDetail || "Boshqa maqsad")}
                            </strong>
                          </p>
                          {log.notes && (
                            <div className="border-t border-slate-100 pt-1.5 text-[11px] text-slate-500 italic leading-relaxed">
                              "{log.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LEADERS & STATISTICS RATINGS */}
          {subTab === "leaders" && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-6">
              
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Kutubxona faollari va Liderlar Reytingi (Doimiy)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Ushbu sahifada xalqaro va milliy bazalarni faol o'rganayotgan mard va zahmatkash xodimlar hamda fakultetlar top 10 ro'yxati keltirilgan.</p>
              </div>

              {/* Main Leaders Grid */}
              <div className="space-y-4">
                <h4 className="font-black text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-sky-600" />
                  Eng faol foydalanuvchilar (Xodim, Ustoz, Tadqiqotchilar)
                </h4>

                <div className="space-y-2 w-full">
                  {leaderBoardUsers.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Kiritilgan foydalanish qaydlari hozircha yo'q.</p>
                  ) : (
                    leaderBoardUsers.map((item, idx) => (
                      <div key={item.email} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-xs font-black shadow-xs ${
                            idx === 0 ? "bg-amber-400 text-slate-900" :
                            idx === 1 ? "bg-slate-200 text-slate-900" :
                            idx === 2 ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            #{idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-extrabold text-slate-800 truncate">{item.fullName}</p>
                            <span className="text-[10px] text-slate-400 truncate block mt-0.5">{item.faculty} • {item.type}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <strong className="text-sm font-black text-sky-700 block">{item.count} marta</strong>
                          <span className="text-[9px] text-slate-400 block font-semibold">Tashrif qaydlari</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Faculty Breakdown */}
              <div className="space-y-4 pt-2">
                <h4 className="font-black text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-500" />
                  Fakultetlar bo'yicha faollik ko'rsatkichi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FACULTIES.map(fac => {
                    const score = leaderBoardFaculty.find(f => f.name === fac.name)?.count || 0;
                    return (
                      <div key={fac.name} className="p-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between text-xs hover:border-slate-350 transition-colors">
                        <span className="font-bold text-slate-700 truncate max-w-[170px]" title={fac.name}>{fac.name}</span>
                        <span className="bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-lg">
                          {score} marta
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
