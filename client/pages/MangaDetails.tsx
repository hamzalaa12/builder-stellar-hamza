import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, Eye, Calendar, Book } from "lucide-react";

// Mock manga data
const mockMangaDetails = {
  id: "1",
  title: "Advance Dragon King to resist all",
  coverImage: "https://picsum.photos/300/400?random=100",
  rating: 8.5,
  status: "ongoing",
  year: 2005,
  chaptersCount: 10,
  views: 123456,
  genres: ["فانتازيا", "مغامرة", "أكشن", "خيال علمي", "كوميديا"],
  description: `لقد كانت لعبة في ال��داية، لكنها أصبحت حقيقة. يهيمن نظام الألعاب على كل شيء، الجميع في العالم الحقيقي يبحث عن طريقة للوصول إلى العالم الافتراضي - لكونها... لقد أصبح أمرهم في العالم الجديد. إن أجسام مؤقت النوم في مرضوا لن يتمكنوا من استخدام الواقع وخاصة الطرق في مجال. لأمد هذا النوع سيجد على شيء رائع للكتاب النضج لأنها لديها السمح بتحرير وقضائه التي عندر خارج فيها. تقدم إضافة قراءة مسارها أو من يبدو أن حتى صباح حول ارس، بعضهم خيمة. كما أنها لن يبدوا في تغطيات خارجية، ولكنها كان حقا كل ذوق علماً، إذا حقيقته هي "خو نلقى وراء نشا.","بل بعضهم لديها محاور مقدمة. نختار الافتراض من الدين بنذي".`,
  chapters: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    title: `الفصل ${i + 1}`,
    date: `2024/8/22`,
    views: Math.floor(Math.random() * 1000),
  })),
};

export default function MangaDetails() {
  const { id } = useParams();
  const [manga] = useState(mockMangaDetails);

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

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            to="/"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            العودة الرئيسية
          </Link>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{manga.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4">
                <img
                  src={manga.coverImage}
                  alt={manga.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Manga Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      statusColors[manga.status as keyof typeof statusColors]
                    }
                  >
                    {statusLabels[manga.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">سنة الإصدار:</span>
                    <span className="text-foreground">{manga.year}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">عدد الفصول:</span>
                    <span className="text-foreground">
                      {manga.chaptersCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">المشاهدات:</span>
                    <span className="text-foreground">
                      {manga.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details and Chapters */}
          <div className="lg:col-span-2">
            {/* Title and Rating */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {manga.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-semibold">{manga.rating}</span>
                  <span className="text-muted-foreground">تقييم</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {manga.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-sm">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">القصة</h2>
              <p className="text-muted-foreground leading-relaxed">
                {manga.description}
              </p>
            </div>

            {/* Continue Reading Button */}
            <div className="mb-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                تابع القراءة
              </Button>
            </div>

            {/* Chapters List */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                الفصول ({manga.chaptersCount})
              </h2>

              <div className="space-y-2">
                {manga.chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    to={`/chapter/${chapter.id}`}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-card/80 transition-colors group"
                  >
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {chapter.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{chapter.views}</span>
                        <span>قراءة</span>
                      </div>
                      <span>{chapter.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
