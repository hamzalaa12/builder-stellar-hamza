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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <span className="font-bold text-2xl text-primary">mangafas</span>
          </Link>

          {/* Navigation */}
          <nav className="mx-8 flex items-center space-x-6 space-x-reverse">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-foreground/80"
              }`}
            >
              الرئيسية
            </Link>
            <Link
              to="/manga"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/manga") ? "text-primary" : "text-foreground/80"
              }`}
            >
              مانجا
            </Link>
            <Link
              to="/manhwa"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/manhwa") ? "text-primary" : "text-foreground/80"
              }`}
            >
              مانهوا
            </Link>
            <Link
              to="/manhua"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/manhua") ? "text-primary" : "text-foreground/80"
              }`}
            >
              مانها
            </Link>
          </nav>

          <div className="mr-auto flex items-center space-x-3 space-x-reverse">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="ابحث عن مانجا..."
                className="w-64 h-9 pr-10 pl-3 bg-card border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* User icon */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
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
