// Comment system with moderation capabilities

import { addNotification } from "./userData";

export interface Comment {
  id: string;
  mangaId: string;
  chapterId?: string; // Optional for manga-level comments
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  parentId?: string; // For reply comments
  likes: string[]; // Array of user IDs who liked
  dislikes: string[]; // Array of user IDs who disliked
  status: "active" | "hidden" | "deleted" | "pending";
  moderatedBy?: string;
  moderatedAt?: string;
  moderationReason?: string;
  reports: CommentReport[];
}

export interface CommentReport {
  id: string;
  commentId: string;
  reportedBy: string;
  reason: "spam" | "inappropriate" | "offensive" | "harassment" | "other";
  description: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
  resolvedBy?: string;
  resolvedAt?: string;
}

// Storage keys
const COMMENTS_STORAGE_KEY = "mangafas_comments";
const COMMENT_REPORTS_STORAGE_KEY = "mangafas_comment_reports";

// Get all comments
export const getAllComments = (): Comment[] => {
  const commentsStr = localStorage.getItem(COMMENTS_STORAGE_KEY);
  return commentsStr ? JSON.parse(commentsStr) : [];
};

// Get comments for specific manga
export const getCommentsByManga = (mangaId: string): Comment[] => {
  const allComments = getAllComments();
  return allComments
    .filter(
      (comment) => comment.mangaId === mangaId && comment.status === "active",
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

// Get comments for specific chapter
export const getCommentsByChapter = (
  mangaId: string,
  chapterId: string,
): Comment[] => {
  const allComments = getAllComments();
  return allComments
    .filter(
      (comment) =>
        comment.mangaId === mangaId &&
        comment.chapterId === chapterId &&
        comment.status === "active",
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

// Get replies for a comment
export const getRepliesForComment = (commentId: string): Comment[] => {
  const allComments = getAllComments();
  return allComments
    .filter(
      (comment) =>
        comment.parentId === commentId && comment.status === "active",
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
};

// Add new comment
export const addComment = (
  mangaId: string,
  userId: string,
  content: string,
  chapterId?: string,
  parentId?: string,
): Comment => {
  const allComments = getAllComments();

  const newComment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mangaId,
    chapterId,
    userId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: false,
    parentId,
    likes: [],
    dislikes: [],
    status: "active",
    reports: [],
  };

  allComments.push(newComment);
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  return newComment;
};

// Edit comment
export const editComment = (
  commentId: string,
  newContent: string,
  userId: string,
): boolean => {
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) return false;

  const comment = allComments[commentIndex];

  // Check if user owns the comment
  if (comment.userId !== userId) return false;

  comment.content = newContent;
  comment.updatedAt = new Date().toISOString();
  comment.isEdited = true;

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  return true;
};

// Delete comment (soft delete)
export const deleteComment = (
  commentId: string,
  userId: string,
  isModeration: boolean = false,
): boolean => {
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) return false;

  const comment = allComments[commentIndex];

  // Check permissions
  if (!isModeration && comment.userId !== userId) return false;

  comment.status = "deleted";
  comment.updatedAt = new Date().toISOString();

  if (isModeration) {
    comment.moderatedBy = userId;
    comment.moderatedAt = new Date().toISOString();
  }

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  return true;
};

// Hide comment (moderation)
export const hideComment = (
  commentId: string,
  moderatorId: string,
  reason: string,
): boolean => {
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) return false;

  const comment = allComments[commentIndex];
  comment.status = "hidden";
  comment.moderatedBy = moderatorId;
  comment.moderatedAt = new Date().toISOString();
  comment.moderationReason = reason;

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  // Notify comment author
  addNotification(
    comment.userId,
    "comment_reported",
    "تم إخفاء تعليقك",
    `تم إخفاء تعليقك بسبب: ${reason}`,
    { commentId },
  );

  return true;
};

// Restore hidden comment
export const restoreComment = (
  commentId: string,
  moderatorId: string,
): boolean => {
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) return false;

  const comment = allComments[commentIndex];
  comment.status = "active";
  comment.moderatedBy = moderatorId;
  comment.moderatedAt = new Date().toISOString();
  comment.moderationReason = undefined;

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  // Notify comment author
  addNotification(
    comment.userId,
    "comment_reported",
    "تم استعادة تعليقك",
    "تم استعادة تعليقك وهو الآن مرئي للجميع",
    { commentId },
  );

  return true;
};

// Like/Unlike comment
export const toggleCommentLike = (
  commentId: string,
  userId: string,
): boolean => {
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) return false;

  const comment = allComments[commentIndex];

  // Remove from dislikes if present
  comment.dislikes = comment.dislikes.filter((id) => id !== userId);

  // Toggle like
  if (comment.likes.includes(userId)) {
    comment.likes = comment.likes.filter((id) => id !== userId);
  } else {
    comment.likes.push(userId);
  }

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  return true;
};

// Dislike/Undislike comment
export const toggleCommentDislike = (
  commentId: string,
  userId: string,
): boolean => {
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) return false;

  const comment = allComments[commentIndex];

  // Remove from likes if present
  comment.likes = comment.likes.filter((id) => id !== userId);

  // Toggle dislike
  if (comment.dislikes.includes(userId)) {
    comment.dislikes = comment.dislikes.filter((id) => id !== userId);
  } else {
    comment.dislikes.push(userId);
  }

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  return true;
};

