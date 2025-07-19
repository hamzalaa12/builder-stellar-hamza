import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import UserManagement from "@/components/admin/UserManagement";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Ban,
  UserCheck,
  FileText,
  BookOpen,
  Clock,
  Eye,
} from "lucide-react";
import {
  useAuth,
  roleLabels,
  rolePermissions,
  UserRole,
} from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import {
  getAllUsers,
  updateUserRole,
  banUser,
  unbanUser,
  isUserBanned,
  getBannedUsers,
  deleteUser,
  getUserReports,
  resolveUserReport,
  getPendingReports,
  getUserStats,
  searchUsers,
  getUsersByRole,
  type BannedUser,
  type UserReport,
} from "@/lib/userManagement";
import {
  getPendingContent,
  approvePendingContent,
  rejectPendingContent,
  type PendingContent,
} from "@/lib/userData";

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isManageUserOpen, setIsManageUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (user && rolePermissions[user.role]?.canAdmin) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = () => {
    // Load users with stats
    const allUsers = getAllUsers();
    const usersWithStats = allUsers.map((u) => {
      const stats = getUserStats(u.id);
      const banned = isUserBanned(u.id);
      return {
        ...u,
        stats: stats?.stats || {},
        profile: stats?.profile,
        favoritesCount: stats?.favoritesCount || 0,
        readingHistoryCount: stats?.readingHistoryCount || 0,
        isBanned: !!banned,
        banInfo: banned,
      };
    });
    setUsers(usersWithStats);

    // Load pending content
    const pending = getPendingContent().filter((p) => p.status === "pending");
    setPendingContent(pending);

    // Load reports
    const reports = getPendingReports();
    setUserReports(reports);

    // Load banned users
    const banned = getBannedUsers().filter((b) => b.isActive);
    setBannedUsers(banned);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!user) return;
    if (updateUserRole(userId, newRole, user.id)) {
      loadAdminData();
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
      loadAdminData();
    }
  };

  const handleUnbanUser = (userId: string) => {
    if (!user) return;
    if (unbanUser(userId, user.id)) {
      loadAdminData();
    }
  };

  const handleContentApproval = (
    contentId: string,
    approved: boolean,
    notes?: string,
  ) => {
    if (!user) return;

    if (approved) {
      approvePendingContent(contentId, user.id, notes);
    } else {
      rejectPendingContent(contentId, user.id, notes || "لم يتم قبول المحتوى");
    }

    loadAdminData();
  };

  const handleReportResolution = (
    reportId: string,
    status: "resolved" | "dismissed",
    notes?: string,
  ) => {
    if (!user) return;
    if (resolveUserReport(reportId, user.id, status, notes)) {
      loadAdminData();
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

  const UserManageDialog = ({ user: targetUser }: { user: any }) => {
    const [banReason, setBanReason] = useState("");
    const [banDuration, setBanDuration] = useState<"temporary" | "permanent">(
      "temporary",
    );
    const [banDays, setBanDays] = useState(7);

    return (
      <Dialog open={isManageUserOpen} onOpenChange={setIsManageUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إدارة المستخدم: {targetUser?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Role Change */}
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

            {/* Ban/Unban */}
            {targetUser?.isBanned ? (
              <Button
                onClick={() => handleUnbanUser(targetUser.id)}
                className="w-full"
                variant="outline"
              >
                <UserCheck className="h-4 w-4 ml-2" />
                رفع الحظر
              </Button>
            ) : (
              <div className="space-y-3">
                <Label>حظر المستخدم</Label>
                <Input
                  placeholder="سبب الحظر"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
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
                {banDuration === "temporary" && (
                  <Input
                    type="number"
                    placeholder="عدد الأيام"
                    value={banDays}
                    onChange={(e) => setBanDays(parseInt(e.target.value) || 7)}
                  />
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
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (!user || !rolePermissions[user.role]?.canAdmin) {
    return (
      <AuthGuard>
        <Layout>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">غير مخول للوصول</h1>
              <p className="text-muted-foreground">
                هذه الصفحة مخصصة للمديرين فقط
              </p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-500" />
              لوحة الإدار��
            </h1>
            <p className="text-muted-foreground">إدارة المستخدمين والمحتوى</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {pendingContent.length}
                    </p>
                    <p className="text-sm text-muted-foreground">محتوى معلق</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{userReports.length}</p>
                    <p className="text-sm text-muted-foreground">
                      بلاغات جديدة
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Ban className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{bannedUsers.length}</p>
                    <p className="text-sm text-muted-foreground">
                      مستخدمون محظورون
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">
                <Users className="h-4 w-4 ml-2" />
                المستخدمون
              </TabsTrigger>
              <TabsTrigger value="content">
                <AlertTriangle className="h-4 w-4 ml-2" />
                محتوى معلق ({pendingContent.length})
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 ml-2" />
                البلاغات ({userReports.length})
              </TabsTrigger>
              <TabsTrigger value="banned">
                <Ban className="h-4 w-4 ml-2" />
                المحظورون ({bannedUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>المحتوى في انتظار الموافقة</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingContent.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">
                        لا يوجد محتوى في انتظار الموافقة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingContent.map((content) => (
                        <div key={content.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {content.type === "manga" ? "مانجا" : "فصل"}{" "}
                                جديد
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                العنوان: {content.data.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ��فعه:{" "}
                                {users.find((u) => u.id === content.submittedBy)
                                  ?.name || "مجهول"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(content.submittedAt).toLocaleString(
                                  "ar",
                                )}
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>البلاغات الجديدة</CardTitle>
                </CardHeader>
                <CardContent>
                  {userReports.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">
                        لا توجد بلاغات جديدة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userReports.map((report) => (
                        <div key={report.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">بلاغ على مستخدم</h4>
                              <p className="text-sm text-muted-foreground">
                                السبب: {report.reason}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                الوصف: {report.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(report.createdAt).toLocaleString(
                                  "ar",
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleReportResolution(report.id, "resolved")
                                }
                              >
                                تم الحل
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleReportResolution(report.id, "dismissed")
                                }
                              >
                                تجاهل
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banned" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>المستخدمون المحظورون</CardTitle>
                </CardHeader>
                <CardContent>
                  {bannedUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">
                        لا يوجد مستخدمون محظورون
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bannedUsers.map((ban) => {
                        const bannedUser = users.find(
                          (u) => u.id === ban.userId,
                        );
                        return (
                          <div
                            key={ban.userId}
                            className="p-4 border rounded-lg bg-red-50"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">
                                  {bannedUser?.name || "مستخدم محذوف"}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  السبب: {ban.reason}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  النوع:{" "}
                                  {ban.duration === "permanent"
                                    ? "دائم"
                                    : "مؤقت"}
                                </p>
                                {ban.expiresAt && (
                                  <p className="text-sm text-muted-foreground">
                                    ينتهي:{" "}
                                    {new Date(ban.expiresAt).toLocaleDateString(
                                      "ar",
                                    )}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  تاريخ الحظر:{" "}
                                  {new Date(ban.bannedAt).toLocaleString("ar")}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnbanUser(ban.userId)}
                              >
                                <UserCheck className="h-4 w-4 ml-1" />
                                رفع الحظر
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* User Management Dialog */}
          {selectedUser && <UserManageDialog user={selectedUser} />}
        </div>
      </Layout>
    </AuthGuard>
  );
}
