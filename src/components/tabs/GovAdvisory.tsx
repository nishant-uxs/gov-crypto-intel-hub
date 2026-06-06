
"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown, ChevronUp, ScrollText, ShieldCheck, IndianRupee,
  Map, Milestone, Lightbulb, Scale, ExternalLink, Calendar,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

export function GovAdvisory() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/advisory")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading advisory data...</div>;
  if (!data) return <div className="text-center py-12 text-gray-400">No data available.</div>;

  const sections = [
    { key: "legislative", title: "Legislative Tracker", icon: ScrollText },
    { key: "fatf", title: "FATF Compliance Matrix", icon: ShieldCheck },
    { key: "tds", title: "Budget / Revenue Intelligence", icon: IndianRupee },
    { key: "states", title: "State-wise Scam Intelligence", icon: Map },
    { key: "carf", title: "CARF 2027 Roadmap", icon: Milestone },
    { key: "recommendations", title: "Policy Recommendation Matrix", icon: Lightbulb },
    { key: "legal", title: "Legal Precedents", icon: Scale },
  ];

  const renderContent = (key: string) => {
    switch (key) {
      case "legislative":
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Title</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Sponsor</th>
                </tr>
              </thead>
              <tbody>
                {data.legislative?.map((item: any) => (
                  <tr key={item.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                    <td className="py-2 px-3 text-white">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.summary}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="badge bg-navy-700 text-gray-300">{item.type}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`badge ${getStatusColor(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="py-2 px-3 text-gray-400">{item.sponsor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "fatf":
        const counts: Record<string, number> = {};
        data.fatf?.forEach((f: any) => {
          counts[f.complianceStatus] = (counts[f.complianceStatus] || 0) + 1;
        });
        return (
          <div>
            <div className="flex gap-3 mb-4 flex-wrap">
              {Object.entries(counts).map(([status, count]) => (
                <div key={status} className="bg-navy-800 rounded-lg px-3 py-2 border border-navy-700">
                  <span className={`badge ${getStatusColor(status)}`}>{status}</span>
                  <span className="text-white font-bold ml-2">{count}</span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-700">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium w-16">R#</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">Recommendation</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">Gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fatf?.map((f: any) => (
                    <tr key={f.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                      <td className="py-2 px-3 text-gray-400 font-mono">{f.recNumber}</td>
                      <td className="py-2 px-3 text-white text-xs">{f.title}</td>
                      <td className="py-2 px-3">
                        <span className={`badge ${getStatusColor(f.complianceStatus)}`}>{f.complianceStatus}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs max-w-[200px] truncate">{f.gaps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "tds":
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Financial Year</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Amount (Rs Cr)</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.tds?.map((t: any, i: number, arr: any[]) => {
                  const prev = arr[i + 1];
                  const yoy = prev ? (((t.amountCr - prev.amountCr) / prev.amountCr) * 100).toFixed(1) : null;
                  return (
                    <tr key={t.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                      <td className="py-2 px-3 text-white font-medium">{t.fyLabel}</td>
                      <td className="py-2 px-3 text-right text-white font-mono">
                        {t.amountCr.toFixed(1)}
                        {yoy && <span className={`ml-2 text-xs ${parseFloat(yoy) >= 0 ? "text-green-400" : "text-red-400"}`}>
                          ({parseFloat(yoy) >= 0 ? "+" : ""}{yoy}%)
                        </span>}
                      </td>
                      <td className="py-2 px-3">
                        {t.isProjection
                          ? <span className="badge bg-yellow-100 text-yellow-800">Projected</span>
                          : <span className="badge bg-green-100 text-green-800">Actual</span>}
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{t.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "states":
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">State</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Scam Losses (Rs Cr)</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Top Scam Type</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Notable Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.states?.map((s: any) => (
                  <tr key={s.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                    <td className="py-2 px-3 text-white font-medium">{s.stateName}</td>
                    <td className="py-2 px-3 text-right text-white font-mono">{s.scamLossesCr.toFixed(1)}</td>
                    <td className="py-2 px-3">
                      <span className="badge bg-navy-700 text-gray-300">{s.topScamType}</span>
                    </td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{s.notableActions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "carf":
        return (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-navy-700" />
            <div className="space-y-4">
              {data.carf?.map((c: any) => (
                <div key={c.id} className="relative pl-10">
                  <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${
                    c.status === "COMPLETED" ? "bg-green-500 border-green-500" :
                    c.status === "IN-PROGRESS" ? "bg-blue-500 border-blue-500" :
                    "bg-navy-700 border-navy-600"
                  }`} />
                  <div className="card">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-semibold text-sm">
                        Step {c.stepNumber}: {c.title}
                      </h4>
                      <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{c.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {c.targetDate ? formatDate(c.targetDate) : "TBD"}
                      </span>
                      <span>{c.responsibleBody}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "recommendations":
        const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const sorted = [...(data.recommendations || [])].sort(
          (a: any, b: any) => (priorityOrder[a.priority] || 9) - (priorityOrder[b.priority] || 9)
        );
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Recommendation</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Priority</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Body</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r: any) => (
                  <tr key={r.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                    <td className="py-2 px-3 text-white text-xs">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-gray-500 mt-0.5">{r.rationale}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`badge ${
                        r.priority === "HIGH" ? "bg-red-100 text-red-800" :
                        r.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>{r.priority}</span>
                    </td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{r.implementingBody}</td>
                    <td className="py-2 px-3">
                      <span className={`badge ${getStatusColor(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "legal":
        const catColors: Record<string, string> = {
          TAX: "border-l-blue-500", CRIMINAL: "border-l-red-500",
          PMLA: "border-l-yellow-500", SECURITIES: "border-l-purple-500",
        };
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.legal?.map((l: any) => (
              <div key={l.id}
                className={`card border-l-4 ${catColors[l.category] || "border-l-gray-500"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge bg-navy-700 text-gray-300 text-xs">{l.category}</span>
                  <span className="text-xs text-gray-500">{l.year}</span>
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{l.caseName}</h4>
                <p className="text-xs text-gray-400 mb-1">{l.court} &bull; {l.caseReference}</p>
                <p className="text-xs text-gray-300 mb-2">{l.rulingSummary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-400">Impact: {l.policyImpact}</span>
                  {l.sourceUrl && (
                    <a href={l.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <p className="text-sm text-gray-400">No data available.</p>;
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-6">
        <ScrollText className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">GOV Advisory Dashboard</h2>
      </div>
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.key} className="card">
            <button
              onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
              className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <section.icon className="w-4 h-4 text-gray-400" />
                <span className="text-white font-semibold text-sm">{section.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {section.key === "legislative" && `${data.legislative?.length || 0} items`}
                  {section.key === "fatf" && `${data.fatf?.length || 0} recommendations`}
                  {section.key === "tds" && `${data.tds?.length || 0} records`}
                  {section.key === "states" && `${data.states?.length || 0} states`}
                  {section.key === "carf" && `${data.carf?.length || 0} milestones`}
                  {section.key === "recommendations" && `${data.recommendations?.length || 0} items`}
                  {section.key === "legal" && `${data.legal?.length || 0} cases`}
                </span>
                {openSection === section.key
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
            {openSection === section.key && (
              <div className="mt-4 pt-4 border-t border-navy-700">
                {renderContent(section.key)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
