
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, getTagColor } from "@/lib/utils";

export default async function AdminNews({ searchParams }: { searchParams: { page?: string; search?: string } }) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const pageSize = 20;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      include: { source: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsItem.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">News Items</h1>
        <Link href="/admin/news/new" className="btn-primary text-sm">+ Add News</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Title</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Tag</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Region</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Source</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Published</th>
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                <td className="py-3 px-3 text-white max-w-xs truncate">{item.title}</td>
                <td className="py-3 px-3">
                  {item.tag ? <span className={`badge ${getTagColor(item.tag)}`}>{item.tag}</span> : <span className="text-gray-500">—</span>}
                </td>
                <td className="py-3 px-3 text-gray-300">{item.region}</td>
                <td className="py-3 px-3 text-gray-400">{item.source.name}</td>
                <td className="py-3 px-3 text-gray-400">{formatDate(item.publishedAt)}</td>
                <td className="py-3 px-3">
                  <Link href={`/admin/news/${item.id}`} className="text-blue-400 hover:text-blue-300 text-xs">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
