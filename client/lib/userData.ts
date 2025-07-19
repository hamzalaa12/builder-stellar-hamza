// User data management system for favorites, reading history, and notifications

export interface FavoriteManga {
  mangaId: string;
  addedAt: string;
  lastRead?: string;
}

export interface ReadingHistoryEntry {
  id: string;
  mangaId: string;
  chapterId: string;
  chapterNumber: number;
  readAt: string;
  progress: number; // 0-100 percentage of chapter read
}

export interface Notification {
  id: string;
  type:
    | "new_chapter"
    | "content_pending_approval"
    | "content_approved"
    | "content_rejected"
    | "user_reported"
    | "comment_reported"
    | "new_user_registration"
    | "rank_changed"
    | "banned"
    | "unbanned";
  title: string;
  message: string;
  data?: any; // Additional data for the notification
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  bio?: string;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  preferences: {
    emailNotifications: boolean;
    newChapterNotifications: boolean;
    theme: "light" | "dark" | "auto";
    language: "ar" | "en";
  };
  stats: {
    mangaRead: number;
    chaptersRead: number;
    commentsWritten: number;
    mangaUploaded: number;
    chaptersUploaded: number;
    timeSpentReading: number; // in minutes
  };
}

export interface PendingContent {
  id: string;
  type: "manga" | "chapter";
  data: any;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// Storage keys
const FAVORITES_STORAGE_KEY = "mangafas_favorites";
const READING_HISTORY_STORAGE_KEY = "mangafas_reading_history";
const NOTIFICATIONS_STORAGE_KEY = "mangafas_notifications";
const USER_PROFILES_STORAGE_KEY = "mangafas_user_profiles";
const PENDING_CONTENT_STORAGE_KEY = "mangafas_pending_content";

// Favorites Management
export const getFavorites = (userId: string): FavoriteManga[] => {
  const favoritesStr = localStorage.getItem(FAVORITES_STORAGE_KEY);
  const allFavorites: Record<string, FavoriteManga[]> = favoritesStr
    ? JSON.parse(favoritesStr)
    : {};
  return allFavorites[userId] || [];
};

export const addToFavorites = (userId: string, mangaId: string): boolean => {
  const favoritesStr = localStorage.getItem(FAVORITES_STORAGE_KEY);
  const allFavorites: Record<string, FavoriteManga[]> = favoritesStr
    ? JSON.parse(favoritesStr)
    : {};

  if (!allFavorites[userId]) {
    allFavorites[userId] = [];
  }

  // Check if already in favorites
  if (allFavorites[userId].some((fav) => fav.mangaId === mangaId)) {
    return false;
  }

  allFavorites[userId].push({
    mangaId,
    addedAt: new Date().toISOString(),
  });

  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites));
  return true;
};

export const removeFromFavorites = (
  userId: string,
  mangaId: string,
): boolean => {
  const favoritesStr = localStorage.getItem(FAVORITES_STORAGE_KEY);
  const allFavorites: Record<string, FavoriteManga[]> = favoritesStr
    ? JSON.parse(favoritesStr)
    : {};

  if (!allFavorites[userId]) {
    return false;
  }

  const initialLength = allFavorites[userId].length;
  allFavorites[userId] = allFavorites[userId].filter(
    (fav) => fav.mangaId !== mangaId,
  );

  if (allFavorites[userId].length < initialLength) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites));
    return true;
  }

  return false;
};

export const isMangaFavorited = (userId: string, mangaId: string): boolean => {
  const favorites = getFavorites(userId);
  return favorites.some((fav) => fav.mangaId === mangaId);
};

