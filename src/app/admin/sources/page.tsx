
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
export default async function AdminSources() {
  const sources = await prisma.newsSource.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">News Sources</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-navy-700">
            <th className="text-left py-3 px-3 text-gray-400">Name</th>
            <th className="text-left py-3 px-3 text-gray-400">Type</th>
            <th className="text-left py-3 px-3 text-gray-400">Region</th>
            <th className="text-left py-3 px-3 text-gray-400">Frequency</th>
            <th className="text-left py-3 px-3 text-gray-400">Active</th>
            <th className="text-left py-3 px-3 text-gray-400">Last Fetched</th>
            <th className="text-left py-3 px-3 text-gray-400">Last Error</th>
          </tr></thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                <td className="py-3 px-3 text-white font-medium">{s.name}</td>
                <td className="py-3 px-3 text-gray-300">{s.type}</td>
                <td className="py-3 px-3"><span className={`badge ${s.region==="INDIA"?"bg-blue-100 text-blue-800":"bg-purple-100 text-purple-800"}`}>{s.region}</span></td>
                <td className="py-3 px-3 text-gray-300">Every {s.frequencyHours}h</td>
                <td className="py-3 px-3"><span className={`badge ${s.isActive?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>{s.isActive?"Active":"Inactive"}</span></td>
                <td className="py-3 px-3 text-gray-400 text-xs">{s.lastFetchedAt?formatDate(s.lastFetchedAt):"Never"}</td>
                <td className="py-3 px-3 text-red-400 text-xs max-w-[150px] truncate">{s.lastError||"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}