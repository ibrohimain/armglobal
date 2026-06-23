/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { 
  TrendingUp, Award, Users, Database, Layers, Filter, Search, RotateCcw, ShieldAlert, Check
} from "lucide-react";
import { UsageLog, FACULTIES, SarxisobRecord } from "../types";

interface StatsDashboardProps {
  logs: UsageLog[];
  sarxisobRecords?: SarxisobRecord[];
}

const COLORS = ["#0284c7", "#0ea5e9", "#06b6d4", "#10b981", "#34d399", "#a855f7", "#ec4899", "#f43f5e", "#fb923c"];

// Helper function to calculate KPI scores consistent with Sarxisob.tsx
const calculateKpiForRecord = (rec: any) => {
  const bosma = (Number(rec.bosmaKitob) || 0) * 5.5;
  const mualliflik = (Number(rec.mualliflikPdf) || 0) * 2.4;
  const ruxsatli = (Number(rec.ruxsatliElKitob) || 0) * 0.3;
  const darslik = (Number(rec.darslikVideo) || 0) * 0.3;
  const visits = (Number(rec.armTashrif) || 0) * 0.5;
  const coop = (Number(rec.armHamkorlik) || 0) * 0.2;
  
  const totalPoints = bosma + mualliflik + ruxsatli + darslik + visits + coop;
  
  const electronicKpi = Math.min(1.0, mualliflik + ruxsatli + darslik);
  const printedKpi = Math.min(1.0, bosma);
  const coopKpi = Math.min(1.0, visits + coop);
  
  const kpiScore = Number((electronicKpi + printedKpi + coopKpi).toFixed(2));
  return {
    totalPoints: Number(totalPoints.toFixed(2)),
    kpiScore
  };
};

