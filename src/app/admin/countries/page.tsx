
import { prisma } from "@/lib/prisma";
import { getStanceColor } from "@/lib/utils";
export default async function AdminCountries() {
  const countries = await prisma.country.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Country Policies</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-navy-700">
            <th className="text-left py-3 px-3 text-gray-400">Country</th>
            <th className="text-left py-3 px-3 text-gray-400">Stance</th>
            <th className="text-left py-3 px-3 text-gray-400">Regulatory Body</th>
            <th className="text-left py-3 px-3 text-gray-400">Key Legislation</th>
            <th className="text-left py-3 px-3 text-gray-400">FATF</th>
            <th className="text-left py-3 px-3 text-gray-400">CBDC</th>
          </tr></thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id} className="border-b border-navy-800 hover:bg-navy-800/50">
                <td className="py-3 px-3 text-white font-medium">{c.name} {c.isoCode&&`(${c.isoCode})`}</td>
                <td className="py-3 px-3"><span className={`badge ${getStanceColor(c.stance)}`}>{c.stance}</span></td>
                <td className="py-3 px-3 text-gray-300 text-xs">{c.regulatoryBody}</td>
                <td className="py-3 px-3 text-gray-400 text-xs max-w-[200px] truncate">{c.keyLegislation}</td>
                <td className="py-3 px-3 text-gray-400 text-xs">{c.fatfStatus}</td>
                <td className="py-3 px-3 text-gray-400 text-xs">{c.cbdcStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}