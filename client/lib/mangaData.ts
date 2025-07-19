// Comprehensive manga data management system with real storage

export interface Manga {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  author: string;
  artist: string;
  year: number;
  status: "ongoing" | "completed" | "hiatus";
  type: "manga" | "manhwa" | "manhua";
  genres: string[];
  rating: number;
  chaptersCount: number;
  views: number;
  lastUpdate: string;
  createdBy: string; // User ID who added this manga
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  mangaId: string;
  title: string;
  number: number;
  pages: string[];
  publishedAt: string;
  createdBy: string;
  createdAt: string;
}

// Comprehensive list of 100+ manga categories in Arabic
export const MANGA_CATEGORIES = [
  // Action & Adventure
  "أكشن",
  "مغامرة",
  "قتال",
  "فنون قتالية",
  "ساموراي",
  "نينجا",
  "حروب",
  "معارك",
  "مبارزة",
  "قراصنة",
  "مرتزقة",
  "محاربين",
  "أبطال",
  "مقاتلين",

  // Romance & Relationships
  "رومانسي",
  "حب",
  "علاقات",
  "زواج",
  "خطوبة",
  "حب المراهقين",
  "حب الكبار",
  "مثلث حب",
  "حب مستحيل",
  "حب أول",
  "لقاء مصادفة",
  "حب من أول نظرة",

  // Comedy & Slice of Life
  "كوميديا",
  "فكاهة",
  "ساخر",
  "حياة يومية",
  "شريحة من الحياة",
  "مدرسة",
  "عمل",
  "عائلة",
  "أصدقاء",
  "جامعة",
  "حياة عادية",
  "مواقف طريفة",

  // Fantasy & Supernatural
  "فانتازيا",
  "خيال",
  "سحر",
  "سحرة",
  "تنانين",
  "وحوش",
  "كائنات أسطورية",
  "عوالم أخرى",
  "قوى خارقة",
  "عالم سفلي",
  "ملائكة",
  "شياطين",
  "آلهة",

  // Horror & Mystery
  "رعب",
  "غموض",
  "إثارة",
  "تشويق",
  "جرائم",
  "قتل",
  "تحقيق",
  "بوليسي",
  "ألغاز",
  "خوارق",
  "أشباح",
  "مصاصي دماء",
  "زومبي",
  "وحوش مرعبة",

  // Science Fiction & Technology
  "خيال علمي",
  "تقنية",
  "مستقبل",
  "روبوتات",
  "ذكاء اصطناعي",
  "فضاء",
  "كواكب أخرى",
  "سفر عبر الزمن",
  "تجارب علمية",
  "تطور تقني",

  // Sports & Games
  "رياضة",
  "كرة قدم",
  "كرة سلة",
  "بيسبول",
  "تنس",
  "جولف",
  "سباحة",
  "ألعاب",
  "ألعاب فيديو",
  "شطرنج",
  "مسابقات",
  "بطولات",

  // Drama & Psychological
  "دراما",
  "نفسي",
  "اجتماعي",
  "صراع داخلي",
  "اكتئاب",
  "قلق",
  "صدمة",
  "ذكريات",
  "ماضي أليم",
  "تعافي",
  "نمو شخصي",
  "تطوير الذات",

  // Historical & Cultural
  "تاريخي",
  "تراث",
  "ثقافة",
  "حضارة",
  "ملوك",
  "إمبراطوريات",
  "حروب تاريخية",
  "عصور وسطى",
  "عصر حديث",
  "تقاليد",
  "عادات",
  "فولكلور",

  // Music & Arts
  "موسيقى",
  "غناء",
  "فرقة موسيقية",
  "آلات موسيقية",
  "رقص",
  "فن",
  "رسم",
  "نحت",
  "تمثيل",
  "مسرح",
  "سينما",
  "إبداع",

  // Food & Cooking
  "طبخ",
  "طعام",
  "مطاعم",
  "شيف",
  "وصفات",
  "مسابقات طبخ",
  "ثقافة طعام",
  "حلويات",
  "مخابز",
  "مقاهي",
  "تذوق طعام",

  // Work & Career
  "مهن",
  "وظائف",
  "أعمال",
  "شركات",
  "ريادة أعمال",
  "نجاح مهني",
  "تحديات عمل",
  "فريق عمل",
  "إدارة",
  "قيادة",

  // Adventure & Travel
  "سفر",
  "استكشاف",
  "مغامرات",
  "رحلات",
  "طبيعة",
  "جبال",
  "بحار",
  "غابات",
  "صحراء",
  "كنوز",
  "آثار",
  "اكتشافات",

  // Medical & Healthcare
  "طب",
  "أطباء",
  "مستشفيات",
  "علاج",
  "أمراض",
  "جراحة",
  "طوارئ",
  "علم نفس",
  "طب نفسي",
  "إنقاذ حياة",

  // Military & Police
  "عسكري",
  "جيش",
  "شرطة",
  "أمن",
  "تحقيقات",
  "عمليات خاصة",
  "دفاع",
  "حماية",
  "عدالة",
  "قانون",
];

// Storage keys
const MANGA_STORAGE_KEY = "mangafas_manga";
const CHAPTERS_STORAGE_KEY = "mangafas_chapters";

