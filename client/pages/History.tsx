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
import { Input } from "@/components/ui/input";
import {
  History as HistoryIcon,
  Clock,
  BookOpen,
  Search,
  Calendar,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import {
  getReadingHistory,
  initializeUserData,
  type ReadingHistoryEntry,
} from "@/lib/userData";
import { getAllManga, type Manga } from "@/lib/mangaData";

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<
    (ReadingHistoryEntry & { manga: Manga })[]
  >([]);
  const [filteredHistory, setFilteredHistory] = useState<
    (ReadingHistoryEntry & { manga: Manga })[]
  >([]);
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    if (user) {
      initializeUserData(user.id);
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortHistory();
  }, [history, search, filterBy, sortBy]);

  const loadHistory = () => {
    if (!user) return;

    const userHistory = getReadingHistory(user.id);
    const allManga = getAllManga();

    const historyWithManga = userHistory
      .map((entry) => {
        const manga = allManga.find((m) => m.id === entry.mangaId);
        return manga ? { ...entry, manga } : null;
      })
      .filter(Boolean) as (ReadingHistoryEntry & { manga: Manga })[];

    setHistory(historyWithManga);
  };

  const filterAndSortHistory = () => {
    let filtered = [...history];

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter((entry) =>
        entry.manga.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Apply type filter
    if (filterBy !== "all") {
      filtered = filtered.filter((entry) => entry.manga.type === filterBy);
    }

    // Apply sorting
    switch (sortBy) {
      case "latest":
        filtered.sort(
          (a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime(),
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.readAt).getTime() - new Date(b.readAt).getTime(),
        );
        break;
      case "title":
        filtered.sort((a, b) =>
          a.manga.title.localeCompare(b.manga.title, "ar"),
        );
        break;
      case "chapter":
        filtered.sort((a, b) => b.chapterNumber - a.chapterNumber);
        break;
    }

    setFilteredHistory(filtered);
  };

  const sortOptions = [
    { value: "latest", label: "الأحدث قراءة" },
    { value: "oldest", label: "الأقدم قراءة" },
    { value: "title", label: "حسب العنوان" },
    { value: "chapter", label: "رقم الفصل" },
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

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `منذ ${diffInDays} يوم`;
    } else if (diffInHours > 0) {
      return `منذ ${diffInHours} ساعة`;
    } else if (diffInMinutes > 0) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else {
      return "منذ قليل";
    }
  };

  // Group history by date
  const groupHistoryByDate = (historyList: typeof filteredHistory) => {
    const groups: Record<string, typeof filteredHistory> = {};

    historyList.forEach((entry) => {
      const date = new Date(entry.readAt).toLocaleDateString("ar");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );
  };

  const groupedHistory = groupHistoryByDate(filteredHistory);

  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <HistoryIcon className="h-8 w-8 text-blue-500" />
              سجل القراءة
            </h1>
            <p className="text-muted-foreground">
              عدد {filteredHistory.length} فصل في السجل
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في سجل القراءة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>

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

          {/* History List */}
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <HistoryIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {search || filterBy !== "all"
                      ? "لا توجد نتائج"
                      : "سجل القراءة فارغ"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {search || filterBy !== "all"
                      ? "جرب تغيير المرشحات أو البحث"
                      : "ابدأ بقراءة بعض الفصول لتظهر هنا"}
                  </p>
                  <Button asChild>
                    <Link to="/">استكشف المانجا</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {groupedHistory.map(([date, entries]) => (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {date}
                      <Badge variant="secondary" className="mr-auto">
                        {entries.length} فصل
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                        >
                          <Link
                            to={`/manga/${entry.mangaId}`}
                            className="flex-shrink-0"
                          >
                            <img
                              src={
                                entry.manga.coverUrl ||
                                `https://picsum.photos/300/400?random=${entry.mangaId}`
                              }
                              alt={entry.manga.title}
                              className="w-16 h-20 object-cover rounded"
                            />
                          </Link>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <Link to={`/manga/${entry.mangaId}`}>
                                <h4 className="font-medium hover:text-primary transition-colors">
                                  {entry.manga.title}
                                </h4>
                              </Link>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(entry.manga.type)}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                              الفصل {entry.chapterNumber}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {getRelativeTime(entry.readAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {entry.manga.author}
                              </span>
                            </div>

                            {/* Reading progress */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-border rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${entry.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {entry.progress}%
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/manga/${entry.mangaId}`}>متابعة</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
