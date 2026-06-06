
"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Shield, AlertTriangle } from "lucide-react";
import { formatDate, getRiskColor } from "@/lib/utils";

interface Exchange {
  id: string; name: string; registrationNumber: string; registrationDate: string;
  status: string; jurisdiction: string; ceo: string; amlOfficer: string;
  assets: string[]; riskLevel: string; notices: string[]; alerts: string[];
  lastUpdatedAt: string;
}

export function FiuExchanges() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (riskFilter) params.set("risk", riskFilter);
    fetch("/api/exchanges?" + params.toString())
      .then((r) => r.json())
      .then((data) => { setExchanges(data); setLoading(false); });
  }, [search, statusFilter, riskFilter]);

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
          <input type="text" placeholder="Search exchanges..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="select-field">
          <option value="">All Risk</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading exchange profiles...</div>
      ) : (
        <div className="space-y-3">
          {exchanges.map((ex) => (
            <div key={ex.id} className="card">
              <div className="flex items-center justify-between cursor-pointer"
                onClick={() => toggle(ex.id)}>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{ex.name}</h3>
                    <p className="text-xs text-gray-400">
                      Reg: {ex.registrationNumber || "N/A"} | {ex.jurisdiction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getRiskColor(ex.riskLevel)}`}>{ex.riskLevel}</span>
                  <span className={`badge ${
                    ex.status === "active" ? "bg-green-100 text-green-800" :
                    ex.status === "suspended" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>{ex.status}</span>
                  {expanded.has(ex.id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expanded.has(ex.id) && (
                <div className="mt-4 pt-4 border-t border-navy-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">CEO</p>
                    <p className="text-sm text-white">{ex.ceo || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">AML Officer</p>
                    <p className="text-sm text-white">{ex.amlOfficer || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Registration Date</p>
                    <p className="text-sm text-white">{ex.registrationDate ? formatDate(ex.registrationDate) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm text-white">{formatDate(ex.lastUpdatedAt)}</p>
                  </div>
                  {ex.assets.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Supported Assets</p>
                      <div className="flex flex-wrap gap-1">
                        {ex.assets.map((a) => <span key={a} className="badge bg-navy-700 text-gray-300">{a}</span>)}
                      </div>
                    </div>
                  )}
                  {ex.alerts.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" /> Alerts
                      </p>
                      {ex.alerts.map((a, i) => <p key={i} className="text-sm text-yellow-300">{a}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
