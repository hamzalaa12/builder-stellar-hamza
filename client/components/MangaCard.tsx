import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface MangaCardProps {
  id: string;
  title: string;
  coverImage: string;
  rating: number;
  chaptersCount: number;
  status: "ongoing" | "completed" | "hiatus";
  lastUpdate: string;
  genres: string[];
  type: "manga" | "manhwa" | "manhua";
}

export default function MangaCard({
  id,
  title,
  coverImage,
  rating,
  chaptersCount,
  status,
  lastUpdate,
  genres,
  type,
}: MangaCardProps) {
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

  const typeLabels = {
    manga: "مانجا",
    manhwa: "مانهوا",
    manhua: "مانها",
  };

  return (
    <Link to={`/manga/${id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer h-full">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Type badge */}
          <Badge className="absolute top-2 right-2 bg-primary">
            {typeLabels[type]}
          </Badge>

          {/* Status badge */}
          <Badge
            className={`absolute top-2 left-2 text-white ${statusColors[status]}`}
          >
            {statusLabels[status]}
          </Badge>

          {/* Rating */}
          <div className="absolute bottom-16 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white">{rating}</span>
          </div>
        </div>

        <CardContent className="p-3">
          <h3 className="font-bold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-2">
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
            {genres.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{genres.length - 2}
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{chaptersCount} فصل</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{lastUpdate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
