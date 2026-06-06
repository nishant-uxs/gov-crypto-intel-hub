
"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Shield, AlertTriangle, MapPin, Users, TrendingUp, Calendar, CheckCircle, XCircle, Building2 } from "lucide-react";
import { formatDate, getRiskColor, getStatusColor } from "@/lib/utils";

interface Exchange {
  id: string; name: string; registrationNumber: string; registrationDate: string;
  status: string; jurisdiction: string; headquarters: string; founded: string;
  founders: string; ceo: string; marketShare: string; usersCount: string;
  products: string; tdsCompliant: boolean; securityRating: string;
  majorIncidents: string; tradingVolumeDailyCr: string; coldStoragePct: string;
  riskLevel: string; notices: string[]; alerts: string[];
  regulatoryNotes: string; lastUpdatedAt: string;
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

  const activeCount = exchanges.filter(e => e.status === "ACTIVE" || e.status === "ACTIVE (Limited)").length;
  const blockedCount = exchanges.filter(e => e.status === "BLOCKED").length;

  return (
    <div className="py-6">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-navy-800 rounded-lg px-3 py-1.5 border border-navy-700">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white font-semibold">{activeCount}</span>
          <span className="text-xs text-gray-400">Registered</span>
        </div>
        <div className="flex items-center gap-2 bg-navy-800 rounded-lg px-3 py-1.5 border border-navy-700">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-white font-semibold">{blockedCount}</span>
          <span className="text-xs text-gray-400">Blocked (Oct 2025)</span>
        </div>
        <div className="text-xs text-gray-500 ml-auto">Source: FIU-IND Official Records, May 2026</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search exchanges..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="RESTRUCTURED">Restructured</option>
          <option value="BLOCKED">Blocked</option>
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
                  <span className={`badge ${getStatusColor(ex.status)}`}>{ex.status}</span>
                  {expanded.has(ex.id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expanded.has(ex.id) && (
                <div className="mt-4 pt-4 border-t border-navy-700 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ex.headquarters && ex.headquarters !== "—" && (
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> HQ</p>
                        <p className="text-sm text-white">{ex.headquarters}</p>
                      </div>
                    )}
                    {ex.founded && ex.founded !== "—" && (
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Founded</p>
                        <p className="text-sm text-white">{ex.founded}</p>
                      </div>
                    )}
                    {ex.marketShare && ex.marketShare !== "—" && (
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Market Share</p>
                        <p className="text-sm text-white">{ex.marketShare}</p>
                      </div>
                    )}
                    {ex.usersCount && ex.usersCount !== "—" && (
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" /> Users</p>
                        <p className="text-sm text-white">{ex.usersCount}</p>
                      </div>
                    )}
                    {ex.securityRating && (
                      <div>
                        <p className="text-xs text-gray-400">Security</p>
                        <p className="text-sm text-white">{ex.securityRating}</p>
                      </div>
                    )}
                    {ex.tradingVolumeDailyCr && ex.tradingVolumeDailyCr !== "—" && (
                      <div>
                        <p className="text-xs text-gray-400">Daily Vol (Rs Cr)</p>
                        <p className="text-sm text-white">{ex.tradingVolumeDailyCr}</p>
                      </div>
                    )}
                    {ex.coldStoragePct && (
                      <div>
                        <p className="text-xs text-gray-400">Cold Storage</p>
                        <p className="text-sm text-white">{ex.coldStoragePct}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400">TDS Compliant</p>
                      <p className="text-sm text-white flex items-center gap-1">
                        {ex.tdsCompliant ? <><CheckCircle className="w-3 h-3 text-green-400" /> Yes</> : <><XCircle className="w-3 h-3 text-red-400" /> No</>}
                      </p>
                    </div>
                  </div>

                  {ex.founders && ex.founders !== "—" && (
                    <div>
                      <p className="text-xs text-gray-400">Founders</p>
                      <p className="text-sm text-white">{ex.founders}</p>
                    </div>
                  )}

                  {ex.products && (
                    <div>
                      <p className="text-xs text-gray-400">Products</p>
                      <p className="text-sm text-gray-300">{ex.products}</p>
                    </div>
                  )}

                  {ex.majorIncidents && ex.majorIncidents !== "None" && (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                      <p className="text-xs text-red-400 font-semibold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Major Incident
                      </p>
                      <p className="text-sm text-red-200">{ex.majorIncidents}</p>
                    </div>
                  )}

                  {ex.regulatoryNotes && (
                    <div>
                      <p className="text-xs text-gray-400">Regulatory Notes</p>
                      <p className="text-sm text-gray-300">{ex.regulatoryNotes}</p>
                    </div>
                  )}

                  {ex.alerts.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" /> Alerts
                      </p>
                      {ex.alerts.map((a, i) => <p key={i} className="text-sm text-yellow-300">{a}</p>)}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 flex items-center justify-between pt-2 border-t border-navy-800">
                    <span>Registered: {ex.registrationDate ? formatDate(ex.registrationDate) : "N/A"}</span>
                    <span>Updated: {formatDate(ex.lastUpdatedAt)}</span>
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
