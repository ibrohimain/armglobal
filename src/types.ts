/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FacultyData {
  name: string;
  departments: string[];
}

export const FACULTIES: FacultyData[] = [
  {
    name: "Transport muhandisligi",
    departments: [
      "Transport vositalari muhandisligi",
      "Transport logistikasi",
      "Umumtexnika fanlari",
      "Ijtimoiy fanlar"
    ]
  },
  {
    name: "Qurilish muhandisligi",
    departments: [
      "Qurilish muhandisligi",
      "Yo‘l muhandisligi",
      "Qurilish materiallari va konstruksiyalari",
      "Muhandislik kommunikatsiyalari"
    ]
  },
  {
    name: "Kimyo muhandisligi",
    departments: [
      "Kimyoviy texnologiya",
      "Kimyo",
      "Arxitekturaviy loyihalash",
      "O‘zbek va xorijiy tillar"
    ]
  },
  {
    name: "Sanoat texnologiyalari",
    departments: [
      "To‘qimachilik mahsulotlari texnologiyasi",
      "Tabiiy tolalar va matoga ishlov berish texnologiyalari",
      "Qishloq xo‘jalik va oziq – ovqat texnika texnologiyalari",
      "Ekologiya va mehnat muxofazasi"
    ]
  },
  {
    name: "Energetika muhandisligi",
    departments: [
      "Energetika va elektr texnologiyasi",
      "Metrologiya va standartlashtirish",
      "Fizika",
      "Oliy matematika"
    ]
  },
  {
    name: "Kibernetika",
    departments: [
      "Kompyuter va dasturiy injiniring",
      "Jismoniy tarbiya",
      "Radioelektronika",
      "Iqtisodiyot va menejment"
    ]
  }
];

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  userType: "Researcher" | "Teacher" | "PhD" | "Master" | "Student" | "Guest";
  faculty: string; // "Mehmon" if guest
  department: string; // "Mehmon" if guest
  workplace?: string; // Optional custom workplace or details
  createdAt: string;
}

export interface DatabaseResource {
  id: string; // doc ID or unique name
  name: string; // Scopus, ScienceDirect, etc.
  type: "foreign" | "national";
  url: string;
  description: string;
  logoUrl?: string;
  isCustom?: boolean;
}

export interface UsageLog {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userType: string;
  faculty: string;
  department: string;
  databaseId: string;
  databaseName: string;
  isCustomDatabase?: boolean;
  purpose: "Scientific Research" | "Dissertation" | "Lesson Preparation" | "News Study" | "Other";
  customPurposeDetail?: string;
  timestamp: string; // ISO string
  notes?: string;
  showPublic?: boolean; // Share this entry publicly with other researchers
}

export interface NotificationMessage {
  id: string;
  senderId: string;
  senderName: string;
  targetUserId: "all" | string; // target user id, or "all"
  targetUserName?: string;
  title: string;
  content: string;
  date: string;
  replies?: NotificationReply[];
}

export interface NotificationReply {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  replyContent: string;
  timestamp: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  category: "Kitob" | "Elektron resurs" | "Arxiv";
  viewsCount: number;
  description: string;
  fileUrl?: string; // fake or real path
  language?: string;
  year?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface SarxisobRecord {
  id: string;
  teacherName: string;
  email?: string;
  faculty: string;
  department: string;
  bosmaKitob: number;      // 5.5 points
  mualliflikPdf: number;    // 2.4 points
  ruxsatliElKitob: number;  // 0.3 points
  darslikVideo: number;     // 0.3 points
  armTashrif: number;       // 0.5 points
  armHamkorlik: number;     // 0.2 points
  createdAt: string;
}

