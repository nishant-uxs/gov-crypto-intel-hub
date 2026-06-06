
import { prisma } from "@/lib/prisma";
import { Newspaper, Building2, AlertTriangle, Globe, Rss } from "lucide-react";

export default async function AdminDashboard() {
  const [newsCount, exchangeCount, scamCount, countryCount, sourceCount, untaggedCount] =
    await Promise.all([
      prisma.newsItem.count(),
      prisma.exchange.count(),
      prisma.scamType.count(),
      prisma.country.count(),
      prisma.newsSource.count(),
      prisma.newsItem.count({ where: { tag: "" } }),
    ]);

  const stats = [
    { label: "News Items", value: newsCount, icon: Newspaper, color: "text-blue-400" },
    { label: "FIU Exchanges", value: exchangeCount, icon: Building2, color: "text-green-400" },
    { label: "Scam Types", value: scamCount, icon: AlertTriangle, color: "text-orange-400" },
    { label: "Countries", value: countryCount, icon: Globe, color: "text-purple-400" },
    { label: "News Sources", value: sourceCount, icon: Rss, color: "text-yellow-400" },
    { label: "Untagged Items", value: untaggedCount, icon: Newspaper, color: "text-red-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