// Reading History Management
export const getReadingHistory = (userId: string): ReadingHistoryEntry[] => {
  const historyStr = localStorage.getItem(READING_HISTORY_STORAGE_KEY);
  const allHistory: Record<string, ReadingHistoryEntry[]> = historyStr
    ? JSON.parse(historyStr)
    : {};
  return (allHistory[userId] || []).sort(
    (a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime(),
  );
};

export const addReadingHistoryEntry = (
  userId: string,
  mangaId: string,
  chapterId: string,
  chapterNumber: number,
  progress: number = 100,
): void => {
  const historyStr = localStorage.getItem(READING_HISTORY_STORAGE_KEY);
  const allHistory: Record<string, ReadingHistoryEntry[]> = historyStr
    ? JSON.parse(historyStr)
    : {};

  if (!allHistory[userId]) {
    allHistory[userId] = [];
  }

  // Remove existing entry for the same chapter
  allHistory[userId] = allHistory[userId].filter(
    (entry) => entry.chapterId !== chapterId,
  );

  // Add new entry
  allHistory[userId].push({
    id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mangaId,
    chapterId,
    chapterNumber,
    readAt: new Date().toISOString(),
    progress,
  });

  // Keep only last 100 entries per user
  allHistory[userId] = allHistory[userId].slice(-100);

  localStorage.setItem(READING_HISTORY_STORAGE_KEY, JSON.stringify(allHistory));

  // Update favorites last read time
  updateFavoriteLastRead(userId, mangaId);
};

const updateFavoriteLastRead = (userId: string, mangaId: string): void => {
  const favoritesStr = localStorage.getItem(FAVORITES_STORAGE_KEY);
  const allFavorites: Record<string, FavoriteManga[]> = favoritesStr
    ? JSON.parse(favoritesStr)
    : {};

  if (allFavorites[userId]) {
    const favoriteIndex = allFavorites[userId].findIndex(
      (fav) => fav.mangaId === mangaId,
    );
    if (favoriteIndex !== -1) {
      allFavorites[userId][favoriteIndex].lastRead = new Date().toISOString();
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites));
    }
  }
};

// Notifications Management
export const getNotifications = (userId: string): Notification[] => {
  const notificationsStr = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  const allNotifications: Record<string, Notification[]> = notificationsStr
    ? JSON.parse(notificationsStr)
    : {};
  return (allNotifications[userId] || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const addNotification = (
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  data?: any,
): void => {
  const notificationsStr = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  const allNotifications: Record<string, Notification[]> = notificationsStr
    ? JSON.parse(notificationsStr)
    : {};

  if (!allNotifications[userId]) {
    allNotifications[userId] = [];
  }

  allNotifications[userId].push({
    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
    userId,
  });

  // Keep only last 50 notifications per user
  allNotifications[userId] = allNotifications[userId].slice(-50);

  localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(allNotifications),
  );
};

export const markNotificationAsRead = (
  userId: string,
  notificationId: string,
): void => {
  const notificationsStr = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  const allNotifications: Record<string, Notification[]> = notificationsStr
    ? JSON.parse(notificationsStr)
    : {};

  if (allNotifications[userId]) {
    const notification = allNotifications[userId].find(
      (n) => n.id === notificationId,
    );
    if (notification) {
      notification.read = true;
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(allNotifications),
      );
    }
  }
};

export const markAllNotificationsAsRead = (userId: string): void => {
  const notificationsStr = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  const allNotifications: Record<string, Notification[]> = notificationsStr
    ? JSON.parse(notificationsStr)
    : {};

  if (allNotifications[userId]) {
    allNotifications[userId].forEach((notification) => {
      notification.read = true;
    });
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(allNotifications),
    );
  }
};

export const getUnreadNotificationsCount = (userId: string): number => {
  const notifications = getNotifications(userId);
  return notifications.filter((n) => !n.read).length;
};

// User Profile Management
export const getUserProfile = (userId: string): UserProfile | null => {
  const profilesStr = localStorage.getItem(USER_PROFILES_STORAGE_KEY);
  const allProfiles: Record<string, UserProfile> = profilesStr
    ? JSON.parse(profilesStr)
    : {};
  return allProfiles[userId] || null;
};

