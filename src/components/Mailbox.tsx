/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { NotificationMessage, NotificationReply, UserProfile } from "../types";
import { 
  Mail, MessageSquare, Send, Calendar, User, Users, Shield, Clock, PlusCircle, CheckCircle, Trash2, ArrowRightLeft, Reply
} from "lucide-react";

interface MailboxProps {
  user: UserProfile;
  notifications: NotificationMessage[];
  onAddNotification: (notifData: Omit<NotificationMessage, "id" | "date" | "replies">) => Promise<void>;
  onAddReply: (notifId: string, replyContent: string) => Promise<void>;
  isAdmin: boolean;
}

export default function Mailbox({ 
  user, 
  notifications, 
  onAddNotification, 
  onAddReply,
  isAdmin 
}: MailboxProps) {
  
  const [activeTab, setActiveTab] = useState<"received" | "sent-mgr">("received");

  // Create Notification Form (Admin ONLY)
  const [targetType, setTargetType] = useState<"all" | "single">("all");
  const [targetUserEmail, setTargetUserEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Reply Form
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // Filter messages for current user
  const visibleNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (notif.targetUserId === "all") return true;
      // if targeted to this specific user or their email
      if (notif.targetUserId === user.uid) return true;
      if (notif.targetUserName?.toLowerCase() === user.email.toLowerCase()) return true;
      if (notif.targetUserId.toLowerCase() === user.email.toLowerCase()) return true;
      return false;
    });
  }, [notifications, user]);

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Iltimos, sarlavha va xabar matnini to'ldiring!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddNotification({
        senderId: user.uid,
        senderName: `${user.fullName} (ARM Ma'muri)`,
        targetUserId: targetType === "all" ? "all" : targetUserEmail.trim(),
        targetUserName: targetType === "all" ? "Barcha foydalanuvchilar" : targetUserEmail.trim(),
        title: title.trim(),
        content: content.trim()
      });
      setTitle("");
      setContent("");
      setTargetUserEmail("");
      alert("Xabar muvaffaqiyatli jo'natildi!");
    } catch (err) {
      alert("Xatolik: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (notifId: string) => {
    const replyTxt = replyInputMap[notifId];
    if (!replyTxt || !replyTxt.trim()) {
      alert("Javob matni bo'sh bo'lishi mumkin emas!");
      return;
    }

    setSubmittingReplyId(notifId);
    try {
      await onAddReply(notifId, replyTxt.trim());
      // clear
      setReplyInputMap(prev => ({ ...prev, [notifId]: "" }));
      alert("Sizning javobingiz adminga muvaffaqiyatli yetkazildi.");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  return (
    <div id="mailbox-workspace" className="space-y-6">
      
      {/* Upper Tab and Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-medium">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            Bildirishnomalar & ARM Pochtasi
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ushbu xizmat orqali ARM admini bilan xat va vazifalar almashishingiz hamda bajarilgan ishlarni tasdiqlab javob yo'llashingiz mumkin.
          </p>
        </div>

        {isAdmin && (
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("received")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "received" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Kelgan xat-vazifalar
            </button>
            <button
              onClick={() => setActiveTab("sent-mgr")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "sent-mgr" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Boshqaruv (Xabar yuborish & Replies)
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAIN USER VIEW PANEL */}
        {(!isAdmin || activeTab === "received") && (
          <div className="lg:col-span-3 space-y-4">
            
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Kelgan Xat va Ma'muriyat Topsiriqlari
            </h4>

            {visibleNotifications.length === 0 ? (
              <div className="bg-white border rounded-3xl p-12 text-center text-slate-400 border-slate-100">
                <Mail className="w-10 h-10 mx-auto text-slate-350 mb-3" />
                <h5 className="font-bold text-slate-600 text-sm">Pochta qutisi bo'sh</h5>
                <p className="text-xs mt-1">Hozircha sizga kelgan maxsus bildirishnoma yoki vazifalar mavjud emas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleNotifications.map(notif => {
                  const replyList = notif.replies || [];
                  const userOwnReply = replyList.filter(rep => rep.userEmail === user.email);

                  return (
                    <div key={notif.id} className="bg-white border border-slate-150 rounded-2xl p-5 hover:shadow-xs transition-shadow relative">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                            <Shield className="w-3.5 h-3.5" />
                            {notif.senderName}
                          </span>
                          
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Jo'natilgan sana: {notif.date}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-800 text-base leading-snug">{notif.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed mt-2 p-3 bg-slate-50/75 rounded-xl border border-slate-100/50">
                            {notif.content}
                          </p>
                        </div>

                        {/* Existing replies under this notice */}
                        {replyList.length > 0 && (
                          <div className="space-y-2.5 pt-2 border-t border-slate-100 mt-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Bizning muloqot / Javoblar:</span>
                            {replyList.map(rep => {
                              const repDate = new Date(rep.timestamp).toLocaleString("uz-UZ", {
                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                              });
                              return (
                                <div key={rep.id} className={`p-2.5 rounded-xl text-xs flex flex-col space-y-1 ${
                                  rep.userEmail === user.email ? "bg-emerald-50/50 border border-emerald-100/70 ml-6" : "bg-slate-50 border border-slate-150"
                                }`}>
                                  <div className="flex items-center justify-between font-bold text-slate-700 text-[10px]">
                                    <span className="flex items-center gap-1 text-slate-800 font-extrabold">
                                      {rep.userFullName} ({rep.userEmail === user.email ? "Siz" : rep.userEmail})
                                    </span>
                                    <span className="text-slate-400">{repDate}</span>
                                  </div>
                                  <p className="text-slate-600 text-xs italic">
                                    "{rep.replyContent}"
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply Form */}
                        <div className="pt-3 border-t border-slate-100/50 flex flex-col sm:flex-row gap-2 mt-3 text-xs">
                          <input
                            type="text"
                            placeholder="Adminga qisqa va tezkor javob yozish (M-n: Vazifa bajarildi, Scopus bo'yicha hisobot topshirildi)."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                            value={replyInputMap[notif.id] || ""}
                            onChange={(e) => setReplyInputMap(prev => ({ ...prev, [notif.id]: e.target.value }))}
                          />
                          <button
                            onClick={() => handleSendReply(notif.id)}
                            disabled={submittingReplyId === notif.id}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Javob qaytarish
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ADMINISTRATIVE MANAGER PANEL VIEW */}
        {isAdmin && activeTab === "sent-mgr" && (
          <>
            {/* Create message panel */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 h-fit">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Yangi Bildirishnoma / Pochta Yuborish</h3>
                <p className="text-xs text-slate-400 mt-0.5">Xodimlarga aniq vazifalar bering yoki umumiy e'lon yuboring.</p>
              </div>

              <form onSubmit={handleCreateNotification} className="space-y-4 text-xs font-medium">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Kime yo'naltirilgan (Target):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType("all")}
                      className={`py-1.5 rounded-lg border font-bold transition-all text-center ${
                        targetType === "all" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-600 border-slate-150"
                      }`}
                    >
                      Barcha xodimlarga
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType("single")}
                      className={`py-1.5 rounded-lg border font-bold transition-all text-center ${
                        targetType === "single" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-600 border-slate-150"
                      }`}
                    >
                      Bitta aniq userga
                    </button>
                  </div>
                </div>

                {targetType === "single" && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Foydalanuvchi elektron pochta manzili:</label>
                    <input
                      type="email"
                      placeholder="M-n: tadqiqotchi@jizpi.uz"
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                      value={targetUserEmail}
                      onChange={(e) => setTargetUserEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Xat Sarlavhasi (Mavzu):</label>
                  <input
                    type="text"
                    placeholder="M-n: Scopus hisoboti muammolari"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Xat kontenti va topshiriq matni:</label>
                  <textarea
                    rows={4}
                    placeholder="Hurmatli professorlar, barchangiz oxirgi xizmat safaringizda ..."
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 leading-normal font-medium"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Yuborilmoqda..." : "Bildirishnoma yuborish"}
                </button>

              </form>
            </div>

            {/* List notifications and view user replies */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Siz chop etgan topshiriq va bildirishnomalar</h3>
                <p className="text-xs text-slate-400 mt-0.5">Xatdagi foydalanuvchilarning real vaqtdagi fikr-mulohazalari va hisobotlari.</p>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Chop etilgan xatlar hozircha yo'q.</p>
                ) : (
                  notifications.map(notif => {
                    const replyList = notif.replies || [];
                    return (
                      <div key={notif.id} className="p-4 border border-slate-150 rounded-xl space-y-3 hover:border-slate-350 transition-colors">
                        <div className="flex items-start justify-between text-xs font-semibold">
                          <div>
                            <h4 className="font-extrabold text-slate-800 inline">{notif.title}</h4>
                            <span className="text-[10px] ml-2 text-slate-400 block font-normal">
                              Status: {notif.targetUserId === "all" ? "Barcha foydalanuvchilarga" : `Aniq user: ${notif.targetUserId}`}
                            </span>
                          </div>
                          
                          <span className="text-slate-400 text-[10px]">{notif.date}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {notif.content}
                        </p>

                        {/* User Replies */}
                        <div className="space-y-2 pl-4 border-l-2 border-indigo-200">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Kelib tushgan javoblar ({replyList.length} ta):</span>
                          {replyList.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic font-medium">Hozircha foydalanuvchilar ushbu topshiriqqa javob yo'llashmadi.</p>
                          ) : (
                            replyList.map(rep => {
                              const repDate = new Date(rep.timestamp).toLocaleString("uz-UZ", {
                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                              });
                              return (
                                <div key={rep.id} className="bg-emerald-50/20 border border-emerald-100 p-2.5 rounded-lg text-xs leading-relaxed space-y-1">
                                  <div className="flex items-center justify-between font-bold text-slate-700 text-[10px]">
                                    <span className="text-slate-800">{rep.userFullName} ({rep.userEmail})</span>
                                    <span className="text-slate-400">{repDate}</span>
                                  </div>
                                  <p className="text-slate-600 italic">
                                    "{rep.replyContent}"
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
