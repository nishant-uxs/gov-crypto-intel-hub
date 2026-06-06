
"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { formatDate, getStanceColor } from "@/lib/utils";

interface Country {
  id: string; name: string; isoCode: string; stance: string;
  regulatoryBody: string; keyLegislation: string; vaspLicensing: string;
  taxTreatment: string; fatfStatus: string; cbdcStatus: string;
  sourceUrl: string; effectiveDate: string;
}

export function CountryPolicies() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stanceFilter, setStanceFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stanceFilter) params.set("stance", stanceFilter);
    fetch("/api/countries?" + params.toString())
      .then((r) => r.json())
      .then((data) => { setCountries(data); setLoading(false); });
  }, [search, stanceFilter]);

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
          <input type="text" placeholder="Search countries..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={stanceFilter} onChange={(e) => setStanceFilter(e.target.value)} className="select-field">
          <option value="">All Stances</option>
          <option value="PERMISSIVE">Permissive</option>
          <option value="REGULATED">Regulated</option>
          <option value="RESTRICTIVE">Restrictive</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading country policies...</div>
      ) : (
        <div className="space-y-3">
          {countries.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-center justify-between cursor-pointer"
                onClick={() => toggle(c.id)}>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{c.name} {c.isoCode && `(${c.isoCode})`}</h3>
                    <p className="text-xs text-gray-400">{c.regulatoryBody}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getStanceColor(c.stance)}`}>{c.stance}</span>
                  {expanded.has(c.id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expanded.has(c.id) && (
                <div className="mt-4 pt-4 border-t border-navy-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Key Legislation</p>
                    <p className="text-sm text-white">{c.keyLegislation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">VASP Licensing</p>
                    <p className="text-sm text-white">{c.vaspLicensing || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Tax Treatment</p>
                    <p className="text-sm text-white">{c.taxTreatment || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">FATF Status</p>
                    <p className="text-sm text-white">{c.fatfStatus || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">CBDC Status</p>
                    <p className="text-sm text-white">{c.cbdcStatus || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Effective Date</p>
                    <p className="text-sm text-white">{c.effectiveDate ? formatDate(c.effectiveDate) : "N/A"}</p>
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
