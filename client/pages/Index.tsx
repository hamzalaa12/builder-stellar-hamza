import { useState } from "react";
import Layout from "@/components/Layout";
import ChapterCard from "@/components/ChapterCard";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, Clock, Star } from "lucide-react";

// Mock data for latest chapters
const generateMockChapters = (page: number) => {
  const chapters = [];
  const start = (page - 1) * 36;

  for (let i = start; i < start + 36; i++) {
    chapters.push({
      id: `chapter-${i}`,
      title: `عنوان الفصل ${i + 1}`,
      chapterNumber: `${(i % 50) + 1}`,
      mangaTitle: `اسم المانجا ${Math.floor(i / 5) + 1}`,
      coverImage: `https://picsum.photos/300/400?random=${i}`,
      timeAgo: `منذ ${Math.floor(Math.random() * 24)} ساعة`,
      views: Math.floor(Math.random() * 10000) + 1000,
      rating: +(Math.random() * 3 + 2).toFixed(1),
      isNew: Math.random() > 0.7,
    });
  }

  return chapters;
};

export default function Index() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<
    "latest" | "popular" | "trending" | "rated"
  >("latest");
  const totalPages = 10; // Mock total pages

  const chapters = generateMockChapters(currentPage);

  const filterLabels = {
    latest: "الأحدث",
    popular: "الأكثر مشاهدة",
    trending: "الأكثر رواجاً",
    rated: "الأعلى تقييماً",
  };

  const filterIcons = {
    latest: Clock,
    popular: TrendingUp,
    trending: Flame,
    rated: Star,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-6 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            مرحباً بك في مانجافاس
          </h1>
          <p className="text-muted-foreground text-lg">
            اكتشف أحدث فصول المانجا والمانهوا والمانها
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(filterLabels).map(([key, label]) => {
            const Icon = filterIcons[key as keyof typeof filterIcons];
            return (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold">{filterLabels[filter]}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Chapters Grid - 6x6 = 36 items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.id} {...chapter} />
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
