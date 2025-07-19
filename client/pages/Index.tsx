import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ChapterCard from "@/components/ChapterCard";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Flame,
  TrendingUp,
  Clock,
  Star,
  Plus,
  BookOpen,
  FileText,
} from "lucide-react";
import { useAuth, rolePermissions } from "@/context/AuthContext";
import AddMangaDialog from "@/components/admin/AddMangaDialog";
import AddChapterDialog from "@/components/admin/AddChapterDialog";
import {
  getLatestChapters,
  getPopularManga,
  getTopRatedManga,
  initializeMangaStorage,
  cleanTestData,
  type Manga,
} from "@/lib/mangaData";

export default function Index() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<
    "latest" | "popular" | "trending" | "rated"
  >("latest");
  const [isAddMangaOpen, setIsAddMangaOpen] = useState(false);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);

  const [latestChapters, setLatestChapters] = useState<any[]>([]);
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [topRatedManga, setTopRatedManga] = useState<Manga[]>([]);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);

  const { user } = useAuth();
  const isAdmin = user && (rolePermissions[user.role]?.canAdmin || false);

  const totalPages = Math.ceil(latestChapters.length / 36);

  useEffect(() => {
    initializeMangaStorage();

    // Clean test data on first load
    if (!hasDataLoaded) {
      cleanTestData();
      setHasDataLoaded(true);
    }

    loadData();
  }, [hasDataLoaded]);

  const loadData = () => {
    // Load latest chapters
    const chapters = getLatestChapters(36 * 10); // Load enough for multiple pages
    setLatestChapters(
      chapters.map((chapterWithManga) => ({
        id: chapterWithManga.id,
        title: chapterWithManga.title,
        chapterNumber: chapterWithManga.number.toString(),
        mangaTitle: chapterWithManga.manga.title,
        coverImage:
          chapterWithManga.manga.coverUrl ||
          `https://picsum.photos/300/400?random=${chapterWithManga.id}`,
        timeAgo: calculateTimeAgo(chapterWithManga.createdAt),
        views: Math.floor(Math.random() * 10000) + 1000, // Mock views for chapters
        rating: chapterWithManga.manga.rating,
        isNew: isNewChapter(chapterWithManga.createdAt),
      })),
    );

    // Load popular manga
    setPopularManga(getPopularManga(12));

    // Load top rated manga
    setTopRatedManga(getTopRatedManga(12));
  };

  const calculateTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `منذ ${diffInDays} يوم`;
    } else if (diffInHours > 0) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      return "منذ قليل";
    }
  };

  const isNewChapter = (dateString: string): boolean => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );
    return diffInHours <= 24; // Consider new if within 24 hours
  };

  const handleDialogSuccess = () => {
    loadData(); // Reload data when new manga/chapter is added
  };

  const currentChapters = latestChapters.slice(
    (currentPage - 1) * 36,
    currentPage * 36,
  );

  const filters = [
    { key: "latest", label: "أحدث الفصول", icon: Clock },
    { key: "popular", label: "الأكثر شعبية", icon: TrendingUp },
    { key: "trending", label: "الأكثر رواجاً", icon: Flame },
    { key: "rated", label: "أعلى تقييماً", icon: Star },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            مرحباً بك في موقع مانجافاس
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            استمتع بقراءة أحدث فصول المانجا والمانهوا والمانها مع تجربة قراءة
            مميزة وواجهة باللغة العربية
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-lg p-1">
            {filters.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(key as any)}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content based on filter */}
        {filter === "latest" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              أحدث الفصول
            </h2>

            {currentChapters.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  لا توجد فصول متوفرة حالياً
                </div>
                <p className="text-sm text-muted-foreground">
                  {isAdmin
                    ? "استخدم الأزرار السريعة لإضافة مانجا وفصول جديدة"
                    : "سيتم إضافة المحتوى قريباً"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                  {currentChapters.map((chapter) => (
                    <ChapterCard key={chapter.id} chapter={chapter} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        )}

        {filter === "popular" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              الأكثر شعبية
            </h2>

            {popularManga.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  لا توجد مانجا شائعة متوفرة حالياً
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {popularManga.map((manga) => (
                  <div
                    key={manga.id}
                    className="bg-card rounded-lg overflow-hidden border border-border"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={
                          manga.coverUrl ||
                          `https://picsum.photos/300/400?random=${manga.id}`
                        }
                        alt={manga.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">
                        {manga.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {manga.views.toLocaleString()} قراءة
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {filter === "trending" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              الأكثر رواجاً
            </h2>

            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-4">
                ستتوفر هذه الميزة قريباً
              </div>
            </div>
          </div>
        )}

        {filter === "rated" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              أعلى تقييماً
            </h2>

            {topRatedManga.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  لا توجد مانجا مقيمة متوفرة حالياً
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {topRatedManga.map((manga) => (
                  <div
                    key={manga.id}
                    className="bg-card rounded-lg overflow-hidden border border-border"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={
                          manga.coverUrl ||
                          `https://picsum.photos/300/400?random=${manga.id}`
                        }
                        alt={manga.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">
                        {manga.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-foreground">
                          {manga.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Floating Action Buttons for Admin */}
        {isAdmin && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 bg-secondary hover:bg-secondary/90 shadow-lg flex items-center justify-center"
                  title="إضافة فصل"
                >
                  <FileText className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <AddChapterDialog
                isOpen={isAddChapterOpen}
                onClose={() => setIsAddChapterOpen(false)}
                onSuccess={handleDialogSuccess}
              />
            </Dialog>

            <Dialog open={isAddMangaOpen} onOpenChange={setIsAddMangaOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center"
                  title="إضافة مانجا"
                >
                  <BookOpen className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <AddMangaDialog
                isOpen={isAddMangaOpen}
                onClose={() => setIsAddMangaOpen(false)}
                onSuccess={handleDialogSuccess}
              />
            </Dialog>
          </div>
        )}
      </div>
    </Layout>
  );
}
