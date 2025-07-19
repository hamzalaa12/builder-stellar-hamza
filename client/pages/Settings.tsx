import PlaceholderPage from "./PlaceholderPage";

export default function Settings() {
  return (
    <PlaceholderPage
      title="الإعدادات"
      description="هذه الصفحة قيد التطوير. ستتمكن قريباً من تخصيص إعدادات الموقع حسب تفضيلاتك."
      suggestions={[
        "تغيير اللغة والمظهر",
        "إعدادات الإشعارات",
        "إعدادات الخصوصية",
        "إعدادات القراءة",
      ]}
    />
  );
}
