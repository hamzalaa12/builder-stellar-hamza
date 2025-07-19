import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import PlaceholderPage from "./PlaceholderPage";

export default function Profile() {
  return (
    <Layout>
      <AuthGuard
        fallbackTitle="الملف الشخصي"
        fallbackMessage="سجل دخولك لعرض وإدارة ملفك الشخصي"
      >
        <div className="container mx-auto px-6 py-8">
          <PlaceholderPage
            title="الملف الشخصي"
            description="هذه الصفحة قيد التطوير. ستتمكن قريباً من إدارة ملفك الشخصي وإعداداتك."
            suggestions={[
              "تعديل معلومات الملف الشخصي",
              "تغيير كلمة المرور",
              "إدارة الإشعارات",
              "عرض الإحصائيات الشخصية",
            ]}
          />
        </div>
      </AuthGuard>
    </Layout>
  );
}
