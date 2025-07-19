import { useState, useEffect } from "react";
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
import { Search, Upload, FileText } from "lucide-react";

interface AddChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock manga data for search
const mockMangaList = [
  { id: "1", title: "Advance Dragon King to resist all" },
  { id: "2", title: "One Piece" },
  { id: "3", title: "Naruto" },
  { id: "4", title: "Attack on Titan" },
  { id: "5", title: "Demon Slayer" },
  { id: "6", title: "Dragon Ball Super" },
  { id: "7", title: "My Hero Academia" },
  { id: "8", title: "Jujutsu Kaisen" },
];

export default function AddChapterDialog({
  isOpen,
  onClose,
}: AddChapterDialogProps) {
  const [formData, setFormData] = useState({
    mangaId: "",
    mangaTitle: "",
    chapterNumber: "",
    chapterTitle: "",
    description: "",
    pages: [] as File[],
  });

  const [mangaSearch, setMangaSearch] = useState("");
  const [showMangaDropdown, setShowMangaDropdown] = useState(false);
  const [filteredManga, setFilteredManga] = useState(mockMangaList);

  // Filter manga based on search (show results after 2+ characters)
  useEffect(() => {
    if (mangaSearch.length >= 2) {
      const filtered = mockMangaList.filter((manga) =>
        manga.title.toLowerCase().includes(mangaSearch.toLowerCase()),
      );
      setFilteredManga(filtered);
      setShowMangaDropdown(true);
    } else {
      setShowMangaDropdown(false);
    }
  }, [mangaSearch]);

  const handleMangaSelect = (manga: { id: string; title: string }) => {
    setFormData((prev) => ({
      ...prev,
      mangaId: manga.id,
      mangaTitle: manga.title,
    }));
    setMangaSearch(manga.title);
    setShowMangaDropdown(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      pages: files,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New chapter data:", formData);
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
        <DialogTitle className="text-xl">إضافة فصل جديد</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Manga Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            اختر المانجا <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="اختر مانجا/مانهوا/مانه��..."
              value={mangaSearch}
              onChange={(e) => setMangaSearch(e.target.value)}
              className="pr-10"
              required
            />

            {/* Manga Dropdown */}
            {showMangaDropdown && filteredManga.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 border rounded-md bg-card shadow-lg max-h-48 overflow-y-auto">
                {filteredManga.map((manga) => (
                  <button
                    key={manga.id}
                    type="button"
                    onClick={() => handleMangaSelect(manga)}
                    className="block w-full text-right px-3 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                  >
                    {manga.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chapter Number and Title */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              رقم الفصل <span className="text-red-500">*</span>
            </label>
            <Input
              name="chapterNumber"
              placeholder="10"
              value={formData.chapterNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">عنوان الفصل</label>
            <Input
              name="chapterTitle"
              placeholder="عنوان الفصل (اختياري)"
              value={formData.chapterTitle}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Chapter Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">وصف الفصل</label>
          <Textarea
            name="description"
            placeholder="وصف مختصر للفصل (اختياري)"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        {/* Chapter Pages Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            صور الفصل <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              اختر صور الفصل أو اسحبها هنا
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="chapter-pages"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("chapter-pages")?.click()}
            >
              رفع الصفحات
            </Button>
          </div>

          {formData.pages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.pages.map((file, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  الصفحة {index + 1}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium text-sm">
            إعدادات متقدمة
          </summary>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" id="featured" />
              <label htmlFor="featured">فصل مميز</label>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" id="notify" />
              <label htmlFor="notify">إرسال إشعار للمتابعين</label>
            </div>
          </div>
        </details>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          رفع جميع الصفحات
        </Button>
      </form>
    </DialogContent>
  );
}
