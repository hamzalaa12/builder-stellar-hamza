import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, User, ArrowRight } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showLoginPrompt?: boolean;
}

export default function AuthGuard({
  children,
  fallbackTitle = "تسجيل الدخول مطلوب",
  fallbackMessage = "يجب تسجيل الدخول للوصول إلى هذه الميزة",
  showLoginPrompt = true,
}: AuthGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold mb-2">{fallbackTitle}</h1>
            <p className="text-muted-foreground mb-6">{fallbackMessage}</p>

            {showLoginPrompt && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/login" className="flex-1">
                    <Button className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link to="/register" className="flex-1">
                    <Button variant="outline" className="w-full">
                      إنشاء حساب
                    </Button>
                  </Link>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">كمستخدم غير مسجل يمكنك:</p>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>قراءة جميع الفصول مجاناً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>تصفح المانجا والمانهوا</span>
                    </div>
                  </div>

                  <p className="mt-3 text-primary">
                    سجل الآن للحصول على المزيد من المميزات!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
