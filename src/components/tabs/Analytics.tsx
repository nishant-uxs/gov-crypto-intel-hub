
"use client";

import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function Analytics() {
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => { setCharts(data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading analytics...</div>;
  if (!charts) return <div className="text-center py-12 text-gray-400">No data available.</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#9ca3af" } } },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "#1e3a5f" } },
      y: { ticks: { color: "#9ca3af" }, grid: { color: "#1e3a5f" } },
    },
  };

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold text-white mb-6">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">TDS Collection Trend</h3>
          <div className="h-64">
            <Bar data={charts.tdsTrend} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Enforcement Actions Timeline</h3>
          <div className="h-64">
            <Bar data={charts.enforcementTimeline} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Exchange Risk Distribution</h3>
          <div className="h-64">
            <Doughnut data={charts.exchangeRisk} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#9ca3af" } } } }} />
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Global Scam Losses Comparison</h3>
          <div className="h-64">
            <Bar data={charts.scamLosses} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
