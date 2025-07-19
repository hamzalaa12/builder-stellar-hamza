import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface ChapterCardProps {
  id: string;
  title: string;
  chapterNumber: string;
  mangaTitle: string;
  coverImage: string;
  timeAgo: string;
  views: number;
  rating: number;
  isNew?: boolean;
}

export default function ChapterCard({
  id,
  title,
  chapterNumber,
  mangaTitle,
  coverImage,
  timeAgo,
  views,
  rating,
  isNew = false,
}: ChapterCardProps) {
  const statusOptions = ["مكتمل", "جديد", "مستمر"];
  const randomStatus =
    statusOptions[Math.floor(Math.random() * statusOptions.length)];

  return (
    <Link to={`/chapter/${id}`}>
      <div className="group overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
          <img
            src={coverImage}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge
              className={`text-xs px-2 py-1 ${
                randomStatus === "مكتمل"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : randomStatus === "جديد"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {randomStatus}
            </Badge>
          </div>

          {/* Chapter Number Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary/90 hover:bg-primary text-white text-xs px-2 py-1">
              الفصل {chapterNumber}
            </Badge>
          </div>

          {/* Rating */}
          <div className="absolute bottom-12 left-2 flex items-center gap-1 bg-black/60 rounded px-2 py-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white font-medium">{rating}</span>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="font-bold text-sm mb-1 line-clamp-1">
              {mangaTitle}
            </h3>
            <p className="text-xs text-gray-300 mb-2 line-clamp-1">{title}</p>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
