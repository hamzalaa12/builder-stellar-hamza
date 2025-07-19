import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Star, Clock, BookOpen, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import {
  getFavorites,
  removeFromFavorites,
  initializeUserData,
  type FavoriteManga,
} from "@/lib/userData";
import { getAllManga, type Manga } from "@/lib/mangaData";

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<
    (FavoriteManga & { manga: Manga })[]
  >([]);
  const [sortBy, setSortBy] = useState("latest");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    if (user) {
      initializeUserData(user.id);
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = () => {
    if (!user) return;

    const userFavorites = getFavorites(user.id);
    const allManga = getAllManga();

    const favoritesWithManga = userFavorites
      .map((fav) => {
        const manga = allManga.find((m) => m.id === fav.mangaId);
        return manga ? { ...fav, manga } : null;
      })
      .filter(Boolean) as (FavoriteManga & { manga: Manga })[];

    // Apply sorting
    let sorted = [...favoritesWithManga];
    switch (sortBy) {
      case "latest":
        sorted.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        );
        break;
      case "title":
        sorted.sort((a, b) => a.manga.title.localeCompare(b.manga.title, "ar"));
        break;
      case "rating":
        sorted.sort((a, b) => b.manga.rating - a.manga.rating);
        break;
      case "chapters":
        sorted.sort((a, b) => b.manga.chaptersCount - a.manga.chaptersCount);
        break;
      case "lastRead":
        sorted.sort((a, b) => {
          const aTime = a.lastRead ? new Date(a.lastRead).getTime() : 0;
          const bTime = b.lastRead ? new Date(b.lastRead).getTime() : 0;
          return bTime - aTime;
        });
        break;
    }

    // Apply filtering
    if (filterBy !== "all") {
      sorted = sorted.filter((fav) => fav.manga.type === filterBy);
    }

    setFavorites(sorted);
  };

  useEffect(() => {
    loadFavorites();
  }, [sortBy, filterBy, user]);

  const handleRemoveFavorite = (mangaId: string) => {
    if (!user) return;

    if (removeFromFavorites(user.id, mangaId)) {
      loadFavorites();
    }
  };

  const sortOptions = [
    { value: "latest", label: "الأحدث إضافة" },
    { value: "lastRead", label: "آخر قراءة" },
    { value: "title", label: "حسب العنوان" },
    { value: "rating", label: "أعلى تقييماً" },
    { value: "chapters", label: "عدد الفصول" },
  ];

  const filterOptions = [
    { value: "all", label: "جميع الأنواع" },
    { value: "manga", label: "مانجا يابانية" },
    { value: "manhwa", label: "مانهوا كورية" },
    { value: "manhua", label: "مانها صينية" },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "manga":
        return "مانجا";
      case "manhwa":
        return "مانهوا";
      case "manhua":
        return "مانها";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ongoing":
        return "مستمر";
      case "completed":
        return "مكتمل";
      case "hiatus":
        return "متوقف";
      default:
        return status;
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              المفضلة
            </h1>
            <p className="text-muted-foreground">
              عدد {favorites.length} مانجا في المفضلة
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    لا توجد مانجا في المفضلة
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {filterBy !== "all"
                      ? `لا توجد ${filterOptions.find((f) => f.value === filterBy)?.label} في المفضلة`
                      : "ابدأ بإضافة المانجا التي تحبها للمفضلة"}
                  </p>
                  <Button asChild>
                    <Link to="/">استكشف المانجا</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <Card key={favorite.mangaId} className="overflow-hidden">
                  <div className="flex">
                    <Link to={`/manga/${favorite.mangaId}`} className="block">
                      <div className="w-24 h-32 flex-shrink-0">
                        <img
                          src={
                            favorite.manga.coverUrl ||
                            `https://picsum.photos/300/400?random=${favorite.mangaId}`
                          }
                          alt={favorite.manga.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/manga/${favorite.mangaId}`}>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                            {favorite.manga.title}
                          </h3>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFavorite(favorite.mangaId)}
                          className="text-muted-foreground hover:text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {favorite.manga.author}
                      </p>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">
                            {favorite.manga.rating}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(favorite.manga.type)}
                        </Badge>
                        <Badge
                          variant={
                            favorite.manga.status === "completed"
                              ? "default"
                              : favorite.manga.status === "ongoing"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {getStatusLabel(favorite.manga.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {favorite.manga.chaptersCount} فصل
                        </span>
                        <span>
                          {favorite.manga.views.toLocaleString()} قراءة
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Heart className="h-3 w-3" />
                          أضيف في{" "}
                          {new Date(favorite.addedAt).toLocaleDateString("ar")}
                        </div>
                        {favorite.lastRead && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            آخر قراءة{" "}
                            {new Date(favorite.lastRead).toLocaleDateString(
                              "ar",
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <Button asChild size="sm" className="w-full">
                          <Link to={`/manga/${favorite.mangaId}`}>
                            متابعة القراءة
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
