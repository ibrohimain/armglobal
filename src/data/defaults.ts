/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatabaseResource, LibraryResource, Announcement, SarxisobRecord } from "../types";

export const DEFAULT_DATABASES: DatabaseResource[] = [
  {
    id: "scopus",
    name: "Scopus",
    type: "foreign",
    url: "https://www.scopus.com",
    description: "Elsevier kompaniyasining eng yirik referativ va tahliliy ma'lumotlar bazasi. Ilmiy maqolalar va sitata olish ko'rsatkichlarini nazorat qiladi."
  },
  {
    id: "web-of-science",
    name: "Web of Science",
    type: "foreign",
    url: "https://www.webofscience.com",
    description: "Clarivate Analytics tomonidan taqdim etilgan yetakchi xalqaro ilmiy iqtibos keltirish ma'lumotlar bazasi."
  },
  {
    id: "sciencedirect",
    name: "ScienceDirect",
    type: "foreign",
    url: "https://www.sciencedirect.com",
    description: "Elsevier nashriyotining to'liq tahrirdagi ilmiy, texnik va tibbiy maqolalar jamlangan platformasi."
  },
  {
    id: "springerlink",
    name: "SpringerLink",
    type: "foreign",
    url: "https://link.springer.com",
    description: "Tabiiy fanlar, texnologiya va tibbiyot sohalaridagi millionlab ilmiy maqolalar va kitoblar bazasi."
  },
  {
    id: "ieee-xplore",
    name: "IEEE Xplore",
    type: "foreign",
    url: "https://ieeexplore.ieee.org",
    description: "Elektrotexnika, elektronika va kompyuter fanlari bo'yicha dunyodagi eng nufuzli ilmiy-texnik kutubxona."
  },
  {
    id: "ziyonet",
    name: "ZiyoNET jamoat ta'lim tarmog'i",
    type: "national",
    url: "http://ziyonet.uz",
    description: "O'zbekiston milliy axborot resurslari va ta'lim portalining eng yirik ma'lumotlar tarmog'i."
  },
  {
    id: "google-scholar",
    name: "Google Scholar (Akademiya)",
    type: "foreign",
    url: "https://scholar.google.com",
    description: "Barcha ilmiy fanlar bo'yicha to'liq matnli maqolalar, dissertatsiyalar va kitoblarni bepul qidirish tizimi."
  },
  {
    id: "wiley",
    name: "Wiley Online Library",
    type: "foreign",
    url: "https://onlinelibrary.wiley.com",
    description: "Kimyo, fizika, muhandislik va ijtimoiy fanlar bo'yicha ko'p tarmoqli xalqaro ilmiy resurs."
  }
];