// Report comment
export const reportComment = (
  commentId: string,
  reportedBy: string,
  reason: CommentReport["reason"],
  description: string,
): boolean => {
  const reportsStr = localStorage.getItem(COMMENT_REPORTS_STORAGE_KEY);
  const allReports: CommentReport[] = reportsStr ? JSON.parse(reportsStr) : [];

  // Check if user already reported this comment
  const existingReport = allReports.find(
    (r) => r.commentId === commentId && r.reportedBy === reportedBy,
  );
  if (existingReport) return false;

  const newReport: CommentReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    commentId,
    reportedBy,
    reason,
    description,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  allReports.push(newReport);
  localStorage.setItem(COMMENT_REPORTS_STORAGE_KEY, JSON.stringify(allReports));

  // Add report to comment
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex((c) => c.id === commentId);
  if (commentIndex !== -1) {
    allComments[commentIndex].reports.push(newReport);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  }

  // Notify moderators
  // Note: In real app, get all moderator users
  addNotification(
    "admin-1",
    "comment_reported",
    "بلاغ جديد على تعليق",
    `تم الإبلاغ عن تعليق بسبب: ${getReasonLabel(reason)}`,
    { commentId, reportId: newReport.id },
  );

  return true;
};

// Get pending comment reports
export const getPendingCommentReports = (): CommentReport[] => {
  const reportsStr = localStorage.getItem(COMMENT_REPORTS_STORAGE_KEY);
  const allReports: CommentReport[] = reportsStr ? JSON.parse(reportsStr) : [];
  return allReports.filter((r) => r.status === "pending");
};

// Resolve comment report
export const resolveCommentReport = (
  reportId: string,
  resolvedBy: string,
  status: "resolved" | "dismissed",
): boolean => {
  const reportsStr = localStorage.getItem(COMMENT_REPORTS_STORAGE_KEY);
  const allReports: CommentReport[] = reportsStr ? JSON.parse(reportsStr) : [];

  const reportIndex = allReports.findIndex((r) => r.id === reportId);
  if (reportIndex === -1) return false;

  allReports[reportIndex].status = status;
  allReports[reportIndex].resolvedBy = resolvedBy;
  allReports[reportIndex].resolvedAt = new Date().toISOString();

  localStorage.setItem(COMMENT_REPORTS_STORAGE_KEY, JSON.stringify(allReports));
  return true;
};

// Get comments by user
export const getCommentsByUser = (userId: string): Comment[] => {
  const allComments = getAllComments();
  return allComments
    .filter((comment) => comment.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

// Get moderated comments
export const getModeratedComments = (): Comment[] => {
  const allComments = getAllComments();
  return allComments
    .filter(
      (comment) => comment.status === "hidden" || comment.status === "deleted",
    )
    .sort(
      (a, b) =>
        new Date(b.moderatedAt || b.updatedAt).getTime() -
        new Date(a.moderatedAt || a.updatedAt).getTime(),
    );
};

// Helper function to get reason label in Arabic
const getReasonLabel = (reason: CommentReport["reason"]): string => {
  const labels = {
    spam: "رسائل مزعجة",
    inappropriate: "محتوى غير مناسب",
    offensive: "محتوى مسيء",
    harassment: "تحرش",
    other: "أخرى",
  };
  return labels[reason];
};

// Ban user from commenting
export const banUserFromCommenting = (
  userId: string,
  bannedBy: string,
  reason: string,
  duration: "temporary" | "permanent",
  days?: number,
): boolean => {
  const bansStr = localStorage.getItem("mangafas_comment_bans");
  const commentBans: any[] = bansStr ? JSON.parse(bansStr) : [];

  const ban = {
    id: `ban-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    bannedBy,
    reason,
    duration,
    bannedAt: new Date().toISOString(),
    expiresAt:
      duration === "temporary" && days
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    isActive: true,
  };

  commentBans.push(ban);
  localStorage.setItem("mangafas_comment_bans", JSON.stringify(commentBans));

  // Notify user
  addNotification(
    userId,
    "banned",
    "تم حظرك من التعليق",
    `تم حظرك من كتابة التعليقات ${duration === "permanent" ? "نهائياً" : `لمدة ${days} أيام`}. السبب: ${reason}`,
    { banId: ban.id },
  );

  return true;
};

// Check if user is banned from commenting
export const isUserBannedFromCommenting = (userId: string): boolean => {
  const bansStr = localStorage.getItem("mangafas_comment_bans");
  const commentBans: any[] = bansStr ? JSON.parse(bansStr) : [];

  const activeBan = commentBans.find(
    (ban) =>
      ban.userId === userId &&
      ban.isActive &&
      (!ban.expiresAt || new Date() < new Date(ban.expiresAt)),
  );

  return !!activeBan;
};

// Get comment statistics
export const getCommentStats = () => {
  const allComments = getAllComments();
  const reports = getPendingCommentReports();

  return {
    totalComments: allComments.length,
    activeComments: allComments.filter((c) => c.status === "active").length,
    hiddenComments: allComments.filter((c) => c.status === "hidden").length,
    deletedComments: allComments.filter((c) => c.status === "deleted").length,
    pendingReports: reports.length,
    totalReports: allComments.reduce((sum, c) => sum + c.reports.length, 0),
  };
};
