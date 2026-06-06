
export default function AdminAdvisory() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">GOV Advisory Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Legislative Tracker","FATF Compliance","TDS/Budget Data","State-wise Intel","CARF Roadmap","Recommendations","Legal Precedents"].map((s)=>(
          <div key={s} className="card hover:border-navy-600 cursor-pointer transition-colors">
            <h3 className="text-white font-semibold text-sm">{s}</h3>
            <p className="text-xs text-gray-400 mt-1">Manage entries</p>
          </div>
        ))}
      </div>
    </div>
  );
}