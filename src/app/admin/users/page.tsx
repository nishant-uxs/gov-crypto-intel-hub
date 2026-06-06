
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
export default async function AdminUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-navy-700">
            <th className="text-left py-3 px-3 text-gray-400">Name</th>
            <th className="text-left py-3 px-3 text-gray-400">Email</th>
            <th className="text-left py-3 px-3 text-gray-400">Role</th>
            <th className="text-left py-3 px-3 text-gray-400">Active</th>
            <th className="text-left py-3 px-3 text-gray-400">Created</th>
            <th className="text-left py-3 px-3 text-gray-400">Last Login</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                <td className="py-3 px-3 text-white font-medium">{u.name}</td>
                <td className="py-3 px-3 text-gray-300 text-xs">{u.email}</td>
                <td className="py-3 px-3"><span className={`badge ${u.role==="SUPER_ADMIN"?"bg-red-100 text-red-800":"bg-blue-100 text-blue-800"}`}>{u.role}</span></td>
                <td className="py-3 px-3"><span className={`badge ${u.isActive?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>{u.isActive?"Yes":"No"}</span></td>
                <td className="py-3 px-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                <td className="py-3 px-3 text-gray-400 text-xs">{u.lastLoginAt?formatDate(u.lastLoginAt):"Never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}