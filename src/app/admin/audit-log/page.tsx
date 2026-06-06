
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
export default async function AdminAuditLog() {
  const logs = await prisma.auditLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Audit Log</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-navy-700">
            <th className="text-left py-3 px-3 text-gray-400">User</th>
            <th className="text-left py-3 px-3 text-gray-400">Action</th>
            <th className="text-left py-3 px-3 text-gray-400">Table</th>
            <th className="text-left py-3 px-3 text-gray-400">Record ID</th>
            <th className="text-left py-3 px-3 text-gray-400">Date</th>
          </tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                <td className="py-3 px-3 text-white text-xs">{l.user.name}<br /><span className="text-gray-500">{l.user.email}</span></td>
                <td className="py-3 px-3"><span className={`badge ${l.action==="CREATE"?"bg-green-100 text-green-800":l.action==="UPDATE"?"bg-yellow-100 text-yellow-800":"bg-red-100 text-red-800"}`}>{l.action}</span></td>
                <td className="py-3 px-3 text-gray-300 text-xs">{l.tableName}</td>
                <td className="py-3 px-3 text-gray-400 font-mono text-xs">{l.recordId}</td>
                <td className="py-3 px-3 text-gray-400 text-xs">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length===0&&<p className="text-gray-400 text-center py-4">No audit entries yet.</p>}
      </div>
    </div>
  );
}