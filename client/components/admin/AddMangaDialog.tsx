import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search, ChevronDown } from "lucide-react";

interface AddMangaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMangaDialog({
  isOpen,
  onClose,
}: AddMangaDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverUrl: "",
    author: "",
    artist: "",
    year: "2025",
    status: "ongoing",
    type: "manga",
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState("");

  const availableGenres = [
    "أكشن",
    "مغا��رة",
    "كوميديا",
    "دراما",
    "فانتازيا",
    "رومانسي",
    "خيال علمي",
    "رعب",
    "غموض",
    "رياضة",
    "نفسي",
    "إثارة",
  ];

  const filteredGenres = availableGenres.filter(
    (genre) => genre.includes(genreSearch) && !selectedGenres.includes(genre),
  );

  const handleAddGenre = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
    setGenreSearch("");
  };

  const handleRemoveGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("New manga data:", { ...formData, genres: selectedGenres });
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">
          إضافة مانجا/مانهوا/مانها جديدة
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Type */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              العنوان <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              placeholder="اختر العنوان"
              value={formData.title}
              onChange={handleInputChange}
              className="bg-card border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">النوع</label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manga">مانجا</SelectItem>
                <SelectItem value="manhwa">مانهوا</SelectItem>
                <SelectItem value="manhua">مانها</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">الوصف</label>
          <Textarea
            name="description"
            placeholder="وصف المانجا..."
            value={formData.description}
            onChange={handleInputChange}
            className="bg-card border-border min-h-[100px]"
            rows={4}
          />
        </div>

        {/* Cover Image URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            رابط صورة الغلاف
          </label>
          <Input
            name="coverUrl"
            placeholder="https://example.com/cover.jpg"
            value={formData.coverUrl}
            onChange={handleInputChange}
            className="bg-card border-border"
          />
        </div>

        {/* Author and Artist */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              المؤلف
            </label>
            <Input
              name="author"
              placeholder="اسم المؤلف"
              value={formData.author}
              onChange={handleInputChange}
              className="bg-card border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              الرسام
            </label>
            <Input
              name="artist"
              placeholder="اسم الرسام"
              value={formData.artist}
              onChange={handleInputChange}
              className="bg-card border-border"
            />
          </div>
        </div>

        {/* Year and Status */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              سنة الإصدار
            </label>
            <Input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              className="bg-card border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              الحالة
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">مستمر</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="hiatus">متوقف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Genres */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            التصنيفات
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن تصنيف..."
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className="pr-10 bg-card border-border"
            />
          </div>

          {/* Genre suggestions */}
          {genreSearch && filteredGenres.length > 0 && (
            <div className="border rounded-md p-2 bg-card max-h-32 overflow-y-auto">
              {filteredGenres.slice(0, 5).map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleAddGenre(genre)}
                  className="block w-full text-right px-2 py-1 hover:bg-muted rounded text-sm"
                >
                  {genre}
                </button>
              ))}
            </div>
          )}

          {/* Selected genres */}
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map((genre) => (
              <Badge key={genre} variant="secondary" className="text-sm">
                {genre}
                <button
                  type="button"
                  onClick={() => handleRemoveGenre(genre)}
                  className="mr-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Advanced Options Dropdown */}
        <details className="border border-border rounded-lg p-4 bg-card/50">
          <summary className="cursor-pointer font-medium text-sm text-foreground flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            إعدادات متقدمة من القائمة المنسدلة
          </summary>
          <div className="mt-4 space-y-3">
            <div className="text-sm text-muted-foreground">
              يمكن إضافة المزيد من الخيارات المتقدمة هنا
            </div>
          </div>
        </details>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 py-3 text-lg"
        >
          إضافة المانجا
        </Button>
      </form>
    </DialogContent>
  );
}