export const DEFAULT_BOOKS: LibraryResource[] = [
  {
    id: "book-1",
    title: "Transport logistikasi asoslari",
    author: "Prof. S. R. To'rayev",
    category: "Kitob",
    viewsCount: 142,
    description: "Ushbu darslik transport muhandisligi yo'nalishidagi talabalar va tadqiqotchilar uchun mo'ljallangan bo'lib, xalqaro logistika tizimlari va avtomobillarda tashuvlarni tashkil etish usullarini qamrab oladi.",
    language: "O'zbekcha",
    year: "2023"
  },
  {
    id: "book-2",
    title: "Qurilish materiallari va ilg'or texnologiyalar",
    author: "Dots. A. M. Nurmetov",
    category: "Kitob",
    viewsCount: 98,
    description: "Zamonaviy beton va temir-beton konstruksiyalarni loyihalash, mustahkamlovchi kimyoviy qo'shimchlar bilan ishlash bo'yicha ilmiy izlanishlar natijalari keltirilgan.",
    language: "O'zbekcha",
    year: "2024"
  },
  {
    id: "book-3",
    title: "Oliy matematika ilmiy-amaliy masalalari",
    author: "Prof. K. J. Karimov",
    category: "Kitob",
    viewsCount: 215,
    description: "Muhandislar uchun tatbiqiy matematik modellashtirish va differensial tenglamalarni yechishning raqamli usullari tahlili.",
    language: "O'zbekcha",
    year: "2022"
  },
  {
    id: "res-1",
    title: "Kimyoviy texnologiyalarda asbob-uskunalarni modellashtirish",
    author: "PhD B. H. Rustamov",
    category: "Elektron resurs",
    viewsCount: 84,
    description: "Molekulyar dinamika va kimyoviy jarayonlarni Aspen Plus va MATLAB dasturlari yordamida modellashtirish bo'yicha elektron qo'llanma va video darslik seriyasi.",
    language: "O'zbekcha / Ruscha",
    year: "2025"
  },
  {
    id: "res-2",
    title: "Kibernetika va IoT qurilmalari prinsiplari",
    author: "F. A. Xoliqov",
    category: "Elektron resurs",
    viewsCount: 189,
    description: "Arduino va Raspberry Pi platformalarida sanoat datchiklaridan ma'lumot olish, bulutli tizimlar bilan integratsiya kilish bo'yicha to'liq laboratoriya qo'llanmasi.",
    language: "Inglizcha / O'zbekcha",
    year: "2024"
  },
  {
    id: "arc-1",
    title: "JizPI ilmiy jurnali arxiv to'plami (2020-2025)",
    author: "JizPI Redaksiyasi",
    category: "Arxiv",
    viewsCount: 310,
    description: "Institutda chop etilgan ilmiy axborotnoma, konfensiya materiallari va ilmiy maqolalar to'liq elektron arxivi yillar kesimida.",
    language: "O'zbekcha / Inglizcha / Ruscha",
    year: "2025"
  }
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Scopus va Web of Science bazasidan ARM zallarida bepul foydalanish yo'lga qo'yildi",
    content: "Institutimiz axborot-resurs markazi milliy ta'lim granti doirasida xalqaro ilmiy nashrlar ma'lumotlar bazalaridan bepul to'liq foydalanish imkoniyatini taqdim etadi. Barcha xodimlar va tadqiqotchilar ARM IP-manzillaridan foydalangan holda kirishlari mumkin.",
    date: "2026-06-15",
    author: "ARM Rahbariyati"
  },
  {
    id: "ann-2",
    title: "Kutubxonamiz uchun yangi elektron ilmiy adabiyotlar to'plami keltirildi",
    content: "Kimyo texnologiyasi, Transport logistikasi va Kompyuter ilmlari yo'nalishlarida so'nggi 2024-2025 yillarda chop etilgan 120 tadan ortiq xorijiy darsliklarning elektron nusxalari ARM serverlariga yuklandi. Ularni kutubxona zalidagi terminallar va shaxsiy kabinet orqali yuklab olishingiz mumkin.",
    date: "2026-06-20",
    author: "Elektron resurslar bo'limi"
  }
];

export const DEFAULT_SARXISOB_RECORDS: SarxisobRecord[] = [
  {
    id: "sar_1",
    teacherName: "Umar Abdullayev",
    email: "umarabdullayev338@gmail.com",
    faculty: "Energetika",
    department: "Muqobil energiya manbalari",
    bosmaKitob: 2,
    mualliflikPdf: 3,
    ruxsatliElKitob: 2,
    darslikVideo: 1,
    armTashrif: 4,
    armHamkorlik: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "sar_2",
    teacherName: "Prof. Sardor Ahmedov",
    email: "s.ahmedov@jizpi.uz",
    faculty: "Avtotransport",
    department: "Transport logistikasi",
    bosmaKitob: 1,
    mualliflikPdf: 1,
    ruxsatliElKitob: 2,
    darslikVideo: 2,
    armTashrif: 6,
    armHamkorlik: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "sar_3",
    teacherName: "Dr. Dilnoza Olimova",
    email: "d.olimova@jizpi.uz",
    faculty: "Qurilish",
    department: "Bino va inshootlar loyihalash",
    bosmaKitob: 0,
    mualliflikPdf: 2,
    ruxsatliElKitob: 5,
    darslikVideo: 3,
    armTashrif: 12,
    armHamkorlik: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "sar_4",
    teacherName: "Rustam Turdiyev",
    email: "r.turdiyev@jizpi.uz",
    faculty: "Kimyoviy texnologiya",
    department: "Noorganik moddalar texnologiyasi",
    bosmaKitob: 3,
    mualliflikPdf: 0,
    ruxsatliElKitob: 2,
    darslikVideo: 1,
    armTashrif: 3,
    armHamkorlik: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: "sar_5",
    teacherName: "Zilola To'rayeva",
    email: "z.torayeva@jizpi.uz",
    faculty: "Sanoat texnologiyalari",
    department: "Yengil sanoat mahsulotlari",
    bosmaKitob: 1,
    mualliflikPdf: 0,
    ruxsatliElKitob: 3,
    darslikVideo: 4,
    armTashrif: 8,
    armHamkorlik: 3,
    createdAt: new Date().toISOString()
  }
];

