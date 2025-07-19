import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import MangaCard from "@/components/MangaCard";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid, List, Star } from "lucide-react";
import {
  getMangaByType,
  searchManga,
  getMangaByGenre,
  MANGA_CATEGORIES,
  initializeMangaStorage,
  type Manga,
} from "@/lib/mangaData";

interface MangaListProps {
  type: "manga" | "manhwa" | "manhua";
}

export default function MangaList({ type }: MangaListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [allManga, setAllManga] = useState<Manga[]>([]);
  const [filteredManga, setFilteredManga] = useState<Manga[]>([]);

  const itemsPerPage = 36;

  useEffect(() => {
    initializeMangaStorage();
    loadMangaData();
  }, [type]);

  useEffect(() => {
    filterAndSortManga();
  }, [allManga, search, sortBy, statusFilter, categoryFilter]);

  const loadMangaData = () => {
    const mangaData = getMangaByType(type);
    setAllManga(mangaData);
  };

  const filterAndSortManga = () => {
    let filtered = [...allManga];

    // Apply search filter
    if (search.trim()) {
      filtered = searchManga(search).filter((manga) => manga.type === type);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((manga) => manga.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((manga) =>
        manga.genres.includes(categoryFilter),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "latest":
        filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
      case "popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title, "ar"));
        break;
      case "chapters":
        filtered.sort((a, b) => b.chaptersCount - a.chaptersCount);
        break;
      default:
        break;
    }

    setFilteredManga(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const typeLabels = {
    manga: "مانجا يابانية",
    manhwa: "مانهوا كورية",
    manhua: "مانها صينية",
  };

  const sortOptions = [
    { value: "latest", label: "الأحدث" },
    { value: "popular", label: "الأكثر شعبية" },
    { value: "rating", label: "الأعلى تقييماً" },
    { value: "title", label: "حسب العنوان" },
    { value: "chapters", label: "عدد الفصول" },
  ];

  const statusOptions = [
    { value: "all", label: "جميع الحالات" },
    { value: "ongoing", label: "مستمر" },
    { value: "completed", label: "مكتمل" },
    { value: "hiatus", label: "متوقف" },
  ];

  const categoryOptions = [
    { value: "all", label: "جميع التصنيفات" },
    ...MANGA_CATEGORIES.slice(0, 20).map((category) => ({
      value: category,
      label: category,
    })),
  ];

  // Pagination
  const totalPages = Math.ceil(filteredManga.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentManga = filteredManga.slice(startIndex, endIndex);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {typeLabels[type]}
          </h1>
          <p className="text-muted-foreground">
            عدد {filteredManga.length} {type}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="ابحث في المانجا والفصول الأخيرة..."
              value={search}
              onChange={handleSearch}
              className="w-full h-10 pr-10 pl-3 bg-card border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px]">
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Manga List */}
        {currentManga.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "لا توجد نتائج مطابقة للبحث"
                : `لا توجد ${typeLabels[type]} متوفرة حالياً`}
            </div>
            {search && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
              >
                مسح المرشحات
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Single Column List View */}
            <div className="space-y-4">
              {currentManga.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:bg-card/80 transition-colors"
                >
                  <Link to={`/manga/${item.id}`} className="flex-shrink-0">
                    <div className="w-24 h-32 rounded-lg overflow-hidden">
                      <img
                        src={
                          item.coverUrl ||
                          `https://picsum.photos/300/400?random=${item.id}`
                        }
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="flex-1">
                    <Link to={`/manga/${item.id}`}>
                      <h3 className="text-lg font-bold text-foreground mb-2 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-foreground">
                          {item.rating || 0}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        قراءة {item.views.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.genres.slice(0, 3).map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="text-xs"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>المؤلف: {item.author || "غير محدد"}</span>
                      <span>سنة الإصدار: {item.year}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>عدد الفصول: {item.chaptersCount}</span>
                      <span>{item.lastUpdate}</span>
                      <Badge
                        className={`text-xs ${
                          item.status === "completed"
                            ? "bg-blue-500"
                            : item.status === "ongoing"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                        }`}
                      >
                        {item.status === "completed"
                          ? "مكتمل"
                          : item.status === "ongoing"
                            ? "مستمر"
                            : "متوقف"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
