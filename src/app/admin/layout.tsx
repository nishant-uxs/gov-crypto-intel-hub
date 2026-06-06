
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, Newspaper, Building2, AlertTriangle, Globe, ScrollText, BarChart3, Brain, Rss, Users, History, Settings, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/news", label: "News Items", icon: Newspaper },
    { href: "/admin/exchanges", label: "FIU Exchanges", icon: Building2 },
    { href: "/admin/scams", label: "Scam Registry", icon: AlertTriangle },
    { href: "/admin/countries", label: "Country Policies", icon: Globe },
    { href: "/admin/advisory", label: "GOV Advisory", icon: ScrollText },
    { href: "/admin/kpis", label: "KPI Strip", icon: BarChart3 },
    { href: "/admin/sources", label: "News Sources", icon: Rss },
    { href: "/admin/ai-config", label: "AI Brief Config", icon: Brain },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/audit-log", label: "Audit Log", icon: History },
  ];

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <aside className="w-64 bg-navy-900 border-r border-navy-700 flex flex-col">
        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="text-white font-bold text-sm">Admin Panel</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{session.user?.name} ({(session.user as any).role})</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-navy-800 transition-colors">
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-navy-700">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-navy-800 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> View Site
          </Link>
          <Link href="/api/auth/signout" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-navy-800 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
