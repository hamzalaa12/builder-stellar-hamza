import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MangaList from "./pages/MangaList";
import MangaDetails from "./pages/MangaDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import Settings from "./pages/Settings";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/manga" element={<MangaList type="manga" />} />
            <Route path="/manhwa" element={<MangaList type="manhwa" />} />
            <Route path="/manhua" element={<MangaList type="manhua" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />

            {/* Manga Details */}
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route
              path="/chapter/:id"
              element={
                <PlaceholderPage
                  title="قارئ الفصول"
                  description="هذه الصفحة قيد التطوير. ستتمكن قريباً من قراءة فصول المانجا بتجربة مميزة."
                  suggestions={[
                    "قراءة الفصل",
                    "التنقل بين الصفحات",
                    "إعدادات القراءة",
                    "إضافة تعليقات",
                  ]}
                />
              }
            />
            <Route
              path="/about"
              element={
                <PlaceholderPage
                  title="حول الموقع"
                  description="تعرف على مانجافاس - وجهتك المفضلة لقراءة المانجا والمانهوا والمانها."
                />
              }
            />
            <Route
              path="/contact"
              element={
                <PlaceholderPage
                  title="اتصل بنا"
                  description="نحن هنا لمساعدتك! تواصل معنا لأي استفسارات أو مقترحات."
                />
              }
            />
            <Route
              path="/privacy"
              element={
                <PlaceholderPage
                  title="سياسة الخصوصية"
                  description="تعرف على كيفية حماية خصوصيتك وبياناتك في مانجافاس."
                />
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
