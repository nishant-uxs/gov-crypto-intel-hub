
"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Brain, ChevronDown, ChevronUp } from "lucide-react";

export function AiBrief() {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const fetchBrief = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch("/api/ai-brief" + (isRefresh ? "?refresh=true" : ""));
      const data = await res.json();
      setBrief(data);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchBrief(); }, [fetchBrief]);

  useEffect(() => {
    const interval = setInterval(() => fetchBrief(true), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchBrief]);

  if (loading) return <div className="text-center py-12 text-gray-400">Generating AI brief...</div>;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">AI Intelligence Brief</h2>
        </div>
        <button onClick={() => fetchBrief(true)} disabled={refreshing}
          className="btn-secondary text-sm flex items-center gap-1">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {brief ? (
        <div className="space-y-4">
          {[
            { title: "India Regulatory Pulse", content: brief.section1 },
            { title: "Global Threat Landscape", content: brief.section2 },
            { title: "Enforcement & Compliance Watch", content: brief.section3 },
          ].map((section, i) => (
            <div key={i} className="card">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {section.content || "No data available for this section."}
              </p>
            </div>
          ))}
          <div className="text-xs text-gray-500 text-right">
            Auto-refreshes every 15 minutes
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>AI brief unavailable. Configure Claude API key in admin settings.</p>
        </div>
      )}
    </div>
  );
}
