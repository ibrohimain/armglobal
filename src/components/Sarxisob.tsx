import React, { useState, useMemo } from "react";
import { 
  Users, Award, BookOpen, Plus, Search, Building2, ChevronRight, Filter, 
  Calendar, TrendingUp, CheckCircle, Pencil, Trash2, Library, Star, PlusCircle, ArrowUpRight
} from "lucide-react";
import { SarxisobRecord, FACULTIES } from "../types";

interface SarxisobProps {
  records: SarxisobRecord[];
  isAdmin: boolean;
  onAddRecord: (record: Omit<SarxisobRecord, "id" | "createdAt">) => Promise<void>;
  onUpdateRecord: (id: string, record: Partial<SarxisobRecord>) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  currentUserEmail?: string;
}

export default function Sarxisob({
  records,
  isAdmin,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  currentUserEmail
}: SarxisobProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"teachers" | "faculties" | "departments">("teachers");

  // Record Form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SarxisobRecord | null>(null);

  // Form inputs
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [faculty, setFaculty] = useState(FACULTIES[0]?.name || "Energetika");
  const [department, setDepartment] = useState("");
  const [bosmaKitob, setBosmaKitob] = useState(0);
  const [mualliflikPdf, setMualliflikPdf] = useState(0);
  const [ruxsatliElKitob, setRuxsatliElKitob] = useState(0);
  const [darslikVideo, setDarslikVideo] = useState(0);
  const [armTashrif, setArmTashrif] = useState(0);
  const [armHamkorlik, setArmHamkorlik] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper calculation formulas according to the specified weights
  const calculatePoints = (rec: Omit<SarxisobRecord, "id" | "createdAt" | "teacherName" | "faculty" | "department">) => {
    const points = {
      bosma: rec.bosmaKitob * 5.5,
      mualliflik: rec.mualliflikPdf * 2.4,
      ruxsatli: rec.ruxsatliElKitob * 0.3,
      darslik: rec.darslikVideo * 0.3,
      visits: rec.armTashrif * 0.5,
      coop: rec.armHamkorlik * 0.2
    };
    const totalPoints = points.bosma + points.mualliflik + points.ruxsatli + points.darslik + points.visits + points.coop;
    
    // KPI maximum 3 points component splits:
    // 1. Electronic book submission: mualliflikPdf, ruxsatliElKitob, darslikVideo (Max 1.0 point)
    const electronicKpi = Math.min(1.0, points.mualliflik + points.ruxsatli + points.darslik);
    // 2. Printed book submission (Max 1.0 point)
    const printedKpi = Math.min(1.0, points.bosma);
    // 3. ARM activities/collaboration (Max 1.0 point)
    const coopKpi = Math.min(1.0, points.visits + points.coop);
    
    const kpiScore = Number((electronicKpi + printedKpi + coopKpi).toFixed(2));
    
    return {
      points,
      totalPoints: Number(totalPoints.toFixed(2)),
      components: {
        electronic: Number(electronicKpi.toFixed(2)),
        printed: Number(printedKpi.toFixed(2)),
        cooperation: Number(coopKpi.toFixed(2))
      },
      kpiScore
    };
  };

  // Open modal for Adding new record
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setTeacherName("");
    setTeacherEmail("");
    setFaculty(FACULTIES[0]?.name || "Energetika");
    setDepartment("");
    setBosmaKitob(0);
    setMualliflikPdf(0);
    setRuxsatliElKitob(0);
    setDarslikVideo(0);
    setArmTashrif(0);
    setArmHamkorlik(0);
    setShowFormModal(true);
  };

  // Open modal for Editing existing record
  const handleOpenEdit = (rec: SarxisobRecord) => {
    setEditingRecord(rec);
    setTeacherName(rec.teacherName);
    setTeacherEmail(rec.email || "");
    setFaculty(rec.faculty);
    setDepartment(rec.department);
    setBosmaKitob(rec.bosmaKitob);
    setMualliflikPdf(rec.mualliflikPdf);
    setRuxsatliElKitob(rec.ruxsatliElKitob);
    setDarslikVideo(rec.darslikVideo);
    setArmTashrif(rec.armTashrif);
    setArmHamkorlik(rec.armHamkorlik);
    setShowFormModal(true);
  };

  // Handle Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !department.trim()) {
      alert("Iltimos, o'qituvchi ismi va kafedra nomini kiriting!");
      return;
    }

    setIsSubmitting(true);
    const data = {
      teacherName: teacherName.trim(),
      email: teacherEmail.trim() || undefined,
      faculty,
      department: department.trim(),
      bosmaKitob: Number(bosmaKitob) || 0,
      mualliflikPdf: Number(mualliflikPdf) || 0,
      ruxsatliElKitob: Number(ruxsatliElKitob) || 0,
      darslikVideo: Number(darslikVideo) || 0,
      armTashrif: Number(armTashrif) || 0,
      armHamkorlik: Number(armHamkorlik) || 0
    };

    try {
      if (editingRecord) {
        await onUpdateRecord(editingRecord.id, data);
        alert("Sarxisob ko'rsatkichlari muvaffaqiyatli tahrirlandi!");
      } else {
        await onAddRecord(data);
        alert("O'qituvchi uchun yangi sarxisob ko'rsatkichi muvaffaqiyatli kiritildi!");
      }
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Haqiqatdan ham ${name} ustozning sarxisob reytingini o'chirmoqchimisiz?`)) {
      try {
        await onDeleteRecord(id);
        alert("Sarxisob muvaffaqiyatli o'chirildi!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Extrapolate departments for filter dropdown
  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set);
  }, [records]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.department && r.department.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchFaculty = selectedFaculty === "all" || r.faculty === selectedFaculty;
      const matchDept = selectedDepartment === "all" || r.department === selectedDepartment;
      return matchSearch && matchFaculty && matchDept;
    });
  }, [records, searchQuery, selectedFaculty, selectedDepartment]);

  // Aggregate by Faculty
  const facultyPerformance = useMemo(() => {
    const map: Record<string, { faculty: string, totalKPI: number, count: number, totalBooks: number, totalVisits: number }> = {};
    records.forEach(r => {
      const calc = calculatePoints(r);
      if (!map[r.faculty]) {
        map[r.faculty] = { faculty: r.faculty, totalKPI: 0, count: 0, totalBooks: 0, totalVisits: 0 };
      }
      map[r.faculty].totalKPI += calc.kpiScore;
      map[r.faculty].count += 1;
      map[r.faculty].totalBooks += (r.bosmaKitob + r.mualliflikPdf + r.ruxsatliElKitob + r.darslikVideo);
      map[r.faculty].totalVisits += r.armTashrif;
    });

    return Object.values(map).map(item => ({
      ...item,
      avgKPI: Number((item.totalKPI / item.count).toFixed(2))
    })).sort((a,b) => b.avgKPI - a.avgKPI);
  }, [records]);

  // Aggregate by Department (Kafedra)
  const departmentPerformance = useMemo(() => {
    const map: Record<string, { department: string, faculty: string, totalKPI: number, count: number, totalBooks: number }> = {};
    records.forEach(r => {
      const calc = calculatePoints(r);
      const key = `${r.faculty}-${r.department}`;
      if (!map[key]) {
        map[key] = { department: r.department, faculty: r.faculty, totalKPI: 0, count: 0, totalBooks: 0 };
      }
      map[key].totalKPI += calc.kpiScore;
      map[key].count += 1;
      map[key].totalBooks += (r.bosmaKitob + r.mualliflikPdf + r.ruxsatliElKitob + r.darslikVideo);
    });

    return Object.values(map).map(item => ({
      ...item,
      avgKPI: Number((item.totalKPI / item.count).toFixed(2))
    })).sort((a,b) => b.avgKPI - a.avgKPI);
  }, [records]);

  // Global KPI performance stats
  const overallStats = useMemo(() => {
    if (records.length === 0) return { avgKPI: 0, totalBooks: 0, totalVisits: 0, highFaculty: "Noma'lum" };
    let sumKPI = 0;
    let totalBooks = 0;
    let totalVisits = 0;

    records.forEach(r => {
      const calc = calculatePoints(r);
      sumKPI += calc.kpiScore;
      totalBooks += (r.bosmaKitob + r.mualliflikPdf + r.ruxsatliElKitob + r.darslikVideo);
      totalVisits += r.armTashrif;
    });

    const topFac = facultyPerformance[0]?.faculty || "Noma'lum";

    return {
      avgKPI: Number((sumKPI / records.length).toFixed(2)),
      totalBooks,
      totalVisits,
      highFaculty: topFac
    };
  }, [records, facultyPerformance]);

  return (
    <div id="sarxisob-main-container" className="space-y-6">
      
      {/* Upper header section */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 z-10">
          <span className="text-[10px] font-extrabold uppercase bg-sky-500 text-slate-950 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Award className="w-3.5 h-3.5" />
            Sarxisob & KPI reytingi
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            ARM Kutubxona Foydalanuvchi Ko'rsatkichlari
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Har bir mualliflik va bosma kitob, elektron resurslar, darsliklar topshirilganligi hamda ARMga tashrif va hamkorlik tadbirlari asosida shakllanadigan o'qituvchilar va kafedralar KPI reytingi. Max: 3.0 ball.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs px-4.5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 z-10 whitespace-nowrap shrink-0 border border-slate-100"
          >
            <PlusCircle className="w-4 h-4 text-sky-500" />
            Yangi Sarxisob kiritish
          </button>
        )}

        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">O'rtacha KPI can</span>
            <strong className="text-xl font-extrabold text-slate-800">{overallStats.avgKPI} / 3.0</strong>
            <p className="text-[9px] text-slate-400 mt-0.5">maksimal 3 ballik tizimda</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Jami kitob topshiriqlari</span>
            <strong className="text-xl font-extrabold text-slate-800">{overallStats.totalBooks} donа</strong>
            <p className="text-[9px] text-slate-400 mt-0.5">bosma va elektron darsliklar</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-650 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">ARMga tashriflar</span>
            <strong className="text-xl font-extrabold text-slate-800">{overallStats.totalVisits} marta</strong>
            <p className="text-[9px] text-slate-400 mt-0.5">professor-o'qituvchi tashriflar</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-650 shrink-0">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Eng yuqori fakultet</span>
            <strong className="text-sm font-extrabold text-slate-800 truncate block max-w-[140px]" title={overallStats.highFaculty}>
              {overallStats.highFaculty}
            </strong>
            <p className="text-[9px] text-slate-400 mt-0.5">o'rtacha KPI ko'rsatkichidan</p>
          </div>
        </div>
      </div>

      {/* Main filter engine and view tab selectors */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sub tabs style */}
          <div className="flex bg-slate-100 rounded-xl p-1 w-full md:w-auto">
            <button
              onClick={() => setViewMode("teachers")}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === "teachers" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Ustozlar reytingi
            </button>
            <button
              onClick={() => setViewMode("faculties")}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === "faculties" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Fakultetlar bo'yicha
            </button>
            <button
              onClick={() => setViewMode("departments")}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === "departments" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Kafedralar kesimida
            </button>
          </div>

          {/* Search bar */}
          {viewMode === "teachers" && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Foydalanuvchi ismi yoki kafedrani qidirish..."
                className="block w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Filters Panel for Teachers mode */}
        {viewMode === "teachers" && (
          <div className="border-t border-slate-50 pt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Saralash filtrlari:
            </span>

            {/* Faculty selection */}
            <select
              className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none text-xs"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              <option value="all">Barcha fakultetlar</option>
              {FACULTIES.map(fac => (
                <option key={fac.name} value={fac.name}>{fac.name}</option>
              ))}
            </select>

            {/* Department selection */}
            <select
              className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none text-xs"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">Barcha kafedralar</option>
              {allDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {(selectedFaculty !== "all" || selectedDepartment !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedFaculty("all");
                  setSelectedDepartment("all");
                  setSearchQuery("");
                }}
                className="text-red-500 hover:text-red-700 font-bold hover:underline"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main statistics display cards */}
      <div className="space-y-4">
        
        {/* VIEW 1: Individual teachers / users scoreboard */}
        {viewMode === "teachers" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase">
                  <th className="py-3 px-4">Xodim / Ism-sharif</th>
                  <th className="py-3 px-4">Fakultet va Kafedra</th>
                  <th className="py-3 px-4 text-center">Topshiriqlar ko'rsatkichi (Soni)</th>
                  <th className="py-3 px-4">Umumiy Ball</th>
                  <th className="py-3 px-4">KPI (Max 3.0)</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Amallar</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-slate-400">
                      Hech qanday sarxisob ma'lumoti kiritilmagan.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(rec => {
                    const calc = calculatePoints(rec);
                    const isSelf = currentUserEmail && rec.email && rec.email.toLowerCase() === currentUserEmail.toLowerCase();
                    
                    return (
                      <tr 
                        key={rec.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelf ? "bg-amber-50/50 font-medium" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isSelf && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-extrabold block">
                                SIZ
                              </span>
                            )}
                            <div>
                              <strong className="text-slate-800 block text-sm">{rec.teacherName}</strong>
                              {rec.email && <span className="text-[10px] text-slate-400 block">{rec.email}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 leading-normal">
                          <span className="text-slate-500 font-bold block">{rec.faculty}</span>
                          <span className="text-slate-400 block">{rec.department}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                            <div>
                              <span className="text-slate-400 block">Bosma kitob:</span>
                              <strong>{rec.bosmaKitob || 0}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Mualliflik PDF:</span>
                              <strong>{rec.mualliflikPdf || 0}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Ruxsatli El-Kitob:</span>
                              <strong>{rec.ruxsatliElKitob || 0}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Darslik/Qo'llanma:</span>
                              <strong>{rec.darslikVideo || 0}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">ARM tashrif:</span>
                              <strong>{rec.armTashrif || 0}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Hamkorlik:</span>
                              <strong>{rec.armHamkorlik || 0}</strong>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-extrabold text-sm">
                            {calc.totalPoints} <span className="text-[9px] text-slate-400 font-semibold">ball</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[130px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-extrabold text-indigo-700">
                              <span>{calc.kpiScore}</span>
                              <span className="text-[10px] text-slate-400">/ 3.0</span>
                            </div>
                            
                            {/* Visual KPI progress line bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                              <div 
                                style={{ width: `${(calc.components.printed / 3) * 100}%` }} 
                                className="bg-amber-400 h-full"
                                title={`Bosma: ${calc.components.printed} ball`}
                              />
                              <div 
                                style={{ width: `${(calc.components.electronic / 3) * 100}%` }} 
                                className="bg-cyan-400 h-full"
                                title={`Elektron: ${calc.components.electronic} ball`}
                              />
                              <div 
                                style={{ width: `${(calc.components.cooperation / 3) * 100}%` }} 
                                className="bg-indigo-500 h-full"
                                title={`Hamkorlik: ${calc.components.cooperation} ball`}
                              />
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit(rec)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(rec.id, rec.teacherName)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: Aggregate list by faculty rankings */}
        {viewMode === "faculties" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Fakultetlar reyting jadvali</h3>
              <p className="text-[10px] text-slate-400">Har bir fakultet professor-ustozlari o'rtacha KPI natijalari bo'yicha saralangan jadval</p>
            </div>

            <div className="space-y-3">
              {facultyPerformance.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">Hech qanday ma'lumot mavjud emas</div>
              ) : (
                facultyPerformance.map((item, index) => (
                  <div key={item.faculty} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{item.faculty} fakulteti</h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-sky-500" />
                          Reytingda qatnashgan ustozlar soni: <strong>{item.count} nafar</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block shrink-0">O'rtacha KPI:</span>
                        <div className="flex items-baseline gap-1">
                          <strong className="text-base font-extrabold text-indigo-700">{item.avgKPI}</strong>
                          <span className="text-[9px] text-slate-400 font-semibold">/ 3.0</span>
                        </div>
                      </div>

                      {/* Score line bar indicator */}
                      <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden shrink-0">
                        <div 
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${(item.avgKPI / 3.0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: Aggregate list by departments rankings */}
        {viewMode === "departments" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Kafedralar reyting jadvali</h3>
              <p className="text-[10px] text-slate-400">Kafedralarning ilmiy va kitob tayyorlash yuklamalari umumiy KPI reytingi</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentPerformance.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-slate-400 text-xs">Hech qanday ma'lumot mavjud emas</div>
              ) : (
                departmentPerformance.map((item, index) => (
                  <div key={`${item.faculty}-${item.department}`} className="bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase bg-sky-100 text-sky-850 px-2 py-0.5 rounded">
                          {item.faculty}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs mt-1 leading-snug">
                          {item.department} kafedrasi
                        </h4>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">Kafedra o'rtacha KPI:</span>
                      <strong className="text-xs text-indigo-650 font-extrabold">{item.avgKPI} / 3.0 ball</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* KPI point weights information card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4 text-xs text-indigo-800">
        <Star className="w-10 h-10 text-indigo-500 shrink-0" />
        <div className="space-y-1">
          <strong className="font-bold text-indigo-950 text-sm block">Ushbu baholash tizimi qanday ishlaydi?</strong>
          <p className="leading-relaxed opacity-90 text-[11px]">
            Haqiqiy faollikka qarab quyidagi ballar hisoblanadi:
            <br />
            - <strong>Bosma kitob</strong>: 5.5 ball | <strong>Mualliflik PDF</strong>: 2.4 ball | <strong>Ruxsatli elektron kitoblar</strong>: 0.3 ball.
            <br />
            - <strong>Video va elektron darslik darslar</strong>: 0.3 ball | <strong>ARMga tashrif</strong>: 0.5 ball | <strong>ARM bilan hamkorlik</strong>: 0.2 ball.
            <br />
            KPI jami 3 ball hisoblanadi: Elektron kitoblar (max 1 ball), Bosma kitoblar (max 1 ball) va ARM bilan hamkorlik / tashriflar (max 1 ball) yig'indisi.
          </p>
        </div>
      </div>

      {/* Admin Add/Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-100 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-850 px-2.5 py-0.5 rounded-full uppercase">
                  Reyting va KPIs
                </span>
                <h3 className="font-bold text-slate-800 text-base md:text-lg mt-2 leading-snug">
                  {editingRecord ? "O'qituvchi sarxisob ko'rsatkichlarini tahrirlash" : "Ustoz uchun yangi sarxisob qaydlari kiritish"}
                </h3>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Teacher Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Ustoz / Ism-sharifi:</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Masalan: Umar Abdullayev"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Elektron pochta (Ixtiyoriy/Tizim pochta):</label>
                  <input
                    type="email"
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="pochta@example.com"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Faculty & Department selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Fakultet:</label>
                  <select
                    className="block w-full px-2 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                  >
                    {FACULTIES.map(fac => (
                      <option key={fac.name} value={fac.name}>{fac.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Kafedra:</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Masalan: Axborot Texnologiyalari"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3">
                <strong className="text-indigo-805 font-extrabold uppercase tracking-wider text-[10px] block mb-3">
                  Faollik va kitob topshiriqlar miqdori (Soni):
                </strong>

                {/* Submissions Inputs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[10px]" title="Bosma kitob topshirganda har biriga 5.5 ball">
                      Bosma kitoblar (5.5 b):
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="block w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                      value={bosmaKitob}
                      onChange={(e) => setBosmaKitob(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[10px]" title="Mualliflik elektron PDF topshirganda har biriga 2.4 ball">
                      Mualliflik PDF (2.4 b):
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="block w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                      value={mualliflikPdf}
                      onChange={(e) => setMualliflikPdf(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[10px]" title="Ruxsatli el-kitob topshirganda har biriga 0.3 ball">
                      Ruxsatli El-Kitob (0.3 b):
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="block w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                      value={ruxsatliElKitob}
                      onChange={(e) => setRuxsatliElKitob(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[10px]" title="Darslik va video tahlili uchun har biriga 0.3 ball">
                      E-darslik / Video (0.3 b):
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="block w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                      value={darslikVideo}
                      onChange={(e) => setDarslikVideo(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[10px]" title="ARMga tashrif uchun har biriga 0.5 ball">
                      ARMga tashrif (0.5 b):
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="block w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                      value={armTashrif}
                      onChange={(e) => setArmTashrif(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 text-[10px]" title="ARM hamkorlik tadbiri uchun har biriga 0.2 ball">
                      Tadbirlar (0.2 b):
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="block w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                      value={armHamkorlik}
                      onChange={(e) => setArmHamkorlik(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic preview of KPI based on formula */}
              {(() => {
                const tempCalc = calculatePoints({
                  bosmaKitob,
                  mualliflikPdf,
                  ruxsatliElKitob,
                  darslikVideo,
                  armTashrif,
                  armHamkorlik
                });
                return (
                  <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-150">
                    <div>
                      <strong className="text-slate-700 font-extrabold block">Reyting Ballari hisobi:</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Elektron darsliklar: {tempCalc.components.electronic} ball | Bosma: {tempCalc.components.printed} ball | ARM hamkorlik: {tempCalc.components.cooperation} ball
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Kutilayotgan KPI:</span>
                      <strong className="text-base text-indigo-750 font-black">{tempCalc.kpiScore} / 3.0 ball</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  {isSubmitting ? "Kiritilmoqda..." : "Tasdiqlab saqlash"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
