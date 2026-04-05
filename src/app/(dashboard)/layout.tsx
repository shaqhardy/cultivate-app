import { Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
