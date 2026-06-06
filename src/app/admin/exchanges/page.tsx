
import { prisma } from "@/lib/prisma";
import { formatDate, getRiskColor } from "@/lib/utils";
export default async function AdminExchanges() {
  const exchanges = await prisma.exchange.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">FIU Exchanges</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-navy-700">
            <th className="text-left py-3 px-3 text-gray-400">Name</th>
            <th className="text-left py-3 px-3 text-gray-400">Reg#</th>
            <th className="text-left py-3 px-3 text-gray-400">Status</th>
            <th className="text-left py-3 px-3 text-gray-400">Risk</th>
            <th className="text-left py-3 px-3 text-gray-400">CEO/AML Officer</th>
            <th className="text-left py-3 px-3 text-gray-400">Updated</th>
          </tr></thead>
          <tbody>
            {exchanges.map((ex) => (
              <tr key={ex.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                <td className="py-3 px-3 text-white font-medium">{ex.name}</td>
                <td className="py-3 px-3 text-gray-400 font-mono text-xs">{ex.registrationNumber || "—"}</td>
                <td className="py-3 px-3"><span className={`badge ${ex.status==="active"?"bg-green-100 text-green-800":ex.status==="suspended"?"bg-yellow-100 text-yellow-800":"bg-red-100 text-red-800"}`}>{ex.status}</span></td>
                <td className="py-3 px-3"><span className={`badge ${getRiskColor(ex.riskLevel)}`}>{ex.riskLevel}</span></td>
                <td className="py-3 px-3 text-gray-400 text-xs">{ex.ceo}{ex.amlOfficer ? " / "+ex.amlOfficer : ""}</td>
                <td className="py-3 px-3 text-gray-400 text-xs">{formatDate(ex.lastUpdatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}