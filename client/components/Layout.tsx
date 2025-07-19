import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  BookOpen,
  Star,
  History,
} from "lucide-react";
import { ReactNode } from "react";
import { useAuth, roleLabels } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              مانجافاس
            </span>
          </Link>

          {/* Navigation */}
          <nav className="mx-6 flex items-center space-x-4 space-x-reverse lg:space-x-6 lg:space-x-reverse">
            <Link to="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="text-sm font-medium"
              >
                الرئيسية
              </Button>
            </Link>
            <Link to="/manga">
              <Button
                variant={isActive("/manga") ? "default" : "ghost"}
                className="text-sm font-medium"
              >
                المانجا
              </Button>
            </Link>
            <Link to="/manhwa">
              <Button
                variant={isActive("/manhwa") ? "default" : "ghost"}
                className="text-sm font-medium"
              >
                المانهوا
              </Button>
            </Link>
            <Link to="/manhua">
              <Button
                variant={isActive("/manhua") ? "default" : "ghost"}
                className="text-sm font-medium"
              >
                المانها
              </Button>
            </Link>
          </nav>

          <div className="mr-auto flex items-center space-x-2 space-x-reverse">
            {/* Search */}
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            {user && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {user.notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {user.notifications}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {user && (
                      <Badge variant="secondary" className="w-fit text-xs mt-1">
                        {roleLabels[user.role]}
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center">
                      <Star className="mr-2 h-4 w-4" />
                      المفضلة
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="flex items-center">
                      <History className="mr-2 h-4 w-4" />
                      سجل القراءة
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      الإعدادات
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">إنشاء حساب</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container flex h-16 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 مانجافاس. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              to="/about"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              حول الموقع
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              اتصل بنا
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
