import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  ChevronDown,
} from "lucide-react";
import { ReactNode } from "react";
import { useAuth, roleLabels, rolePermissions } from "@/context/AuthContext";
import { MANGA_CATEGORIES } from "@/lib/mangaData";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Group categories for better organization
  const popularCategories = MANGA_CATEGORIES.slice(0, 12);
  const allCategories = MANGA_CATEGORIES;

  const CategoryDropdown = ({
    type,
    label,
  }: {
    type: "manga" | "manhwa" | "manhua";
    label: string;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
            isActive(`/${type}`) ? "text-primary" : "text-foreground/80"
          }`}
        >
          {label}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 max-h-80 overflow-y-auto"
        align="end"
      >
        <DropdownMenuLabel className="text-right">
          جميع التصنيفات
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to={`/${type}`}
            className="flex items-center justify-between w-full"
          >
            <span>جميع ال{label}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-right text-xs text-muted-foreground">
          التصنيفات الشائعة
        </DropdownMenuLabel>

        {popularCategories.map((category) => (
          <DropdownMenuItem key={category} asChild>
            <Link
              to={`/${type}?category=${encodeURIComponent(category)}`}
              className="flex items-center justify-between w-full text-right"
            >
              <span>{category}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-right text-xs text-muted-foreground">
          جميع التصنيفات ({allCategories.length})
        </DropdownMenuLabel>

        <div className="max-h-40 overflow-y-auto">
          {allCategories.map((category) => (
            <DropdownMenuItem key={category} asChild>
              <Link
                to={`/${type}?category=${encodeURIComponent(category)}`}
                className="flex items-center justify-between w-full text-right text-xs py-1"
              >
                <span>{category}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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

            <CategoryDropdown type="manga" label="مانجا" />
            <CategoryDropdown type="manhwa" label="مانهوا" />
            <CategoryDropdown type="manhua" label="مانها" />
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
                  <DropdownMenuSeparator />
                  {user && rolePermissions[user.role]?.canAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          لوحة الإدارة
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button variant="ghost" asChild>
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">إنشاء حساب</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">mangafas</h3>
              <p className="text-sm text-muted-foreground">
                أف��ل موقع لقراءة المانجا والمانهوا والمانها باللغة العربية
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manga"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    مانجا
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manhwa"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    مانهوا
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manhua"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    مانها
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">التصنيفات الشائعة</h4>
              <ul className="space-y-2 text-sm">
                {popularCategories.slice(0, 6).map((category) => (
                  <li key={category}>
                    <Link
                      to={`/manga?category=${encodeURIComponent(category)}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">معلومات</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    اتصل بنا
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    شروط الاستخدام
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 mangafas. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
