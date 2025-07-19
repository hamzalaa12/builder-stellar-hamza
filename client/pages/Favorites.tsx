import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import PlaceholderPage from "./PlaceholderPage";

export default function Favorites() {
  return (
    <Layout>
      <AuthGuard
        fallbackTitle="المفضلة"
        fallbackMessage="سجل دخولك لحفظ وعرض مانجاتك المفضلة"
      >
        <div className="container mx-auto px-6 py-8">
          <PlaceholderPage
            title="المفضلة"
            description="هذه الصفحة قيد التطوير. ستتمكن قريباً من عرض وإدارة مانجاتك المفضلة."
            suggestions={[
              "عرض قائمة المانجا المفضلة",
              "إضافة أو إزالة من المفضلة",
              "تصنيف المفضلة",
              "مشاركة قائمة المفضلة",
            ]}
          />
        </div>
      </AuthGuard>
    </Layout>
  );
}
