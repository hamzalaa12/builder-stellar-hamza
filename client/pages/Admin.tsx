import { useState } from "react";
import { useAuth, rolePermissions } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, BookOpen, FileText, Users, Settings } from "lucide-react";
import AddMangaDialog from "@/components/admin/AddMangaDialog";
import AddChapterDialog from "@/components/admin/AddChapterDialog";

export default function Admin() {
  const { user } = useAuth();
  const [isAddMangaOpen, setIsAddMangaOpen] = useState(false);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);

  // Check if user has admin permissions
  if (!user || !rolePermissions[user.role]?.canAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              غير مخول للوصول
            </h1>
            <p className="text-muted-foreground">
              ليس لديك صلاحية للوصول إلى لوحة الإدارة
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const adminStats = [
    {
      title: "إجمالي المانجا",
      count: "1,234",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "إجمالي الفصول",
      count: "15,678",
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "المستخدمين",
      count: "45,230",
      icon: Users,
      color: "text-purple-500",
    },
    {
      title: "بانتظار الموافقة",
      count: "23",
      icon: Settings,
      color: "text-orange-500",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة الإدارة</h1>
            <p className="text-muted-foreground mt-1">
              مرحباً {user.name} -{" "}
              {user.role === "site_admin" ? "👑 مدير الموقع" : "🛡️ مدير"}
            </p>
          </div>

          <div className="flex gap-3">
            <Dialog open={isAddMangaOpen} onOpenChange={setIsAddMangaOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة مانجا
                </Button>
              </DialogTrigger>
              <AddMangaDialog
                isOpen={isAddMangaOpen}
                onClose={() => setIsAddMangaOpen(false)}
              />
            </Dialog>

            <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة فصل
                </Button>
              </DialogTrigger>
              <AddChapterDialog
                isOpen={isAddChapterOpen}
                onClose={() => setIsAddChapterOpen(false)}
              />
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.count}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Manga */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                أحدث المانجا المضافة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-3 bg-card/50 rounded-lg"
                  >
                    <div className="w-12 h-16 bg-muted rounded overflow-hidden">
                      <img
                        src={`https://picsum.photos/80/120?random=${item}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">مانجا رقم {item}</h4>
                      <p className="text-sm text-muted-foreground">
                        تمت الإضافة منذ {item} ساعة
                      </p>
                    </div>
                    <Badge variant="outline">مستمر</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                بانتظار الموافقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-3 bg-card/50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">الفصل {item + 10}</h4>
                      <p className="text-sm text-muted-foreground">
                        من مانجا التجربة - مرفوع بواسطة مقاتل مبتدئ
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        موافقة
                      </Button>
                      <Button size="sm" variant="destructive">
                        رفض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
