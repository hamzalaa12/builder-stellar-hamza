import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Heart,
  ThumbsDown,
  Reply,
  MoreVertical,
  Edit,
  Trash,
  Flag,
  Eye,
  EyeOff,
  User,
  Send,
  Shield,
} from "lucide-react";
import { useAuth, rolePermissions } from "@/context/AuthContext";
import {
  getCommentsByManga,
  getCommentsByChapter,
  getRepliesForComment,
  addComment,
  editComment,
  deleteComment,
  hideComment,
  restoreComment,
  toggleCommentLike,
  toggleCommentDislike,
  reportComment,
  isUserBannedFromCommenting,
  type Comment,
  type CommentReport,
} from "@/lib/commentSystem";
import { getAllUsers } from "@/lib/userManagement";

interface CommentSystemProps {
  mangaId: string;
  chapterId?: string;
  title: string;
}

export default function CommentSystem({
  mangaId,
  chapterId,
  title,
}: CommentSystemProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingComment, setReportingComment] = useState<string | null>(null);
  const [reportReason, setReportReason] =
    useState<CommentReport["reason"]>("spam");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersBannedFromCommenting, setUsersBannedFromCommenting] =
    useState(false);

  useEffect(() => {
    loadComments();
    if (user) {
      setUsersBannedFromCommenting(isUserBannedFromCommenting(user.id));
    }
  }, [mangaId, chapterId, user]);

  const loadComments = () => {
    const fetchedComments = chapterId
      ? getCommentsByChapter(mangaId, chapterId)
      : getCommentsByManga(mangaId);
    setComments(fetchedComments);
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim() || usersBannedFromCommenting) return;

    setIsSubmitting(true);

    try {
      addComment(mangaId, user.id, newComment.trim(), chapterId, replyTo);
      setNewComment("");
      setReplyTo(null);
      loadComments();
    } catch (error) {
      console.error("خطأ في إضافة التعليق:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!user || !editContent.trim()) return;

    if (editComment(commentId, editContent.trim(), user.id)) {
      setEditingComment(null);
      setEditContent("");
      loadComments();
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!user) return;

    const canModerate = rolePermissions[user.role]?.canModerate;
    if (deleteComment(commentId, user.id, canModerate)) {
      loadComments();
    }
  };

  const handleHideComment = (commentId: string, reason: string) => {
    if (!user || !rolePermissions[user.role]?.canModerate) return;

    if (hideComment(commentId, user.id, reason)) {
      loadComments();
    }
  };

  const handleRestoreComment = (commentId: string) => {
    if (!user || !rolePermissions[user.role]?.canModerate) return;

    if (restoreComment(commentId, user.id)) {
      loadComments();
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (!user) return;
    if (toggleCommentLike(commentId, user.id)) {
      loadComments();
    }
  };

  const handleDislikeComment = (commentId: string) => {
    if (!user) return;
    if (toggleCommentDislike(commentId, user.id)) {
      loadComments();
    }
  };

  const handleReportComment = () => {
    if (!user || !reportingComment || !reportDescription.trim()) return;

    if (
      reportComment(
        reportingComment,
        user.id,
        reportReason,
        reportDescription.trim(),
      )
    ) {
      setReportDialogOpen(false);
      setReportingComment(null);
      setReportDescription("");
      alert("تم إرسال البلاغ بنجاح");
    }
  };

  const getUserInfo = (userId: string) => {
    const users = getAllUsers();
    return users.find((u) => u.id === userId);
  };

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => {
    const author = getUserInfo(comment.userId);
    const canModerate = user && rolePermissions[user.role]?.canModerate;
    const isOwner = user && comment.userId === user.id;
    const canEdit = isOwner && !comment.isEdited;
    const isLiked = user && comment.likes.includes(user.id);
    const isDisliked = user && comment.dislikes.includes(user.id);
    const replies = getRepliesForComment(comment.id);

    return (
      <div
        className={`border border-border rounded-lg p-4 ${depth > 0 ? "ml-8 mt-3" : "mb-4"}`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author?.avatar} alt={author?.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{author?.name}</span>
              {author?.role && author.role !== "user" && (
                <Badge variant="secondary" className="text-xs">
                  {author.role === "admin"
                    ? "🛡️"
                    : author.role === "site_admin"
                      ? "👑"
                      : ""}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString("ar")}
              </span>
              {comment.isEdited && (
                <Badge variant="outline" className="text-xs">
                  معدل
                </Badge>
              )}
              {comment.status === "hidden" && canModerate && (
                <Badge variant="destructive" className="text-xs">
                  مخفي
                </Badge>
              )}
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                  >
                    حفظ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent("");
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground mb-3">{comment.content}</p>
            )}

            {/* Comment Actions */}
            <div className="flex items-center gap-4 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikeComment(comment.id)}
                className={`h-8 px-2 ${isLiked ? "text-red-500" : ""}`}
                disabled={!user}
              >
                <Heart className="h-4 w-4 ml-1" />
                {comment.likes.length}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDislikeComment(comment.id)}
                className={`h-8 px-2 ${isDisliked ? "text-blue-500" : ""}`}
                disabled={!user}
              >
                <ThumbsDown className="h-4 w-4 ml-1" />
                {comment.dislikes.length}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                }
                className="h-8 px-2"
                disabled={!user || usersBannedFromCommenting}
              >
                <Reply className="h-4 w-4 ml-1" />
                رد
              </Button>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </DropdownMenuItem>
                  )}

                  {(isOwner || canModerate) && (
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 ml-2" />
                      حذف
                    </DropdownMenuItem>
                  )}

                  {canModerate && comment.status === "active" && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleHideComment(comment.id, "مخالف للقوانين")
                      }
                    >
                      <EyeOff className="h-4 w-4 ml-2" />
                      إخفاء
                    </DropdownMenuItem>
                  )}

                  {canModerate && comment.status === "hidden" && (
                    <DropdownMenuItem
                      onClick={() => handleRestoreComment(comment.id)}
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      استعادة
                    </DropdownMenuItem>
                  )}

                  {user && !isOwner && (
                    <DropdownMenuItem
                      onClick={() => {
                        setReportingComment(comment.id);
                        setReportDialogOpen(true);
                      }}
                    >
                      <Flag className="h-4 w-4 ml-2" />
                      إبلاغ
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {replyTo === comment.id && user && !usersBannedFromCommenting && (
          <div className="mt-4 mr-11">
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب ردك..."
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4 ml-1" />
                  {isSubmitting ? "جارٍ الإرسال..." : "رد"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment("");
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-4">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">التعليقات ({comments.length})</h3>
        {user && rolePermissions[user.role]?.canModerate && (
          <Badge variant="secondary" className="text-xs">
            <Shield className="h-3 w-3 ml-1" />
            مشرف
          </Badge>
        )}
      </div>

      {/* Add Comment Form */}
      {user ? (
        usersBannedFromCommenting ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              تم حظرك من كتابة التعليقات
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`اكتب تعليقك على ${title}...`}
                  className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    الرجاء احترام قوانين المجتمع
                  </div>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    <Send className="h-4 w-4 ml-1" />
                    {isSubmitting ? "جارٍ الإرسال..." : "نشر التعليق"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="p-4 bg-muted/50 border rounded-lg text-center">
          <p className="text-muted-foreground">
            يجب تسجيل الدخول لكتابة التعليقات
          </p>
        </div>
      )}

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">كن أول من يعلق على {title}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إبلاغ عن تعليق</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>سبب البلاغ</Label>
              <Select
                value={reportReason}
                onValueChange={(value: any) => setReportReason(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">رسائل مزعجة</SelectItem>
                  <SelectItem value="inappropriate">محتوى غير مناسب</SelectItem>
                  <SelectItem value="offensive">محتوى مسيء</SelectItem>
                  <SelectItem value="harassment">تحرش</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تفاصيل البلاغ</Label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="اكتب تفاصيل البلاغ..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReportComment}
                disabled={!reportDescription.trim()}
              >
                إرسال البلاغ
              </Button>
              <Button
                variant="outline"
                onClick={() => setReportDialogOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
