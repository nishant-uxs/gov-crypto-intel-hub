
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function NewsEditPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const item = isNew ? null : await prisma.newsItem.findUnique({ where: { id: params.id }, include: { source: { select: { name: true } } } });
  if (!isNew && !item) notFound();

  const sources = await prisma.newsSource.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const tags = ["POLICY","ENFORCEMENT","COMPLIANCE","SCAM","MARKET","INNOVATION"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{isNew ? "Add News Item" : "Edit News Item"}</h1>
        <Link href="/admin/news" className="text-sm text-gray-400 hover:text-white">← Back to News</Link>
      </div>
      <form className="card space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input type="text" className="input-field" defaultValue={item?.title||""} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tag</label>
            <select className="select-field" defaultValue={item?.tag||""}>
              <option value="">None</option>
              {tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Region</label>
            <select className="select-field" defaultValue={item?.region||"INDIA"}>
              <option value="INDIA">INDIA</option>
              <option value="GLOBAL">GLOBAL</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Source</label>
          <select className="select-field" defaultValue={item?.sourceId||""}>
            <option value="">Select source...</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Summary</label>
          <textarea className="input-field" rows={3} defaultValue={item?.summary||""} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">URL</label>
          <input type="url" className="input-field" defaultValue={item?.url||""} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Published Date</label>
          <input type="datetime-local" className="input-field" defaultValue={item?.publishedAt ? new Date(item.publishedAt).toISOString().slice(0,16) : ""} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" defaultChecked={item?.isPinned||false} /> Pinned
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" defaultChecked={item?.isBreaking||false} /> Breaking
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" defaultChecked={item?.isSuppressed||false} /> Suppressed
          </label>
        </div>
        <div className="flex gap-3 pt-4 border-t border-navy-700">
          <button type="submit" className="btn-primary">{isNew ? "Create" : "Save Changes"}</button>
          <Link href="/admin/news" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
