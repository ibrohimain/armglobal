/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { UserProfile, FACULTIES } from "../types";
import { User, Shield, GraduationCap, Building2, Save, CheckCircle } from "lucide-react";

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updatedFields: Partial<UserProfile>) => Promise<void>;
}

export default function ProfileSettings({ profile, onUpdateProfile }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [faculty, setFaculty] = useState(profile.faculty);
  const [department, setDepartment] = useState(profile.department);
  const [workplace, setWorkplace] = useState(profile.workplace || "");
  const [userType, setUserType] = useState(profile.userType);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get departments based on selected faculty
  const availableDepartments = useMemo(() => {
    if (faculty === "Mehmon") {
      return ["Mehmonlar bo'limi"];
    }
    return FACULTIES.find(f => f.name === faculty)?.departments || [];
  }, [faculty]);

  // Adjust department if selected faculty changes
  const handleFacultyChange = (newFac: string) => {
    setFaculty(newFac);
    if (newFac === "Mehmon") {
      setDepartment("Mehmonlar bo'limi");
    } else {
      const depts = FACULTIES.find(f => f.name === newFac)?.departments || [];
      if (depts.length > 0) {
        setDepartment(depts[0]);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert("Ism va Familiyangizni kiriting!");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({
        fullName: fullName.trim(),
        faculty,
        department,
        workplace: workplace.trim() || undefined,
        userType
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      alert("Profilni saqlashda xatolik: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile-settings-card" className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
      
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
          <User className="w-6 h-6 text-sky-600" />
          Akkount Ma'lumotlarini Tahrirlash (Profil)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Axborot-resurs markazi portalidagi shaxsiy ma'lumotlaringizni yangilang. Ushbu ma'lumotlar kiritgan ilmiy qaydlaringizda va liderlar ro'yxatida to'g'ri aks etadi.
        </p>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Muvaffaqiyatli saqlandi!</p>
            <p className="mt-0.5 text-emerald-600 font-medium">Sizning profilingiz muvaffaqiyatli tahrirlandi.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        
        {/* Email display only */}
        <div>
          <label className="font-bold text-slate-600 uppercase block mb-1">Elektron pochta manzili (Pochtani o'zgartirib bo'lmaydi):</label>
          <input
            type="email"
            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono focus:outline-none cursor-not-allowed"
            value={profile.email}
            disabled
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="font-bold text-slate-600 uppercase block mb-1">To'liq ism va familiyangiz:</label>
          <input
            type="text"
            className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="M-n: Alimov Hasanboy"
          />
        </div>

        {/* User Type selecting */}
        <div>
          <label className="font-bold text-slate-600 uppercase block mb-1">Portal toifasi (Ish o'rni):</label>
          <select
            className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={userType}
            onChange={(e) => setUserType(e.target.value as any)}
          >
            <option value="Researcher">Ilmiy tadqiqotchi</option>
            <option value="Teacher">O'qituvchi ustoz / Professor</option>
            <option value="PhD">Tayanch doktorant (PhD)</option>
            <option value="Master">Magistrant talaba</option>
            <option value="Student">Iqtidorli talaba</option>
            <option value="Guest">Mehmon / Tashrif buyuruvchi</option>
          </select>
        </div>

        {/* Faculty & department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-600 uppercase block mb-1">Fakultetingiz:</label>
            <select
              className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={faculty}
              onChange={(e) => handleFacultyChange(e.target.value)}
            >
              {FACULTIES.map(fac => (
                <option key={fac.name} value={fac.name}>{fac.name}</option>
              ))}
              <option value="Mehmon">Mehmon (Institutdan tashqari)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 uppercase block mb-1">Kafedrangiz:</label>
            <select
              className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={faculty === "Mehmon"}
            >
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Workplace details */}
        <div>
          <label className="font-bold text-slate-600 uppercase block mb-1">Aniq ish joyingiz yoki kafedra kodi (ixtiyoriy):</label>
          <input
            type="text"
            className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={workplace}
            onChange={(e) => setWorkplace(e.target.value)}
            placeholder="Masalan: ARM 2-zal xodimi, yoki Sanoat binosi 401-xona"
          />
        </div>

        {/* Submit */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-sky-650 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saqlanmoqda..." : "Profil ma'lumotlarini saqlash"}
          </button>
        </div>

      </form>
    </div>
  );
}
