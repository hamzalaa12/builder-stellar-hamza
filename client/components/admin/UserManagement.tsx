import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Shield,
  Ban,
  UserCheck,
  Search,
  Trash2,
  Clock,
  User,
  MessageSquare,
  BookOpen,
  Heart,
  Settings,
} from "lucide-react";
import {
  useAuth,
  roleLabels,
  rolePermissions,
  UserRole,
} from "@/context/AuthContext";
import {
  getAllUsers,
  updateUserRole,
  banUser,
  unbanUser,
  isUserBanned,
  getBannedUsers,
  deleteUser,
  getUserStats,
  searchUsers,
  type BannedUser,
} from "@/lib/userManagement";
import {
  getCommentsByUser,
  banUserFromCommenting,
  isUserBannedFromCommenting,
  getCommentStats,
} from "@/lib/commentSystem";
import { getUserProfile } from "@/lib/userData";

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isManageUserOpen, setIsManageUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const allUsers = getAllUsers();
    const usersWithStats = allUsers.map((u) => {
      const stats = getUserStats(u.id);
      const profile = getUserProfile(u.id);
      const banned = isUserBanned(u.id);
      const commentBanned = isUserBannedFromCommenting(u.id);
      const userComments = getCommentsByUser(u.id);

      return {
        ...u,
        stats: stats?.stats || {},
        profile: stats?.profile || profile,
        favoritesCount: stats?.favoritesCount || 0,
        readingHistoryCount: stats?.readingHistoryCount || 0,
        commentsCount: userComments.length,
        activeCommentsCount: userComments.filter((c) => c.status === "active")
          .length,
        isBanned: !!banned,
        banInfo: banned,
        isCommentBanned: commentBanned,
        lastActive: profile?.lastActive || u.lastLogin,
        joinedDaysAgo: Math.floor(
          (Date.now() - new Date(u.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      };
    });
    setUsers(usersWithStats);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!user) return;
    if (updateUserRole(userId, newRole, user.id)) {
      loadUserData();
    }
  };

  const handleBanUser = (
    userId: string,
    reason: string,
    duration: "temporary" | "permanent",
    days?: number,
  ) => {
    if (!user) return;
    if (banUser(userId, user.id, reason, duration, days)) {
      loadUserData();
    }
  };

  const handleUnbanUser = (userId: string) => {
    if (!user) return;
    if (unbanUser(userId, user.id)) {
      loadUserData();
    }
  };

  const handleDeleteUser = (userToDelete: any) => {
    if (!user) return;
    if (deleteUser(userToDelete.id, user.id)) {
      loadUserData();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleBanFromCommenting = (
    userId: string,
    reason: string,
    duration: "temporary" | "permanent",
    days?: number,
  ) => {
    if (!user) return;
    if (banUserFromCommenting(userId, user.id, reason, duration, days)) {
      loadUserData();
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = searchUsers(searchQuery).map((u) => {
        const fullUser = users.find((user) => user.id === u.id);
        return fullUser || u;
      });
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }

    return filtered;
  };

  const UserDetailModal = ({ user: targetUser }: { user: any }) => {
    const [banReason, setBanReason] = useState("");
    const [banDuration, setBanDuration] = useState<"temporary" | "permanent">(
      "temporary",
    );
    const [banDays, setBanDays] = useState(7);
    const [commentBanReason, setCommentBanReason] = useState("");
    const [action, setAction] = useState<
      "view" | "ban" | "role" | "commentBan"
    >("view");

    return (
      <Dialog open={isManageUserOpen} onOpenChange={setIsManageUserOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={targetUser?.profile?.avatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              إدارة المستخدم: {targetUser?.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={action} onValueChange={(value: any) => setAction(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="view">الم��لومات</TabsTrigger>
              <TabsTrigger value="role">الرتبة</TabsTrigger>
              <TabsTrigger value="ban">الحظر</TabsTrigger>
              <TabsTrigger value="commentBan">حظر التعليقات</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {targetUser?.commentsCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        إجمالي التعليقات
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {targetUser?.stats?.chaptersRead || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ف��ول مقروءة
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {targetUser?.favoritesCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">مفضلة</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {targetUser?.joinedDaysAgo}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        يوم عضوية
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    البري�� الإلكتروني:
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {targetUser?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">تاريخ الانضمام:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(targetUser?.createdAt || "").toLocaleDateString(
                      "ar",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">آخر نشاط:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(targetUser?.lastActive || "").toLocaleDateString(
                      "ar",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الرتبة الحالية:</span>
                  <Badge variant="secondary">
                    {roleLabels[targetUser?.role as UserRole]}
                  </Badge>
                </div>
                {targetUser?.isBanned && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">حالة الحظر:</span>
                    <Badge variant="destructive">محظور</Badge>
                  </div>
                )}
                {targetUser?.isCommentBanned && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">حظر التعليقات:</span>
                    <Badge variant="destructive">محظور من التعليق</Badge>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="role" className="space-y-4 mt-4">
              <div>
                <Label>تغيير الرتبة</Label>
                <Select
                  value={targetUser?.role}
                  onValueChange={(value) =>
                    handleRoleChange(targetUser?.id, value as UserRole)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">صلاحيات الرتبة الحالية:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {targetUser?.role && rolePermissions[targetUser.role] && (
                    <>
                      <div>
                        •{" "}
                        {rolePermissions[targetUser.role].canRead
                          ? "يمكن القراءة"
                          : "لا يمكن القراءة"}
                      </div>
                      <div>
                        •{" "}
                        {rolePermissions[targetUser.role].canComment
                          ? "يمكن التعليق"
                          : "لا يمكن التعليق"}
                      </div>
                      <div>
                        •{" "}
                        {rolePermissions[targetUser.role].canUpload
                          ? "يمكن الرفع"
                          : "لا يمكن الرفع"}
                      </div>
                      <div>
                        •{" "}
                        {rolePermissions[targetUser.role].canModerate
                          ? "يمكن الإشراف"
                          : "لا يمكن الإشراف"}
                      </div>
                      <div>
                        •{" "}
                        {rolePermissions[targetUser.role].canAdmin
                          ? "يمكن الإدارة"
                          : "لا يمكن الإدارة"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ban" className="space-y-4 mt-4">
              {targetUser?.isBanned ? (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium text-destructive mb-2">
                      المستخدم محظور
                    </h4>
                    <div className="text-sm space-y-1">
                      <div>السبب: {targetUser.banInfo?.reason}</div>
                      <div>
                        النوع:{" "}
                        {targetUser.banInfo?.duration === "permanent"
                          ? "دائم"
                          : "مؤقت"}
                      </div>
                      {targetUser.banInfo?.expiresAt && (
                        <div>
                          ينتهي:{" "}
                          {new Date(
                            targetUser.banInfo.expiresAt,
                          ).toLocaleDateString("ar")}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUnbanUser(targetUser.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <UserCheck className="h-4 w-4 ml-2" />
                    رفع الحظر
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>سبب الحظر</Label>
                    <Input
                      placeholder="سبب الحظر"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>نوع الحظر</Label>
                    <Select
                      value={banDuration}
                      onValueChange={(value: any) => setBanDuration(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temporary">مؤقت</SelectItem>
                        <SelectItem value="permanent">دائم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {banDuration === "temporary" && (
                    <div>
                      <Label>عدد الأيام</Label>
                      <Input
                        type="number"
                        placeholder="عدد الأيام"
                        value={banDays}
                        onChange={(e) =>
                          setBanDays(parseInt(e.target.value) || 7)
                        }
                      />
                    </div>
                  )}
                  <Button
                    onClick={() =>
                      handleBanUser(
                        targetUser.id,
                        banReason,
                        banDuration,
                        banDays,
                      )
                    }
                    className="w-full"
                    variant="destructive"
                    disabled={!banReason.trim()}
                  >
                    <Ban className="h-4 w-4 ml-2" />
                    حظر المستخدم
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="commentBan" className="space-y-4 mt-4">
              {targetUser?.isCommentBanned ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">
                    محظور من التعليقات
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    هذا المستخدم لا يمكنه كتابة التعليقات
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>سبب حظر التعليقات</Label>
                    <Input
                      placeholder="سبب منع التعليقات"
                      value={commentBanReason}
                      onChange={(e) => setCommentBanReason(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() =>
                      handleBanFromCommenting(
                        targetUser.id,
                        commentBanReason,
                        "permanent",
                      )
                    }
                    className="w-full"
                    variant="destructive"
                    disabled={!commentBanReason.trim()}
                  >
                    <MessageSquare className="h-4 w-4 ml-2" />
                    حظر من التعليقات
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredUsers = getFilteredUsers();
  const activeUsers = users.filter((u) => !u.isBanned).length;
  const bannedUsersCount = users.filter((u) => u.isBanned).length;
  const moderators = users.filter((u) =>
    ["admin", "site_admin", "elite_fighter", "tribe_leader"].includes(u.role),
  ).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">
                  إجمالي المستخدمين
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-sm text-muted-foreground">مستخدمون نشطون</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{moderators}</p>
                <p className="text-sm text-muted-foreground">مشرفون ومديرون</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Ban className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{bannedUsersCount}</p>
                <p className="text-sm text-muted-foreground">محظورون</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة المستخدمين</CardTitle>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في المستخدمين..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الرتب</SelectItem>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`p-4 border rounded-lg transition-colors ${
                  u.isBanned ? "bg-red-50 border-red-200" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.profile?.avatar} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{u.name}</h4>
                        <Badge variant="secondary">{roleLabels[u.role]}</Badge>
                        {u.isBanned && (
                          <Badge variant="destructive">محظور</Badge>
                        )}
                        {u.isCommentBanned && (
                          <Badge variant="outline" className="text-red-500">
                            حظر تعليقات
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {u.commentsCount} تعليق
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {u.stats?.chaptersRead || 0} فصل
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {u.favoritesCount} مفضل
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {u.joinedDaysAgo} يوم عضوية
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(u);
                        setIsManageUserOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4 ml-1" />
                      إدارة
                    </Button>

                    <AlertDialog
                      open={isDeleteDialogOpen && userToDelete?.id === u.id}
                      onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open);
                        if (!open) setUserToDelete(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setUserToDelete(u)}
                          disabled={u.role === "site_admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف المستخدم {userToDelete?.name}؟
                            هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(userToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && <UserDetailModal user={selectedUser} />}
    </div>
  );
}
