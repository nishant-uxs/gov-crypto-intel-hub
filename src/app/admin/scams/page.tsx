
import { prisma } from "@/lib/prisma";
import { getRiskColor } from "@/lib/utils";
export default async function AdminScams() {
  const scams = await prisma.scamType.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Scam Registry</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-navy-700">
            <th className="text-left py-3 px-3 text-gray-400">Name</th>
            <th className="text-left py-3 px-3 text-gray-400">Risk</th>
            <th className="text-left py-3 px-3 text-gray-400">India Prevalence</th>
            <th className="text-left py-3 px-3 text-gray-400">Description</th>
          </tr></thead>
          <tbody>
            {scams.map((s) => (
              <tr key={s.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                <td className="py-3 px-3 text-white font-medium">{s.name}</td>
                <td className="py-3 px-3"><span className={`badge ${getRiskColor(s.riskLevel)}`}>{s.riskLevel}</span></td>
                <td className="py-3 px-3 text-gray-300 text-xs">{s.indiaPrevalence}</td>
                <td className="py-3 px-3 text-gray-400 text-xs max-w-xs truncate">{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}