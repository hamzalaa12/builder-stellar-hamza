import { useState } from "react";
import Layout from "@/components/Layout";
import MangaCard from "@/components/MangaCard";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";

interface MangaListProps {
  type: "manga" | "manhwa" | "manhua";
}

// Mock data for manga
const generateMockManga = (
  page: number,
  type: "manga" | "manhwa" | "manhua",
) => {
  const manga = [];
  const start = (page - 1) * 36;

  const genres = [
    "أكشن",
    "مغامرة",
    "كوميديا",
    "دراما",
    "فانتازيا",
    "رعب",
    "غموض",
    "رومانس��",
    "خيال علمي",
    "رياضة",
    "إثارة",
    "حرب",
  ];

  for (let i = start; i < start + 36; i++) {
    manga.push({
      id: `${type}-${i}`,
      title: `${type === "manga" ? "مانجا" : type === "manhwa" ? "مانهوا" : "مانها"} رقم ${i + 1}`,
      coverImage: `https://picsum.photos/300/400?random=${i + 1000}`,
      rating: +(Math.random() * 3 + 2).toFixed(1),
      chaptersCount: Math.floor(Math.random() * 200) + 10,
      status: ["ongoing", "completed", "hiatus"][
        Math.floor(Math.random() * 3)
      ] as any,
      lastUpdate: `منذ ${Math.floor(Math.random() * 30)} يوم`,
      genres: genres.slice(0, Math.floor(Math.random() * 4) + 2),
      type,
    });
  }

  return manga;
};

export default function MangaList({ type }: MangaListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const totalPages = 15; // Mock total pages

  const manga = generateMockManga(currentPage, type);

  const typeLabels = {
    manga: "المانجا",
    manhwa: "الما��هوا",
    manhua: "المانها",
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-2">{typeLabels[type]}</h1>
          <p className="text-muted-foreground">
            استكشف مجموعة واسعة من {typeLabels[type]} المتنوعة
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في المانجا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {(currentPage - 1) * 36 + 1}-{Math.min(currentPage * 36, 540)}{" "}
            من أصل 540 نتيجة
          </p>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {search && `البحث: "${search}"`}
              {statusFilter !== "all" &&
                ` | الحالة: ${statusOptions.find((o) => o.value === statusFilter)?.label}`}
            </span>
          </div>
        </div>

        {/* Manga Grid - 6x6 = 36 items */}
        <div
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              : "grid-cols-1"
          }`}
        >
          {manga.map((item) => (
            <MangaCard key={item.id} {...item} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
}
