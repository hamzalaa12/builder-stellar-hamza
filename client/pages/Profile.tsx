import PlaceholderPage from "./PlaceholderPage";

export default function Profile() {
  return (
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
  );
}
