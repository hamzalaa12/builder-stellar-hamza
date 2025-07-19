// User management system for admins

import { User, UserRole } from "@/context/AuthContext";
import { addNotification } from "./userData";

export interface BannedUser {
  userId: string;
  bannedAt: string;
  bannedBy: string;
  reason: string;
  duration: "temporary" | "permanent";
  expiresAt?: string; // For temporary bans
  isActive: boolean;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedBy: string;
  reason: string;
  description: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

// Storage keys
const BANNED_USERS_KEY = "mangafas_banned_users";
const USER_REPORTS_KEY = "mangafas_user_reports";

// Get all users from localStorage
export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem("mangafas_users");
  return usersStr ? JSON.parse(usersStr) : [];
};

// Update user role
export const updateUserRole = (
  userId: string,
  newRole: UserRole,
  updatedBy: string,
): boolean => {
  const users = getAllUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return false;

  const oldRole = users[userIndex].role;
  users[userIndex].role = newRole;

  localStorage.setItem("mangafas_users", JSON.stringify(users));

  // Notify user about role change
  addNotification(
    userId,
    "rank_changed",
    "تم تغيير رتبتك",
    `تم تغيير رتبتك من ${getRoleLabel(oldRole)} إلى ${getRoleLabel(newRole)}`,
    { oldRole, newRole, updatedBy },
  );

  return true;
};

// Ban user
export const banUser = (
  userId: string,
  bannedBy: string,
  reason: string,
  duration: "temporary" | "permanent",
  days?: number,
): boolean => {
  const bannedUsers = getBannedUsers();

  // Check if user is already banned
  const existingBan = bannedUsers.find(
    (ban) => ban.userId === userId && ban.isActive,
  );
  if (existingBan) return false;

  const ban: BannedUser = {
    userId,
    bannedAt: new Date().toISOString(),
    bannedBy,
    reason,
    duration,
    isActive: true,
  };

  if (duration === "temporary" && days) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    ban.expiresAt = expiryDate.toISOString();
  }

  bannedUsers.push(ban);
  localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(bannedUsers));

  // Notify user about ban
  addNotification(
    userId,
    "banned",
    "تم حظرك من الموقع",
    `تم حظرك ${duration === "permanent" ? "نهائياً" : `لمدة ${days} أيام`}. السبب: ${reason}`,
    { duration, reason, bannedBy },
  );

  return true;
};

// Unban user
export const unbanUser = (userId: string, unbannedBy: string): boolean => {
  const bannedUsers = getBannedUsers();
  const banIndex = bannedUsers.findIndex(
    (ban) => ban.userId === userId && ban.isActive,
  );

  if (banIndex === -1) return false;

  bannedUsers[banIndex].isActive = false;
  localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(bannedUsers));

  // Notify user about unban
  addNotification(
    userId,
    "unbanned",
    "تم رفع الحظر",
    "تم رفع الحظر عن حسابك. يمكنك الآن استخدام الموقع بشكل طبيعي",
    { unbannedBy },
  );

  return true;
};

// Check if user is banned
export const isUserBanned = (userId: string): BannedUser | null => {
  const bannedUsers = getBannedUsers();
  const activeBan = bannedUsers.find(
    (ban) => ban.userId === userId && ban.isActive,
  );

  if (!activeBan) return null;

  // Check if temporary ban has expired
  if (
    activeBan.duration === "temporary" &&
    activeBan.expiresAt &&
    new Date() > new Date(activeBan.expiresAt)
  ) {
    // Auto-unban expired temporary bans
    unbanUser(userId, "system");
    return null;
  }

  return activeBan;
};

// Get banned users
export const getBannedUsers = (): BannedUser[] => {
  const bannedStr = localStorage.getItem(BANNED_USERS_KEY);
  return bannedStr ? JSON.parse(bannedStr) : [];
};

// Delete user account
export const deleteUser = (userId: string, deletedBy: string): boolean => {
  const users = getAllUsers();
  const filteredUsers = users.filter((u) => u.id !== userId);

  if (filteredUsers.length === users.length) return false;

  localStorage.setItem("mangafas_users", JSON.stringify(filteredUsers));

  // Clean up user data
  localStorage.removeItem(`mangafas_favorites_${userId}`);
  localStorage.removeItem(`mangafas_reading_history_${userId}`);
  localStorage.removeItem(`mangafas_notifications_${userId}`);
  localStorage.removeItem(`mangafas_user_profiles_${userId}`);

  return true;
};

