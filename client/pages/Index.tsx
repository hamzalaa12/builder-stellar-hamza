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
      <div className="">
        {/* Hero Section */}
        <div className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.3)_1px,transparent_0)] bg-[size:50px_50px]"></div>
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <h1 className="text-7xl font-bold mb-6 text-primary">mangafas</h1>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              اكتشف آلاف القصص المصورة من اليابان وكوريا والصين، اقرأ أحدث{" "}
              <br />
              الفصول مجاناً
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="px-8 py-3 text-lg bg-primary hover:bg-primary/90"
              >
                <svg
                  className="w-5 h-5 ml-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                ابدأ القراءة
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg border-primary/20 hover:bg-primary/10"
              >
                <Star className="w-5 h-5 ml-2" />
                الأكثر شعبية
              </Button>
            </div>
          </div>
        </div>

        {/* Latest Chapters Section */}
        <div className="container mx-auto px-6 py-12">
          {/* Section Header */}
          <div className="flex items-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-0">آخر الفصول</h2>
          </div>

          {/* Chapters Grid - 6x6 = 36 items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {chapters.slice(0, 6).map((chapter) => (
              <ChapterCard key={chapter.id} {...chapter} />
            ))}
          </div>

          {/* Show More Button */}
          <div className="text-center">
            <Button variant="outline" size="lg" className="px-8">
              عرض المزيد
            </Button>
          </div>
        </div>

        {/* Popular Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-0">
              الأحدث والأكثر شعبية
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {chapters.slice(6, 18).map((chapter) => (
              <ChapterCard key={chapter.id} {...chapter} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