export default function StatsDashboard({ logs, sarxisobRecords = [] }: StatsDashboardProps) {
  const [facultyFilter, setFacultyFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [dbFilter, setDbFilter] = useState<string>("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Memoized lists of KPI rankings
  const teacherKpiList = useMemo(() => {
    if (!sarxisobRecords || sarxisobRecords.length === 0) return [];
    return sarxisobRecords.map(rec => {
      const calc = calculateKpiForRecord(rec);
      return {
        ...rec,
        totalPoints: calc.totalPoints,
        kpiScore: calc.kpiScore,
      };
    }).sort((a, b) => b.kpiScore - a.kpiScore || b.totalPoints - a.totalPoints);
  }, [sarxisobRecords]);

  const departmentKpiList = useMemo(() => {
    if (!sarxisobRecords || sarxisobRecords.length === 0) return [];
    const groups: Record<string, { department: string; faculty: string; totalKpi: number; count: number }> = {};
    sarxisobRecords.forEach(rec => {
      const calc = calculateKpiForRecord(rec);
      if (!groups[rec.department]) {
        groups[rec.department] = {
          department: rec.department,
          faculty: rec.faculty,
          totalKpi: 0,
          count: 0
        };
      }
      groups[rec.department].totalKpi += calc.kpiScore;
      groups[rec.department].count += 1;
    });
    return Object.values(groups).map(g => ({
      name: g.department,
      faculty: g.faculty,
      "O'rtacha KPI": Number((g.totalKpi / g.count).toFixed(2)),
      "Xodimlar soni": g.count
    })).sort((a, b) => b["O'rtacha KPI"] - a["O'rtacha KPI"]);
  }, [sarxisobRecords]);

  // Clean filter dependencies
  const availableDepartments = useMemo(() => {
    if (!facultyFilter) return [];
    return FACULTIES.find(f => f.name === facultyFilter)?.departments || [];
  }, [facultyFilter]);

  // Reset department when faculty changes
  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFacultyFilter(e.target.value);
    setDepartmentFilter("");
  };

  // 1. Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchFaculty = !facultyFilter || log.faculty === facultyFilter;
      const matchDept = !departmentFilter || log.department === departmentFilter;
      const matchDb = !dbFilter || log.databaseName === dbFilter;
      const matchUserType = !userTypeFilter || log.userType === userTypeFilter;
      
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        log.userFullName.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower) ||
        log.databaseName.toLowerCase().includes(searchLower) ||
        (log.notes && log.notes.toLowerCase().includes(searchLower)) ||
        (log.customPurposeDetail && log.customPurposeDetail.toLowerCase().includes(searchLower));

      return matchFaculty && matchDept && matchDb && matchUserType && matchSearch;
    });
  }, [logs, facultyFilter, departmentFilter, dbFilter, userTypeFilter, searchQuery]);

  // Reset all filters
  const resetFilters = () => {
    setFacultyFilter("");
    setDepartmentFilter("");
    setDbFilter("");
    setUserTypeFilter("");
    setSearchQuery("");
  };

  // 2. Metrics summary
  const totalLogsCount = filteredLogs.length;
  
  const uniqueUsersCount = useMemo(() => {
    return new Set(filteredLogs.map(log => log.userEmail)).size;
  }, [filteredLogs]);

  const topDatabase = useMemo(() => {
    if (filteredLogs.length === 0) return "Noma'lum";
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.databaseName] = (counts[log.databaseName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Noma'lum";
  }, [filteredLogs]);

  const activeFaculty = useMemo(() => {
    if (filteredLogs.length === 0) return "Noma'lum";
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.faculty] = (counts[log.faculty] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Noma'lum";
  }, [filteredLogs]);

  // 3. Database Leaderboard Chart Data
  const databaseLeaderboard = useMemo(() => {
    const counts: Record<string, { name: string; count: number; foreign: boolean }> = {};
    filteredLogs.forEach(log => {
      if (!counts[log.databaseName]) {
        counts[log.databaseName] = { 
          name: log.databaseName, 
          count: 0, 
          foreign: !log.isCustomDatabase // assuming custom are mostly national/other unless labeled
        };
      }
      counts[log.databaseName].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredLogs]);

  // 4. Faculty distribution Chart Data
  const facultyChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.faculty] = (counts[log.faculty] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredLogs]);

  // 5. User type distribution Chart Data
  const userTypeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.userType] = (counts[log.userType] || 0) + 1;
    });
    
    // map english terms to readable Uzbek names
    const typeTranslations: Record<string, string> = {
      "Researcher": "Tadqiqotchi",
      "Teacher": "O'qituvchi",
      "PhD": "Tayanch doktorant",
      "Master": "Magistrant",
      "Student": "Talaba",
      "Guest": "Mehmon"
    };

    return Object.entries(counts).map(([name, value]) => ({ 
      name: typeTranslations[name] || name, 
      value 
    }));
  }, [filteredLogs]);

  // 6. Purpose distribution Chart Data
  const purposeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.purpose] = (counts[log.purpose] || 0) + 1;
    });

    const purposeTranslations: Record<string, string> = {
      "Scientific Research": "Ilmiy izlanish",
      "Dissertation": "Dissertatsiya",
      "Lesson Preparation": "Darsga tayyorgarlik",
      "News Study": "Yangiliklar o'rganish",
      "Other": "Boshqa maqsadlar"
    };

    return Object.entries(counts).map(([name, value]) => ({ 
      name: purposeTranslations[name] || name, 
      value 
    }));
  }, [filteredLogs]);

  // 7. Timeline Chart Data (Visits over dates)
  const timelineChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const dateStr = log.timestamp.split("T")[0]; // YYYY-MM-DD
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, "Tashriflar soni": count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredLogs]);

  return (
    <div id="stats-container" className="space-y-6">
      
      {/* Search and Filters Strip */}
      <div id="filters-card" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-slate-800 text-base">Filtrlash va Qidiruv (Statistikani tahlil qilish)</h3>
          </div>
          {(facultyFilter || departmentFilter || dbFilter || userTypeFilter || searchQuery) && (
            <button 
              onClick={resetFilters}
              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Filtrlarni tozalash
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Ism, elektron pochta..."
              className="block w-full pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Faculty filter */}
          <div>
            <select
              value={facultyFilter}
              onChange={handleFacultyChange}
              className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            >
              <option value="">Barcha Fakultetlar</option>
              {FACULTIES.map(fac => (
                <option key={fac.name} value={fac.name}>{fac.name}</option>
              ))}
              <option value="Mehmon">Mehmonlar (Institutdan tashqari)</option>
            </select>
          </div>

          {/* Department filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              disabled={!facultyFilter || facultyFilter === "Mehmon"}
              className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Barcha Kafedralar</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* User Type filter */}
          <div>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            >
              <option value="">Foydalanuvchi toifasi</option>
              <option value="Researcher">Ilmiy tadqiqotchi</option>
              <option value="Teacher">O'qituvchi</option>
              <option value="PhD">Tayanch doktorant (PhD)</option>
              <option value="Master">Magistrant</option>
              <option value="Student">Talaba</option>
              <option value="Guest">Mehmon</option>
            </select>
          </div>

          {/* Database filter */}
          <div>
            <select
              value={dbFilter}
              onChange={(e) => setDbFilter(e.target.value)}
              className="block w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            >
              <option value="">Barcha Bazalar / Resurslar</option>
              {Array.from(new Set(logs.map(log => log.databaseName))).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Info label about active filters */}
        {filteredLogs.length !== logs.length && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Natijalar filtrlangan: Jami <strong>{logs.length}</strong> tadan <strong>{filteredLogs.length}</strong> tasi ko'rsatilmoqda.</span>
          </div>
        )}
      </div>

      {/* Main Metric Cards Grid */}
      <div id="metrics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-sky-50 text-sky-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium leading-none">Jami foydalanishlar</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1.5 leading-none">{totalLogsCount} <span className="text-xs font-normal text-slate-400">marta</span></h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium leading-none">Faol foydalanuvchilar</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1.5 leading-none">{uniqueUsersCount} <span className="text-xs font-normal text-slate-400">ta shaxs</span></h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium leading-none">Eng faol baza (Top-1)</p>
            <h4 className="text-base font-bold text-slate-800 mt-1.5 leading-tight truncate max-w-[150px]">{topDatabase}</h4>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium leading-none">Eng faol fakultet</p>
            <h4 className="text-sm font-bold text-slate-800 mt-1.5 leading-tight truncate max-w-[150px]">{activeFaculty === "Mehmon" ? "Mehmonlar" : activeFaculty}</h4>
          </div>
        </div>

      </div>

      {logs.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-semibold text-slate-700">Tizimda hozircha statistik ma'lumotlar mavjud emas</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Haqiqiy ma'lumotlar paydo bo'lishi uchun, iltimos, yuqoridagi <strong>"Bazaga tashrifni qayd etish"</strong> bo'limiga o'tib, bazaga kirganingiz haqidagi ma'lumotni kiritib tasdiqlang!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Database Leaderboard (Top Reyting) */}
            <div id="db-leaderboard-card" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Xorijiy va Milliy Bazalar Reytingi (Top Baza)
                </h3>
                <span className="text-xs bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-medium">Barchasi</span>
              </div>
              
              <div className="flex-1 space-y-3">
                {databaseLeaderboard.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Natijalar topilmadi</p>
                ) : (
                  databaseLeaderboard.slice(0, 5).map((db, idx) => {
                    const percentage = totalLogsCount > 0 ? Math.round((db.count / totalLogsCount) * 100) : 0;
                    return (
                      <div key={db.name} className="flex flex-col gap-1.5 p-3 rounded-xl hover:bg-slate-50 transition-all">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                              #{idx + 1}
                            </span>
                            <span>{db.name}</span>
                          </div>
                          <span className="text-slate-500 font-bold">{db.count} marta ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Timeline analysis */}
            <div id="timeline-card" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-500" />
                Tashriflarning vaqt bo'yicha dinamikasi (Kunlik ko'rsatkich)
              </h3>
              <div className="h-[230px] w-full flex-1">
                {timelineChartData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center">Tegishli ma'lumotlar mavjud emas</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} stroke="#e2e8f0" />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} stroke="#e2e8f0" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                        labelStyle={{ fontStyle: "bold" }}
                      />
                      <Line type="monotone" dataKey="Tashriflar soni" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* KPI & SARXISOB REYTINGI TAHLILI SECTION */}
          {sarxisobRecords && sarxisobRecords.length > 0 && (
            <div id="kpi-charts-section" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    O'qituvchilar va Kafedralar KPI Reytingi (KPI & Sarxisob)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Elektron kutubxona, mualliflik kitoblari va hamkorlik tadbirlari bo'yicha eng yuqori ko'rsatkichlar
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full w-fit whitespace-nowrap">
                  Maksimal: 3.0 KPI ball
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart 1: Top Teachers Bar Chart */}
                <div className="lg:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                    Eng yuqori KPI ball to'plagan o'qituvchilar (Top 8)
                  </h4>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={teacherKpiList.slice(0, 8)} 
                        margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="teacherName" 
                          tick={{ fill: "#64748b", fontSize: 9 }} 
                          stroke="#e2e8f0"
                          tickFormatter={(val) => {
                            if (!val) return "";
                            const parts = val.split(" ");
                            if (parts.length >= 2) {
                              return `${parts[0]} ${parts[1][0]}.`; // truncate to "Surname N."
                            }
                            return val.length > 12 ? `${val.substring(0, 10)}..` : val;
                          }}
                        />
                        <YAxis 
                          domain={[0, 3.0]} 
                          tick={{ fill: "#64748b", fontSize: 10 }} 
                          stroke="#e2e8f0" 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                          formatter={(val: any) => [`${val} ball`, "KPI reyting balli"]}
                        />
                        <Bar dataKey="kpiScore" name="KPI balli" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={26}>
                          {teacherKpiList.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#fbbf24" : index === 1 ? "#94a3b8" : index === 2 ? "#b45309" : "#38bdf8"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top 3 Medals list */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-550 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Eng yuqori natijalar (Top 3)
                    </h4>

                    <div className="space-y-3 mt-2">
                      {teacherKpiList.slice(0, 3).map((rec, index) => {
                        const medalStyles = [
                          { bg: "bg-amber-150 text-amber-600 border-amber-200", icon: "🥇", text: "Oltin" },
                          { bg: "bg-slate-200 text-slate-700 border-slate-300", icon: "🥈", text: "Kumush" },
                          { bg: "bg-amber-700/10 text-amber-900 border-amber-500/10", icon: "🥉", text: "Bronza" },
                        ][index] || { bg: "bg-slate-100 text-slate-500", icon: `${index + 1}`, text: "" };

                        return (
                          <div 
                            key={rec.id} 
                            className={`p-3 rounded-xl border bg-white flex items-center justify-between transition-all hover:translate-x-1 ${
                              index === 0 ? "border-amber-200 shadow-xs" : "border-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${medalStyles.bg}`}>
                                {medalStyles.icon}
                              </span>
                              <div className="leading-snug min-w-0">
                                <strong className="block text-xs text-slate-805 font-extrabold truncate max-w-[110px]">
                                  {rec.teacherName}
                                </strong>
                                <span className="text-[10px] text-slate-400 block font-medium truncate max-w-[110px]">
                                  {rec.department}
                                </span>
                              </div>
                            </div>
                            <div className="text-right leading-none shrink-0">
                              <span className="text-xs font-black text-slate-800 block">{rec.kpiScore} <span className="text-[9px] font-normal text-slate-400">KPI</span></span>
                              <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{rec.totalPoints} ochko</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-150 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500">
                    <span>O'qituvchilar jami sarxisobi:</span>
                    <strong className="font-extrabold text-slate-700 text-xs">{sarxisobRecords.length} ta</strong>
                  </div>
                </div>

              </div>

              {/* Chart 2: Department-wise Average KPI Bar Chart */}
              {departmentKpiList.length > 0 && (
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                    Kafedralar kesimida o'rtacha KPI natijalari (Soni va ko'rsatkichi)
                  </h4>
                  <div className="h-[210px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={departmentKpiList.slice(0, 8)} 
                        margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: "#64748b", fontSize: 8.5 }} 
                          stroke="#e2e8f0"
                          tickFormatter={(val) => val && val.length > 22 ? `${val.substring(0, 20)}..` : val}
                        />
                        <YAxis 
                          domain={[0, 3.0]} 
                          tick={{ fill: "#64748b", fontSize: 10 }} 
                          stroke="#e2e8f0" 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                          formatter={(val) => [`${val} ball`, "O'rtacha KPI"]}
                        />
                        <Bar dataKey="O'rtacha KPI" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28}>
                          {departmentKpiList.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Sub Visualization Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bar Chart 1 - Faculty distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:col-span-2">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Fakultetlar kesimida faollik (Soni)
              </h3>
              <div className="h-[250px] w-full flex-1">
                {facultyChartData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center">Taqqoslash uchun ma'lumotlar yo'q</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={facultyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: "#64748b", fontSize: 8 }} 
                        stroke="#e2e8f0"
                        tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 18)}..` : value}
                      />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} stroke="#e2e8f0" />
                      <Tooltip contentStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="value" name="Tashriflar" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie Chart - User type / purpose distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-emerald-500" />
                Foydalanish Maqsadlari
              </h3>
              <div className="h-[180px] w-full flex-1 flex items-center justify-center relative">
                {purposeChartData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center">Ma'lumotlar yo'q</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={purposeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {purposeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-3 space-y-1.5">
                {purposeChartData.map((d, index) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate max-w-[124px]">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sub Visualization Part 2 - User types */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Foydalanuvchilar Toifalari bo'yicha Tahlil
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {["Researcher", "Teacher", "PhD", "Master", "Student", "Guest"].map((type, idx) => {
                const count = logs.filter(l => l.userType === type).length;
                const typeUzNames: Record<string, string> = {
                  "Researcher": "Tadqiqotchi",
                  "Teacher": "O'qituvchi",
                  "PhD": "Tayanch doktorant",
                  "Master": "Magistrant",
                  "Student": "Talaba",
                  "Guest": "Mehmon"
                };

                return (
                  <div key={type} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center flex flex-col justify-between">
                    <p className="text-xs text-slate-500 font-medium truncate">{typeUzNames[type] || type}</p>
                    <h5 className="text-xl font-bold text-slate-800 mt-2">{count} <span className="text-[10px] font-normal text-slate-400">marta</span></h5>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