// Initialize empty storage if not exists
export const initializeMangaStorage = () => {
  if (!localStorage.getItem(MANGA_STORAGE_KEY)) {
    localStorage.setItem(MANGA_STORAGE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CHAPTERS_STORAGE_KEY)) {
    localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Manga CRUD operations
export const getAllManga = (): Manga[] => {
  const mangaStr = localStorage.getItem(MANGA_STORAGE_KEY);
  return mangaStr ? JSON.parse(mangaStr) : [];
};

export const getMangaById = (id: string): Manga | null => {
  const allManga = getAllManga();
  return allManga.find((manga) => manga.id === id) || null;
};

export const getMangaByType = (
  type: "manga" | "manhwa" | "manhua",
): Manga[] => {
  const allManga = getAllManga();
  return allManga.filter((manga) => manga.type === type);
};

export const getMangaByGenre = (genre: string): Manga[] => {
  const allManga = getAllManga();
  return allManga.filter((manga) => manga.genres.includes(genre));
};

export const searchManga = (query: string): Manga[] => {
  const allManga = getAllManga();
  const searchLower = query.toLowerCase();
  return allManga.filter(
    (manga) =>
      manga.title.toLowerCase().includes(searchLower) ||
      manga.author.toLowerCase().includes(searchLower) ||
      manga.genres.some((genre) => genre.toLowerCase().includes(searchLower)),
  );
};

export const addManga = (
  mangaData: Omit<
    Manga,
    "id" | "createdAt" | "updatedAt" | "views" | "chaptersCount"
  >,
): Manga => {
  const allManga = getAllManga();

  const newManga: Manga = {
    ...mangaData,
    id: "manga-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    views: 0,
    chaptersCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allManga.push(newManga);
  localStorage.setItem(MANGA_STORAGE_KEY, JSON.stringify(allManga));

  return newManga;
};

export const updateManga = (
  id: string,
  updates: Partial<Manga>,
): Manga | null => {
  const allManga = getAllManga();
  const index = allManga.findIndex((manga) => manga.id === id);

  if (index === -1) return null;

  allManga[index] = {
    ...allManga[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(MANGA_STORAGE_KEY, JSON.stringify(allManga));
  return allManga[index];
};

export const deleteManga = (id: string): boolean => {
  const allManga = getAllManga();
  const filteredManga = allManga.filter((manga) => manga.id !== id);

  if (filteredManga.length === allManga.length) return false;

  localStorage.setItem(MANGA_STORAGE_KEY, JSON.stringify(filteredManga));

  // Also delete associated chapters
  const allChapters = getAllChapters();
  const filteredChapters = allChapters.filter(
    (chapter) => chapter.mangaId !== id,
  );
  localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify(filteredChapters));

  return true;
};

// Chapter CRUD operations
export const getAllChapters = (): Chapter[] => {
  const chaptersStr = localStorage.getItem(CHAPTERS_STORAGE_KEY);
  return chaptersStr ? JSON.parse(chaptersStr) : [];
};

export const getChaptersByMangaId = (mangaId: string): Chapter[] => {
  const allChapters = getAllChapters();
  return allChapters
    .filter((chapter) => chapter.mangaId === mangaId)
    .sort((a, b) => a.number - b.number);
};

export const addChapter = (
  chapterData: Omit<Chapter, "id" | "createdAt">,
): Chapter => {
  const allChapters = getAllChapters();

  const newChapter: Chapter = {
    ...chapterData,
    id: "chapter-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };

  allChapters.push(newChapter);
  localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify(allChapters));

  // Update manga chapters count
  const manga = getMangaById(chapterData.mangaId);
  if (manga) {
    updateManga(manga.id, {
      chaptersCount: getChaptersByMangaId(manga.id).length + 1,
      lastUpdate: `منذ ${Math.floor((Date.now() - new Date(newChapter.createdAt).getTime()) / (1000 * 60 * 60 * 24))} يوم`,
    });
  }

  return newChapter;
};

// Get latest chapters for homepage
export const getLatestChapters = (
  limit: number = 36,
): (Chapter & { manga: Manga })[] => {
  const allChapters = getAllChapters();
  const allManga = getAllManga();

  const chaptersWithManga = allChapters
    .map((chapter) => {
      const manga = allManga.find((m) => m.id === chapter.mangaId);
      return manga ? { ...chapter, manga } : null;
    })
    .filter(Boolean) as (Chapter & { manga: Manga })[];

  return chaptersWithManga
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
};

// Utility functions
export const getPopularManga = (limit: number = 10): Manga[] => {
  const allManga = getAllManga();
  return allManga.sort((a, b) => b.views - a.views).slice(0, limit);
};

export const getTopRatedManga = (limit: number = 10): Manga[] => {
  const allManga = getAllManga();
  return allManga.sort((a, b) => b.rating - a.rating).slice(0, limit);
};

// Category search function
export const searchCategories = (query: string): string[] => {
  if (!query.trim()) return MANGA_CATEGORIES.slice(0, 20);

  const searchLower = query.toLowerCase();
  return MANGA_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(searchLower),
  ).slice(0, 20);
};

// Clean up test data - remove all mock/test manga
export const cleanTestData = () => {
  // Clear all existing manga and chapters
  localStorage.setItem(MANGA_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify([]));

  console.log(
    "تم حذف جميع البيانات التجريبية. الآن الموقع يحتوي على البيانات الحقيقية فقط.",
  );
};
