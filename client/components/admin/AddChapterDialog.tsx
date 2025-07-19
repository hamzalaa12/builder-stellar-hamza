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

// Mock manga data for search - expanded list with Arabic names
const mockMangaList = [
  { id: "1", title: "Advance Dragon King to resist all" },
  { id: "2", title: "أحمد الشجاع" },
  { id: "3", title: "أقوى محارب" },
  { id: "4", title: "بطل النار" },
  { id: "5", title: "تنين السماء" },
  { id: "6", title: "جندي الظلام" },
  { id: "7", title: "حارس الأرض" },
  { id: "8", title: "خالد المحارب" },
  { id: "9", title: "ذئب الليل" },
  { id: "10", title: "راكب التنين" },
  { id: "11", title: "زعيم القبائل" },
  { id: "12", title: "سيف العدالة" },
  { id: "13", title: "شعلة الأمل" },
  { id: "14", title: "صائد الشياطين" },
  { id: "15", title: "ضوء القمر" },
  { id: "16", title: "طائر الفينيق" },
  { id: "17", title: "ظل الموت" },
  { id: "18", title: "عاصفة الرعد" },
  { id: "19", title: "غابة السحر" },
  { id: "20", title: "فارس الحق" },
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

  // Filter manga based on search (show results after 1+ characters)
  useEffect(() => {
    if (mangaSearch.length >= 1) {
      const filtered = mockMangaList.filter((manga) =>
        manga.title.toLowerCase().includes(mangaSearch.toLowerCase()),
      );
      setFilteredManga(filtered.slice(0, 10)); // Limit to 10 results
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manga Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            اختر المانجا <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="اختر مانجا/مانهوا/مانها"
              value={mangaSearch}
              onChange={(e) => setMangaSearch(e.target.value)}
              className="pr-10 bg-card border-border"
              required
            />

            {/* Manga Dropdown */}
            {showMangaDropdown && filteredManga.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 border border-border rounded-md bg-card shadow-lg max-h-48 overflow-y-auto">
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
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              رقم الفصل <span className="text-red-500">*</span>
            </label>
            <Input
              name="chapterNumber"
              placeholder="10"
              value={formData.chapterNumber}
              onChange={handleInputChange}
              className="bg-card border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              عنوان الفصل
            </label>
            <Input
              name="chapterTitle"
              placeholder="عنوان الفصل (اختياري)"
              value={formData.chapterTitle}
              onChange={handleInputChange}
              className="bg-card border-border"
            />
          </div>
        </div>

        {/* Chapter Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            وصف الفصل
          </label>
          <Textarea
            name="description"
            placeholder="وصف مختصر للفصل (اختياري)"
            value={formData.description}
            onChange={handleInputChange}
            className="bg-card border-border"
            rows={3}
          />
        </div>

        {/* Chapter Pages Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            صور الفصل <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card/50">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
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
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              رفع الصفحات
            </Button>
          </div>

          {formData.pages.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-foreground mb-2">
                تم رفع {formData.pages.length} صفحة
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.pages.map((file, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    الصفحة {index + 1}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Page Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <span className="text-sm font-medium text-foreground">
              الصفحة 1
            </span>
            <Button variant="outline" size="sm">
              رفع ملف
            </Button>
          </div>
          <div className="text-center">
            <span className="text-sm text-muted-foreground">رابطة صفحة 1</span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            يمكنك إضافة من علامة تبويب أو استخدام رابطة خارجية
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 py-3 text-lg"
        >
          إضافة الفصل
        </Button>
      </form>
    </DialogContent>
  );
}