export const createUserProfile = (userId: string): UserProfile => {
  const profile: UserProfile = {
    id: userId,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    preferences: {
      emailNotifications: true,
      newChapterNotifications: true,
      theme: "auto",
      language: "ar",
    },
    stats: {
      mangaRead: 0,
      chaptersRead: 0,
      commentsWritten: 0,
      mangaUploaded: 0,
      chaptersUploaded: 0,
      timeSpentReading: 0,
    },
  };

  const profilesStr = localStorage.getItem(USER_PROFILES_STORAGE_KEY);
  const allProfiles: Record<string, UserProfile> = profilesStr
    ? JSON.parse(profilesStr)
    : {};
  allProfiles[userId] = profile;
  localStorage.setItem(USER_PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));

  return profile;
};

export const updateUserProfile = (
  userId: string,
  updates: Partial<UserProfile>,
): UserProfile | null => {
  const profilesStr = localStorage.getItem(USER_PROFILES_STORAGE_KEY);
  const allProfiles: Record<string, UserProfile> = profilesStr
    ? JSON.parse(profilesStr)
    : {};

  if (!allProfiles[userId]) {
    return null;
  }

  allProfiles[userId] = { ...allProfiles[userId], ...updates };
  localStorage.setItem(USER_PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));

  return allProfiles[userId];
};

// Pending Content Management
export const getPendingContent = (): PendingContent[] => {
  const pendingStr = localStorage.getItem(PENDING_CONTENT_STORAGE_KEY);
  return pendingStr ? JSON.parse(pendingStr) : [];
};

export const addPendingContent = (
  type: "manga" | "chapter",
  data: any,
  submittedBy: string,
): PendingContent => {
  const pending = getPendingContent();

  const newPending: PendingContent = {
    id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    submittedBy,
    submittedAt: new Date().toISOString(),
    status: "pending",
  };

  pending.push(newPending);
  localStorage.setItem(PENDING_CONTENT_STORAGE_KEY, JSON.stringify(pending));

  return newPending;
};

export const approvePendingContent = (
  contentId: string,
  reviewerId: string,
  notes?: string,
): boolean => {
  const pending = getPendingContent();
  const content = pending.find((p) => p.id === contentId);

  if (!content) return false;

  content.status = "approved";
  content.reviewedBy = reviewerId;
  content.reviewedAt = new Date().toISOString();
  content.reviewNotes = notes;

  localStorage.setItem(PENDING_CONTENT_STORAGE_KEY, JSON.stringify(pending));

  // Add notification to submitter
  addNotification(
    content.submittedBy,
    "content_approved",
    "تم قبول المحتوى",
    `تم قبول ${content.type === "manga" ? "المانجا" : "الفصل"} الذي قمت برفعه`,
    { contentId, type: content.type },
  );

  return true;
};

export const rejectPendingContent = (
  contentId: string,
  reviewerId: string,
  notes?: string,
): boolean => {
  const pending = getPendingContent();
  const content = pending.find((p) => p.id === contentId);

  if (!content) return false;

  content.status = "rejected";
  content.reviewedBy = reviewerId;
  content.reviewedAt = new Date().toISOString();
  content.reviewNotes = notes;

  localStorage.setItem(PENDING_CONTENT_STORAGE_KEY, JSON.stringify(pending));

  // Add notification to submitter
  addNotification(
    content.submittedBy,
    "content_rejected",
    "تم رفض المحتوى",
    `تم رفض ${content.type === "manga" ? "المانجا" : "الفصل"} الذي قمت برفعه. السبب: ${notes || "غير محدد"}`,
    { contentId, type: content.type },
  );

  return true;
};

// Statistics helpers
export const updateUserStats = (
  userId: string,
  statType: keyof UserProfile["stats"],
  increment: number = 1,
): void => {
  const profile = getUserProfile(userId) || createUserProfile(userId);
  profile.stats[statType] += increment;
  profile.lastActive = new Date().toISOString();
  updateUserProfile(userId, profile);
};

export const initializeUserData = (userId: string): void => {
  // Initialize user profile if it doesn't exist
  if (!getUserProfile(userId)) {
    createUserProfile(userId);
  }
};
