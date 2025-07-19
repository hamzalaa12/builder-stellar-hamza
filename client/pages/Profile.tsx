import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Heart,
  History,
  Bell,
  Settings,
  Camera,
  Lock,
  Mail,
  Eye,
  MessageCircle,
  BookOpen,
  FileText,
  Clock,
  Star,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth, roleLabels, rolePermissions } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getFavorites,
  getReadingHistory,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  initializeUserData,
  getPendingContent,
  approvePendingContent,
  rejectPendingContent,
  type UserProfile,
  type Notification,
  type PendingContent,
} from "@/lib/userData";
import {
  getAllManga,
  getMangaById,
  getAllChapters,
  type Manga,
} from "@/lib/mangaData";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      initializeUserData(user.id);
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    if (!user) return;

    // Load profile
    let profile = getUserProfile(user.id);
    if (!profile) {
      profile = createUserProfile(user.id);
    }
    setUserProfile(profile);

    // Load favorites with manga data
    const userFavorites = getFavorites(user.id);
    const allManga = getAllManga();
    const favoritesWithManga = userFavorites
      .map((fav) => {
        const manga = allManga.find((m) => m.id === fav.mangaId);
        return manga ? { ...fav, manga } : null;
      })
      .filter(Boolean);
    setFavorites(favoritesWithManga);

    // Load reading history with manga data
    const history = getReadingHistory(user.id);
    const historyWithManga = history
      .map((entry) => {
        const manga = allManga.find((m) => m.id === entry.mangaId);
        return manga ? { ...entry, manga } : null;
      })
      .filter(Boolean);
    setReadingHistory(historyWithManga.slice(0, 20)); // Show last 20

    // Load notifications
    const userNotifications = getNotifications(user.id);
    setNotifications(userNotifications.slice(0, 30)); // Show last 30

    // Load pending content for admins
    if (rolePermissions[user.role]?.canAdmin) {
      const pending = getPendingContent().filter((p) => p.status === "pending");
      setPendingContent(pending);
    }

    // Set edit form
    setEditForm({
      name: user.name,
      bio: profile.bio || "",
      avatar: profile.avatar || "",
    });
  };

  const handleProfileUpdate = () => {
    if (!user || !userProfile) return;

    // Update user data
    updateUser({ name: editForm.name });

    // Update profile
    updateUserProfile(user.id, {
      bio: editForm.bio,
      avatar: editForm.avatar,
    });

    loadUserData();
    setIsEditingProfile(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!user) return;
    markNotificationAsRead(user.id, notification.id);
    loadUserData();
  };

  const handleMarkAllNotificationsRead = () => {
    if (!user) return;
    markAllNotificationsAsRead(user.id);
    loadUserData();
  };

  const handleContentApproval = (contentId: string, approved: boolean) => {
    if (!user) return;

    if (approved) {
      approvePendingContent(contentId, user.id);
    } else {
      rejectPendingContent(contentId, user.id, "لم يتم قبول المحتوى");
    }

    loadUserData();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_chapter":
        return <BookOpen className="h-4 w-4" />;
      case "content_pending_approval":
        return <AlertTriangle className="h-4 w-4" />;
      case "content_approved":
        return <CheckCircle className="h-4 w-4" />;
      case "content_rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <AuthGuard>
        <div>Loading...</div>
      </AuthGuard>
    );
  }

  const canUploadContent = rolePermissions[user.role]?.canUpload || false;
  const canModerate = rolePermissions[user.role]?.canModerate || false;
  const canAdmin = rolePermissions[user.role]?.canAdmin || false;
  const needsApproval = ["beginner_fighter", "elite_fighter"].includes(
    user.role,
  );

  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto px-6 py-8">
          {/* Profile Header */}
          <div className="bg-card rounded-lg p-6 mb-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={userProfile?.avatar || user.avatar}
                  alt={user.name}
                />
                <AvatarFallback className="text-2xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {user.name}
                  </h1>
                  <Badge variant="secondary" className="text-sm">
                    {roleLabels[user.role]}
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-2">{user.email}</p>

                {userProfile?.bio && (
                  <p className="text-foreground mb-4">{userProfile.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    انضم في{" "}
                    {new Date(userProfile?.joinedAt || "").toLocaleDateString(
                      "ar",
                    )}
                  </span>
                  <span>
                    آخر نشاط:{" "}
                    {new Date(userProfile?.lastActive || "").toLocaleDateString(
                      "ar",
                    )}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Dialog
                    open={isEditingProfile}
                    onOpenChange={setIsEditingProfile}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 ml-2" />
                        تعديل الملف الشخصي
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>الاسم</Label>
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>نبذة شخصية</Label>
                          <Textarea
                            value={editForm.bio}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            placeholder="اكتب نبذة عن نفسك..."
                          />
                        </div>
                        <div>
                          <Label>رابط الصورة الشخصية</Label>
                          <Input
                            value={editForm.avatar}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                avatar: e.target.value,
                              }))
                            }
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                        <Button
                          onClick={handleProfileUpdate}
                          className="w-full"
                        >
                          حفظ التغييرات
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userProfile?.stats.chaptersRead || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      فصل مقروء
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {favorites.length}
                    </div>
                    <div className="text-sm text-muted-foreground">مفضل</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userProfile?.stats.commentsWritten || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">تعليق</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {(userProfile?.stats.mangaUploaded || 0) +
                        (userProfile?.stats.chaptersUploaded || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      محتوى مرفوع
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="h-4 w-4 ml-2" />
                المفضلة ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 ml-2" />
                سجل القراءة
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 ml-2" />
                الإشعارات ({getUnreadNotificationsCount(user.id)})
              </TabsTrigger>
              {canUploadContent && (
                <TabsTrigger value="uploads">
                  <BookOpen className="h-4 w-4 ml-2" />
                  رفوعاتي
                </TabsTrigger>
              )}
              {canAdmin && (
                <TabsTrigger value="admin">
                  <Shield className="h-4 w-4 ml-2" />
                  الإدارة
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      المفضلة الأخيرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favorites.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        لم تضف أي مانجا للمفضلة بعد
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {favorites.slice(0, 3).map((fav) => (
                          <div key={fav.mangaId} className="flex gap-3">
                            <img
                              src={
                                fav.manga.coverUrl ||
                                `https://picsum.photos/300/400?random=${fav.mangaId}`
                              }
                              alt={fav.manga.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <Link
                                to={`/manga/${fav.mangaId}`}
                                className="font-medium hover:text-primary"
                              >
                                {fav.manga.title}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {fav.manga.author}
                              </p>
                            </div>
                          </div>
                        ))}
                        {favorites.length > 3 && (
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab("favorites")}
                            className="w-full"
                          >
                            عرض الكل ({favorites.length})
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      آخر ما قرأت
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {readingHistory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        لم تقرأ أي فصل بعد
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {readingHistory.slice(0, 3).map((entry) => (
                          <div key={entry.id} className="flex gap-3">
                            <img
                              src={
                                entry.manga.coverUrl ||
                                `https://picsum.photos/300/400?random=${entry.mangaId}`
                              }
                              alt={entry.manga.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <Link
                                to={`/manga/${entry.mangaId}`}
                                className="font-medium hover:text-primary"
                              >
                                {entry.manga.title}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                الفصل {entry.chapterNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.readAt).toLocaleDateString(
                                  "ar",
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        {readingHistory.length > 3 && (
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab("history")}
                            className="w-full"
                          >
                            عرض السجل الكامل
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>المفضلة ({favorites.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        لم تضف أي مانجا للمفضلة بعد
                      </p>
                      <Button asChild className="mt-4">
                        <Link to="/">استكشف المانجا</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {favorites.map((fav) => (
                        <Link
                          key={fav.mangaId}
                          to={`/manga/${fav.mangaId}`}
                          className="group"
                        >
                          <div className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                            <div className="aspect-[3/4] overflow-hidden">
                              <img
                                src={
                                  fav.manga.coverUrl ||
                                  `https://picsum.photos/300/400?random=${fav.mangaId}`
                                }
                                alt={fav.manga.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium text-sm truncate">
                                {fav.manga.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {fav.manga.chaptersCount} فصل
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>سجل القراءة</CardTitle>
                </CardHeader>
                <CardContent>
                  {readingHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        لم تقرأ أي فصل بعد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {readingHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                        >
                          <img
                            src={
                              entry.manga.coverUrl ||
                              `https://picsum.photos/300/400?random=${entry.mangaId}`
                            }
                            alt={entry.manga.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <Link
                              to={`/manga/${entry.mangaId}`}
                              className="font-medium hover:text-primary"
                            >
                              {entry.manga.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              الفصل {entry.chapterNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              قرئ في{" "}
                              {new Date(entry.readAt).toLocaleString("ar")}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-full bg-border rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${entry.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {entry.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>الإشعارات</CardTitle>
                  {notifications.some((n) => !n.read) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllNotificationsRead}
                    >
                      تحديد الكل كمقروء
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">لا توجد إشعارات</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            notification.read
                              ? "bg-background"
                              : "bg-primary/10 border-primary/20"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleString("ar")}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {canUploadContent && (
              <TabsContent value="uploads" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>المحتوى المرفوع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-12">
                      {needsApproval
                        ? "المحتوى الذي ترفعه يحتاج موافقة المدير قبل النشر"
                        : "يمكنك رفع المحتوى مباشرة بدون موافقة"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {canAdmin && (
              <TabsContent value="admin" className="mt-6">
                <div className="space-y-6">
                  {pendingContent.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>المحتوى في انتظار الموافقة</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {pendingContent.map((content) => (
                            <div
                              key={content.id}
                              className="p-4 border rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {content.type === "manga" ? "مانجا" : "فصل"}{" "}
                                    جديد
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    رفعه: {content.submittedBy}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      content.submittedAt,
                                    ).toLocaleString("ar")}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleContentApproval(content.id, true)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 ml-1" />
                                    قبول
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleContentApproval(content.id, false)
                                    }
                                  >
                                    <XCircle className="h-4 w-4 ml-1" />
                                    رفض
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>إدارة المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center py-8">
                        ستتوفر أدوات إدارة المستخدمين قريباً
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
}
