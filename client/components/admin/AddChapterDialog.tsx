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
import { useAuth } from "@/context/AuthContext";
import {
  getAllManga,
  searchManga,
  addChapter,
  getChaptersByMangaId,
  type Manga,
} from "@/lib/mangaData";

interface AddChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddChapterDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddChapterDialogProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    number: "",
    mangaId: "",
    pages: [] as string[],
  });

  const [mangaSearch, setMangaSearch] = useState("");
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [allManga, setAllManga] = useState<Manga[]>([]);
  const [filteredManga, setFilteredManga] = useState<Manga[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load all manga when dialog opens
    if (isOpen) {
      const manga = getAllManga();
      setAllManga(manga);
      setFilteredManga(manga.slice(0, 10)); // Show first 10 initially
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter manga based on search
    if (mangaSearch.trim()) {
      const results = searchManga(mangaSearch);
      setFilteredManga(results.slice(0, 10));
    } else {
      setFilteredManga(allManga.slice(0, 10));
    }
  }, [mangaSearch, allManga]);

  const handleMangaSelect = (manga: Manga) => {
    setSelectedManga(manga);
    setFormData((prev) => ({ ...prev, mangaId: manga.id }));
    setMangaSearch("");

    // Auto-generate next chapter number
    const existingChapters = getChaptersByMangaId(manga.id);
    const nextChapterNumber = existingChapters.length + 1;
    setFormData((prev) => ({
      ...prev,
      number: nextChapterNumber.toString(),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedManga) return;

    setIsSubmitting(true);

    try {
      const chapterData = {
        title: formData.title,
        number: parseInt(formData.number),
        mangaId: formData.mangaId,
        pages: formData.pages,
        publishedAt: new Date().toISOString(),
        createdBy: user.id,
      };

      const newChapter = addChapter(chapterData);
      console.log("تمت إضافة فصل جديد:", newChapter);

      // Reset form
      setFormData({
        title: "",
        number: "",
        mangaId: "",
        pages: [],
      });
      setSelectedManga(null);
      setMangaSearch("");

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("خطأ في إضافة الفصل:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // In a real application, you would upload these files to a server
    // For now, we'll create mock URLs
    const pageUrls = files.map(
      (file, index) =>
        `https://example.com/chapters/${formData.mangaId}/pages/${Date.now()}-${index}.jpg`,
    );

    setFormData((prev) => ({
      ...prev,
      pages: [...prev.pages, ...pageUrls],
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

          {!selectedManga ? (
            <>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن ا��مانجا..."
                  value={mangaSearch}
                  onChange={(e) => setMangaSearch(e.target.value)}
                  className="pr-10 bg-card border-border"
                />
              </div>

              {/* Manga suggestions */}
              <div className="border rounded-md p-2 bg-card max-h-48 overflow-y-auto">
                {filteredManga.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      {mangaSearch
                        ? "لم يتم العثور على مانجا"
                        : "لا توجد مانجا متوفرة"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      يرجى إضافة مانجا أولاً قبل إضافة الفصول
                    </p>
                  </div>
                ) : (
                  filteredManga.map((manga) => (
                    <button
                      key={manga.id}
                      type="button"
                      onClick={() => handleMangaSelect(manga)}
                      className="w-full text-right px-3 py-2 hover:bg-muted rounded text-sm border-b border-border/50 last:border-b-0 flex items-center gap-3"
                    >
                      <img
                        src={
                          manga.coverUrl ||
                          `https://picsum.photos/300/400?random=${manga.id}`
                        }
                        alt={manga.title}
                        className="w-10 h-12 object-cover rounded"
                      />
                      <div className="flex-1 text-right">
                        <div className="font-medium">{manga.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {manga.author} • {manga.chaptersCount} فصل
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <img
                src={
                  selectedManga.coverUrl ||
                  `https://picsum.photos/300/400?random=${selectedManga.id}`
                }
                alt={selectedManga.title}
                className="w-12 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{selectedManga.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedManga.author} • {selectedManga.chaptersCount} فصل
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedManga(null);
                  setFormData((prev) => ({ ...prev, mangaId: "", number: "" }));
                }}
              >
                تغيير
              </Button>
            </div>
          )}
        </div>

        {/* Chapter Details */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              عنوان الفصل <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              placeholder="عنوان الفصل"
              value={formData.title}
              onChange={handleInputChange}
              className="bg-card border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              رقم الفصل <span className="text-red-500">*</span>
            </label>
            <Input
              name="number"
              type="number"
              placeholder="1"
              value={formData.number}
              onChange={handleInputChange}
              className="bg-card border-border"
              required
            />
          </div>
        </div>

        {/* Page Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            صفحات الفصل
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              اسحب واسقط الصور هنا أو اضغط للاختيار
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePageUpload}
              className="hidden"
              id="page-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("page-upload")?.click()}
            >
              اختر الصور
            </Button>
          </div>

          {/* Uploaded pages preview */}
          {formData.pages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                الصفحات المرفوعة ({formData.pages.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.pages.map((page, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-20 bg-muted rounded border"
                  >
                    <FileText className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                    <span className="absolute bottom-0 left-0 right-0 text-xs text-center bg-background/80 rounded-b">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !selectedManga || !formData.title.trim()}
          className="w-full bg-primary hover:bg-primary/90 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "جارٍ الإضافة..." : "إضافة الفصل"}
        </Button>
      </form>
    </DialogContent>
  );
}
