
"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { formatDate, timeAgo, getTagColor } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  tag: string;
  publishedAt: string;
  isPinned: boolean;
  isBreaking: boolean;
  source: { name: string };
}

const TAGS = ["POLICY", "ENFORCEMENT", "COMPLIANCE", "SCAM", "MARKET", "INNOVATION", "BLOCKCHAIN", "CRYPTO_SCAM"];

export function IndiaIntel() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("region", "INDIA");
    if (search) params.set("search", search);
    if (tagFilter) params.set("tag", tagFilter);
    const res = await fetch("/api/news?" + params.toString());
    const data = await res.json();
    setItems(data.items);
    setTotalPages(data.totalPages);
    setLoading(false);
    setRefreshing(false);
  }, [page, search, tagFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const onFocus = () => fetchItems();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchItems]);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-gray-400">{refreshing ? "Refreshing latest news..." : "Showing latest fetched news"}</p>
        <button onClick={fetchItems} className="btn-secondary text-xs">Refresh Now</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search India Intel..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10" />
        </div>
        <select value={tagFilter}
          onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
          className="select-field">
          <option value="">All Categories</option>
          {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading intelligence feed...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No items found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id}
              className={`card hover:border-navy-600 transition-colors ${
                item.isBreaking ? "border-l-4 border-l-red-500" : ""
              } ${item.isPinned ? "border-l-4 border-l-yellow-500" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {item.isBreaking && <span className="badge bg-red-600 text-white">BREAKING</span>}
                    {item.isPinned && <span className="badge bg-yellow-600 text-white">PINNED</span>}
                    {item.tag && <span className={`badge ${getTagColor(item.tag)}`}>{item.tag}</span>}
                    <span className="text-xs text-gray-500">{timeAgo(item.publishedAt)}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Source: {item.source.name} &middot; {formatDate(item.publishedAt)}
                  </p>
                </div>
                <button onClick={() => toggleExpand(item.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-white mt-1">
                  {expanded.has(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {expanded.has(item.id) && (
                <div className="mt-3 pt-3 border-t border-navy-700">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {item.summary || "No summary available."}
                  </p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2">
                    <ExternalLink className="w-3 h-3" /> Read full article
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1} className="btn-secondary text-sm">Previous</button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages} className="btn-secondary text-sm">Next</button>
        </div>
      )}
    </div>
  );
}
