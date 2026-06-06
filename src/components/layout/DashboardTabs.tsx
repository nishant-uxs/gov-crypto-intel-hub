
"use client";

import { useState } from "react";
import { IndiaIntel } from "@/components/tabs/IndiaIntel";
import { GlobalNews } from "@/components/tabs/GlobalNews";
import { FiuExchanges } from "@/components/tabs/FiuExchanges";
import { ScamRegistry } from "@/components/tabs/ScamRegistry";
import { CountryPolicies } from "@/components/tabs/CountryPolicies";
import { GovAdvisory } from "@/components/tabs/GovAdvisory";
import { Analytics } from "@/components/tabs/Analytics";
import { AiBrief } from "@/components/tabs/AiBrief";

const TABS = [
  { id: "india-intel", label: "India Intel", Component: IndiaIntel },
  { id: "global-news", label: "Global News", Component: GlobalNews },
  { id: "fiu-exchanges", label: "FIU Exchanges", Component: FiuExchanges },
  { id: "scam-registry", label: "Scam Registry", Component: ScamRegistry },
  { id: "country-policies", label: "Country Policies", Component: CountryPolicies },
  { id: "gov-advisory", label: "GOV Advisory", Component: GovAdvisory },
  { id: "analytics", label: "Analytics", Component: Analytics },
  { id: "ai-brief", label: "AI Brief", Component: AiBrief },
];

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("india-intel");
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component || IndiaIntel;

  return (
    <div>
      <div className="border-b border-navy-700 bg-navy-900 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <nav className="flex gap-1 min-w-max" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-12">
        <ActiveComponent />
      </main>
      <footer className="border-t border-navy-700 py-4 text-center text-gray-500 text-sm">
        Government Crypto Intelligence Hub &mdash; Digital South Trust, Blockchain Centre of Excellence, Vellore
      </footer>
    </div>
  );
}
