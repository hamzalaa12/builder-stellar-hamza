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
    "رومانسي",
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const totalPages = 15; // Mock total pages

  const manga = generateMockManga(currentPage, type);

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
    { value: "action", label: "أكشن" },
    { value: "adventure", label: "مغامرة" },
    { value: "comedy", label: "كوميديا" },
    { value: "drama", label: "دراما" },
    { value: "fantasy", label: "فانتازيا" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {typeLabels[type]}
          </h1>
          <p className="text-muted-foreground">عدد 1 مانجا</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="ابحث في المانجا والفصول الأخيرة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Manga List - Single Column */}
        <div className="space-y-4">
          {manga.slice(0, 1).map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:bg-card/80 transition-colors"
            >
              <Link to={`/manga/${item.id}`} className="flex-shrink-0">
                <div className="w-24 h-32 rounded-lg overflow-hidden">
                  <img
                    src={item.coverImage}
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
                      {item.rating}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    قراءة {item.views.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {item.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  سنة الإصدار 2005
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>عدد الفصول {item.chaptersCount}</span>
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
      </div>
    </Layout>
  );
}
