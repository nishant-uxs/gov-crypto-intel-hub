
"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { getRiskColor } from "@/lib/utils";

interface Scam {
  id: string; name: string; description: string; riskLevel: string;
  indiaPrevalence: string; vectors: string[]; redFlags: string[];
  victimProfile: string; investigationTips: string;
}

export function ScamRegistry() {
  const [scams, setScams] = useState<Scam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (riskFilter) params.set("risk", riskFilter);
    fetch("/api/scams?" + params.toString())
      .then((r) => r.json())
      .then((data) => { setScams(data); setLoading(false); });
  }, [search, riskFilter]);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search scam types..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="select-field">
          <option value="">All Risk</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading scam registry...</div>
      ) : (
        <div className="space-y-3">
          {scams.map((scam) => (
            <div key={scam.id} className="card">
              <div className="flex items-center justify-between cursor-pointer"
                onClick={() => toggle(scam.id)}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{scam.name}</h3>
                    <p className="text-xs text-gray-400">{scam.indiaPrevalence}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getRiskColor(scam.riskLevel)}`}>{scam.riskLevel}</span>
                  {expanded.has(scam.id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expanded.has(scam.id) && (
                <div className="mt-4 pt-4 border-t border-navy-700 space-y-3">
                  <p className="text-sm text-gray-300">{scam.description}</p>
                  {scam.vectors.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Common Vectors</p>
                      <div className="flex flex-wrap gap-1">
                        {scam.vectors.map((v) => <span key={v} className="badge bg-navy-700 text-gray-300">{v}</span>)}
                      </div>
                    </div>
                  )}
                  {scam.redFlags.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Red Flags</p>
                      <ul className="list-disc list-inside text-sm text-gray-300">
                        {scam.redFlags.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Investigation Tips</p>
                    <p className="text-sm text-gray-300">{scam.investigationTips}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
