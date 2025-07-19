import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  ArrowRight,
  Eye,
  Calendar,
  Book,
  Heart,
  HeartOff,
  Play,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getMangaById,
  getChaptersByMangaId,
  type Manga,
  type Chapter,
} from "@/lib/mangaData";
import {
  isMangaFavorited,
  addToFavorites,
  removeFromFavorites,
  getReadingHistory,
  addReadingHistoryEntry,
  initializeUserData,
} from "@/lib/userData";

export default function MangaDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [lastReadChapter, setLastReadChapter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMangaDetails();
    }
  }, [id]);

  useEffect(() => {
    if (user && manga) {
      initializeUserData(user.id);
      checkFavoriteStatus();
      findLastReadChapter();
    }
  }, [user, manga]);

  const loadMangaDetails = () => {
    if (!id) return;

    const mangaData = getMangaById(id);
    if (mangaData) {
      setManga(mangaData);
      const mangaChapters = getChaptersByMangaId(id);
      setChapters(mangaChapters);
    }
    setLoading(false);
  };

  const checkFavoriteStatus = () => {
    if (user && manga) {
      setIsFavorited(isMangaFavorited(user.id, manga.id));
    }
  };

  const findLastReadChapter = () => {
    if (user && manga) {
      const history = getReadingHistory(user.id);
      const mangaHistory = history.filter(
        (entry) => entry.mangaId === manga.id,
      );
      if (mangaHistory.length > 0) {
        setLastReadChapter(mangaHistory[0].chapterNumber);
      }
    }
  };

  const handleFavoriteToggle = () => {
    if (!user || !manga) return;

    if (isFavorited) {
      if (removeFromFavorites(user.id, manga.id)) {
        setIsFavorited(false);
      }
    } else {
      if (addToFavorites(user.id, manga.id)) {
        setIsFavorited(true);
      }
    }
  };

  const handleReadChapter = (chapterId: string, chapterNumber: number) => {
    if (user && manga) {
      addReadingHistoryEntry(user.id, manga.id, chapterId, chapterNumber);
      setLastReadChapter(chapterNumber);
    }
  };

  const getNextChapter = () => {
    if (!lastReadChapter) return chapters[0];
    return chapters.find((ch) => ch.number > lastReadChapter) || null;
  };

  const statusColors = {
    ongoing: "bg-green-500",
    completed: "bg-blue-500",
    hiatus: "bg-yellow-500",
  };

  const statusLabels = {
    ongoing: "مستمر",
    completed: "مكتمل",
    hiatus: "متوقف",
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">جارٍ التحميل...</div>
        </div>
      </Layout>
    );
  }

  if (!manga) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">المانجا غير موجودة</h1>
            <Button asChild>
              <Link to="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const nextChapter = getNextChapter();

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            الرئيسية
          </Link>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Link
            to={`/${manga.type}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {manga.type === "manga"
              ? "مانجا"
              : manga.type === "manhwa"
                ? "مانهوا"
                : "مانها"}
          </Link>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{manga.title}</span>
        </div>

        {/* Manga Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover and Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-[3/4] mb-6">
                    <img
                      src={
                        manga.coverUrl ||
                        `https://picsum.photos/300/400?random=${manga.id}`
                      }
                      alt={manga.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {nextChapter ? (
                      <Button
                        className="w-full"
                        onClick={() =>
                          handleReadChapter(nextChapter.id, nextChapter.number)
                        }
                      >
                        <Play className="h-4 w-4 ml-2" />
                        {lastReadChapter
                          ? `متابعة الفصل ${nextChapter.number}`
                          : "ابدأ القراءة"}
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        لا توجد فصول متوفرة
                      </Button>
                    )}

                    {user && (
                      <Button
                        variant={isFavorited ? "destructive" : "outline"}
                        onClick={handleFavoriteToggle}
                        className="w-full"
                      >
                        {isFavorited ? (
                          <>
                            <HeartOff className="h-4 w-4 ml-2" />
                            إزالة من المفضلة
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4 ml-2" />
                            إضافة للمفضلة
                          </>
                        )}
                      </Button>
                    )}

                    {lastReadChapter && (
                      <div className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4" />
                        ��خر قراءة: الفصل {lastReadChapter}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {manga.rating}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        تقييم
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {manga.views.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        قراءة
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {chapters.length}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Book className="h-4 w-4" />
                        فصل
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {manga.year}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Calendar className="h-4 w-4" />
                        إصدار
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Details and Chapters */}
          <div className="lg:col-span-2">
            {/* Title and Meta */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {manga.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  className={`${statusColors[manga.status]} text-white`}
                  variant="secondary"
                >
                  {statusLabels[manga.status]}
                </Badge>
                <Badge variant="outline">
                  {manga.type === "manga"
                    ? "مانجا يابانية"
                    : manga.type === "manhwa"
                      ? "مانهوا كورية"
                      : "مانها صينية"}
                </Badge>
              </div>

              <div className="text-muted-foreground mb-4">
                <p>
                  <strong>المؤلف:</strong> {manga.author || "غير محدد"}
                </p>
                <p>
                  <strong>الرسام:</strong> {manga.artist || "غير محدد"}
                </p>
                <p>
                  <strong>آخر تحديث:</strong> {manga.lastUpdate}
                </p>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {manga.genres.map((genre) => (
                  <Link
                    key={genre}
                    to={`/${manga.type}?category=${encodeURIComponent(genre)}`}
                  >
                    <Badge
                      variant="secondary"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      {genre}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Description */}
            {manga.description && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">القصة</h2>
                  <p className="text-foreground leading-relaxed">
                    {manga.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Chapters List */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  قائمة الفصول ({chapters.length})
                </h2>

                {chapters.length === 0 ? (
                  <div className="text-center py-8">
                    <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      لا توجد فصول متوفرة حالياً
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className={`flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors ${
                          lastReadChapter === chapter.number
                            ? "bg-primary/10 border-primary/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-medium">
                            الفصل {chapter.number}
                          </div>
                          <div className="text-muted-foreground">
                            {chapter.title}
                          </div>
                          {lastReadChapter === chapter.number && (
                            <Badge variant="secondary" className="text-xs">
                              آخر قراءة
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            {new Date(chapter.publishedAt).toLocaleDateString(
                              "ar",
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleReadChapter(chapter.id, chapter.number)
                            }
                          >
                            قراءة
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
