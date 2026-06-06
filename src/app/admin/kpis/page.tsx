
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminKpis() {
  const kpis = await prisma.kpi.findMany({ orderBy: { label: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">KPI Strip Editor</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Label</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Value</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Source</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Computed</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi) => (
              <tr key={kpi.id} className="border-b border-navy-800">
                <td className="py-3 px-3 text-white">{kpi.label}</td>
                <td className="py-3 px-3 text-white font-mono">{kpi.value}</td>
                <td className="py-3 px-3 text-gray-400 max-w-xs truncate">{kpi.sourceCitation || "—"}</td>
                <td className="py-3 px-3">
                  {kpi.isComputed ? <span className="badge bg-green-100 text-green-800">Auto</span> : <span className="badge bg-blue-100 text-blue-800">Manual</span>}
                </td>
                <td className="py-3 px-3 text-gray-400">{formatDate(kpi.lastUpdatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