// Report user
export const reportUser = (
  reportedUserId: string,
  reportedBy: string,
  reason: string,
  description: string,
): UserReport => {
  const reports = getUserReports();

  const report: UserReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    reportedUserId,
    reportedBy,
    reason,
    description,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  reports.push(report);
  localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(reports));

  // Notify admins about new report
  const admins = getAllUsers().filter((u) =>
    ["admin", "site_admin"].includes(u.role),
  );
  admins.forEach((admin) => {
    addNotification(
      admin.id,
      "user_reported",
      "بلاغ جديد على مستخدم",
      `تم الإبلاغ عن مستخدم بسبب: ${reason}`,
      { reportId: report.id, reportedUserId },
    );
  });

  return report;
};

// Resolve user report
export const resolveUserReport = (
  reportId: string,
  resolvedBy: string,
  status: "resolved" | "dismissed",
  notes?: string,
): boolean => {
  const reports = getUserReports();
  const reportIndex = reports.findIndex((r) => r.id === reportId);

  if (reportIndex === -1) return false;

  reports[reportIndex].status = status;
  reports[reportIndex].resolvedBy = resolvedBy;
  reports[reportIndex].resolvedAt = new Date().toISOString();
  reports[reportIndex].notes = notes;

  localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(reports));

  return true;
};

// Get user reports
export const getUserReports = (): UserReport[] => {
  const reportsStr = localStorage.getItem(USER_REPORTS_KEY);
  return reportsStr ? JSON.parse(reportsStr) : [];
};

// Get pending reports
export const getPendingReports = (): UserReport[] => {
  return getUserReports().filter((r) => r.status === "pending");
};

// Helper functions
const getRoleLabel = (role: UserRole): string => {
  const labels = {
    user: "مستخدم",
    beginner_fighter: "🥉 مقاتل مبتدئ",
    elite_fighter: "🥈 مقاتل نخبة",
    tribe_leader: "🥇 قائد القبيلة",
    admin: "🛡️ مدير",
    site_admin: "👑 مدير الموقع",
  };
  return labels[role];
};

// Get user statistics
export const getUserStats = (userId: string) => {
  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  // Get user profile data
  const profilesStr = localStorage.getItem("mangafas_user_profiles");
  const profiles = profilesStr ? JSON.parse(profilesStr) : {};
  const profile = profiles[userId];

  // Get favorites count
  const favoritesStr = localStorage.getItem("mangafas_favorites");
  const favorites = favoritesStr ? JSON.parse(favoritesStr) : {};
  const userFavorites = favorites[userId] || [];

  // Get reading history count
  const historyStr = localStorage.getItem("mangafas_reading_history");
  const history = historyStr ? JSON.parse(historyStr) : {};
  const userHistory = history[userId] || [];

  return {
    user,
    profile,
    favoritesCount: userFavorites.length,
    readingHistoryCount: userHistory.length,
    stats: profile?.stats || {
      mangaRead: 0,
      chaptersRead: 0,
      commentsWritten: 0,
      mangaUploaded: 0,
      chaptersUploaded: 0,
      timeSpentReading: 0,
    },
  };
};

// Search users
export const searchUsers = (query: string): User[] => {
  const users = getAllUsers();
  const searchLower = query.toLowerCase();

  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower),
  );
};

// Get users by role
export const getUsersByRole = (role: UserRole): User[] => {
  const users = getAllUsers();
  return users.filter((user) => user.role === role);
};

// Initialize admin notifications for new user registration
export const notifyAdminsNewUser = (newUser: User): void => {
  const admins = getAllUsers().filter((u) =>
    ["admin", "site_admin"].includes(u.role),
  );

  admins.forEach((admin) => {
    addNotification(
      admin.id,
      "new_user_registration",
      "مستخدم جديد",
      `انضم مستخدم جديد: ${newUser.name} (${newUser.email})`,
      { userId: newUser.id },
    );
  });
};
