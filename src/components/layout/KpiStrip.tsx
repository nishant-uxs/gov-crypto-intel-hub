import { prisma } from "@/lib/prisma";
import { daysUntil } from "@/lib/utils";

async function getKpis() {
  const kpis = await prisma.kpi.findMany({ orderBy: { label: "asc" } });
  const exchangeCount = await prisma.exchange.count({
    where: {
      status: {
        in: ["ACTIVE", "ACTIVE (Limited)", "RESTRUCTURED"],
      },
    },
  });

  const kpiMap = new Map(kpis.map((k) => [k.computeKey || k.label, k]));

  const micaTarget = new Date("2027-06-30");
  const micaDays = daysUntil(micaTarget);

  return kpis.map((kpi) => {
    if (kpi.computeKey === "fiu_vasp_count") {
      return { ...kpi, value: String(exchangeCount) };
    }
    if (kpi.computeKey === "mica_countdown") {
      return { ...kpi, value: `${micaDays} days` };
    }
    return kpi;
  });
}

export async function KpiStrip() {
  const kpis = await getKpis();

  return (
    <div className="bg-navy-900 border-b border-navy-700 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 min-w-max">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="flex-shrink-0 bg-navy-800 rounded-lg px-3 py-2 border border-navy-700 min-w-[140px]"
          >
            <p className="text-xs text-gray-400 truncate">{kpi.label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
