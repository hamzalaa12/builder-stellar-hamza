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
import { useAuth, rolePermissions } from "@/context/AuthContext";
import { addManga, searchCategories, MANGA_CATEGORIES } from "@/lib/mangaData";
import { addPendingContent, addNotification } from "@/lib/userData";

interface AddMangaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddMangaDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddMangaDialogProps) {
  const { user } = useAuth();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const filteredGenres = genreSearch
    ? searchCategories(genreSearch).filter(
        (genre) => !selectedGenres.includes(genre),
      )
    : showAllCategories
      ? MANGA_CATEGORIES.filter((genre) => !selectedGenres.includes(genre))
      : MANGA_CATEGORIES.slice(0, 20).filter(
          (genre) => !selectedGenres.includes(genre),
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

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const mangaData = {
        title: formData.title,
        description: formData.description,
        coverUrl: formData.coverUrl,
        author: formData.author,
        artist: formData.artist,
        year: parseInt(formData.year),
        status: formData.status as "ongoing" | "completed" | "hiatus",
        type: formData.type as "manga" | "manhwa" | "manhua",
        genres: selectedGenres,
        rating: 0,
        lastUpdate: "اليوم",
        createdBy: user.id,
      };

      // Check if user needs approval
      const needsApproval = ["beginner_fighter", "elite_fighter"].includes(user.role);

      if (needsApproval) {
        // Add to pending content for approval
        const pendingContent = addPendingContent("manga", mangaData, user.id);

        // Notify admins about pending content
        // Note: In a real app, you'd get all admin users from the database
        addNotification(
          "admin-1", // Default admin ID
          "content_pending_approval",
          "محتوى في انتظار الموافقة",
          `${user.name} رفع مانجا جديدة: ${mangaData.title}`,
          { contentId: pendingContent.id, type: "manga" }
        );

        // Notify user about submission
        addNotification(
          user.id,
          "content_pending_approval",
          "تم رفع المانجا",
          `تم رفع المانجا بنجاح وهي الآن في انتظار موافقة المدير",
          { contentId: pendingContent.id }
        );

        console.log("تم رفع المانجا للمراجعة:", pendingContent);
      } else {
        // Direct upload for higher roles
        const newManga = addManga(mangaData);
        console.log("تمت إضافة مانجا جديدة:", newManga);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        coverUrl: "",
        author: "",
        artist: "",
        year: "2025",
        status: "ongoing",
        type: "manga",
      });
      setSelectedGenres([]);
      setGenreSearch("");
      setShowAllCategories(false);

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("خطأ في إضافة المانجا:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          {(genreSearch || showAllCategories) && filteredGenres.length > 0 && (
            <div className="border rounded-md p-2 bg-card max-h-48 overflow-y-auto">
              <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground">
                <span>
                  {filteredGenres.length} من {MANGA_CATEGORIES.length} تصنيف
                </span>
                {!genreSearch && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="text-primary hover:underline"
                  >
                    {showAllCategories ? "إخفاء" : "عرض الكل"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {filteredGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleAddGenre(genre)}
                    className="text-right px-2 py-1 hover:bg-muted rounded text-sm border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Show all categories button */}
          {!genreSearch && !showAllCategories && (
            <button
              type="button"
              onClick={() => setShowAllCategories(true)}
              className="w-full p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded border border-dashed border-border transition-colors"
            >
              عرض جميع التصنيفات ({MANGA_CATEGORIES.length} تصنيف)
            </button>
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
          disabled={isSubmitting || !formData.title.trim()}
          className="w-full bg-primary hover:bg-primary/90 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "جارً الإضافة..."
            : user && ["beginner_fighter", "elite_fighter"].includes(user.role)
              ? "رفع للمراجعة"
              : "إضافة المانجا"}
        </Button>

        {user && ["beginner_fighter", "elite_fighter"].includes(user.role) && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            سيتم مراجعة المانجا من قبل المدير قبل نشرها
          </p>
        )}
      </form>
    </DialogContent>
  );
}