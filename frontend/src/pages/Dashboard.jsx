import { useState, useEffect } from "react";
import { dashboardAPI, scanAPI, awsAPI } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { severityBadge, formatDate } from "../utils/helpers";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const SEVERITY_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#eab308", LOW: "#3b82f6", INFORMATIONAL: "#6b7280" };

function StatCard({ label, value, icon, color = "text-brand-400" }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: overview, loading } = useFetch(() => dashboardAPI.overview());
  const [credentials, setCredentials] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => { awsAPI.getCredentials().then((r) => setCredentials(r.data)).catch(() => {}); }, []);

  const runQuickScan = async () => {
    if (credentials.length === 0) return alert("Add AWS credentials first");
    setScanning(true);
    try {
      await scanAPI.run({ credentialId: credentials[0].id });
      window.location.href = "/scans";
    } catch (err) {
      alert(err.response?.data?.error || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;

  const sevData = overview?.severityCounts
    ? Object.entries(overview.severityCounts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-sm text-gray-500">Cloud security posture at a glance</p>
        </div>
        <button onClick={runQuickScan} disabled={scanning} className="btn-primary flex items-center gap-2">
          <span>🔍</span> {scanning ? "Scanning..." : "Quick Scan"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Security Score" value={overview?.complianceScore != null ? `${overview.complianceScore}%` : "—"} icon="🛡️" color={overview?.complianceScore >= 70 ? "text-green-400" : overview?.complianceScore >= 40 ? "text-yellow-400" : "text-red-400"} />
        <StatCard label="Resources" value={overview?.totalResources} icon="☁️" />
        <StatCard label="Open Findings" value={overview?.totalFindings} icon="⚠️" color="text-orange-400" />
        <StatCard label="AWS Accounts" value={overview?.credentialsCount} icon="🔑" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Findings by Severity</h3>
          {sevData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sevData}>
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {sevData.map((entry) => <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-600 text-sm">No findings yet. Run a scan to start.</div>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Severity Distribution</h3>
          {sevData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={sevData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                  {sevData.map((entry) => <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-600 text-sm">No data to display</div>
          )}
        </div>
      </div>

      {overview?.trend?.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Compliance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={overview.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="completedAt" tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
              <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }} />
              <Line type="monotone" dataKey="complianceScore" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Scans</h3>
        {overview?.recentScans?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Account</th>
                  <th className="pb-3 font-medium">Resources</th>
                  <th className="pb-3 font-medium">Findings</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${scan.status === "COMPLETED" ? "text-green-400" : scan.status === "FAILED" ? "text-red-400" : "text-yellow-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${scan.status === "COMPLETED" ? "bg-green-400" : scan.status === "FAILED" ? "bg-red-400" : "bg-yellow-400"}`}></span>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">{scan.credential?.label || "—"}</td>
                    <td className="py-3 text-gray-300">{scan.resourcesFound}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {scan.criticalCount > 0 && <span className="badge-critical">{scan.criticalCount}</span>}
                        {scan.highCount > 0 && <span className="badge-high">{scan.highCount}</span>}
                        {scan.mediumCount > 0 && <span className="badge-medium">{scan.mediumCount}</span>}
                        {scan.lowCount > 0 && <span className="badge-low">{scan.lowCount}</span>}
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{scan.complianceScore != null ? `${scan.complianceScore}%` : "—"}</td>
                    <td className="py-3 text-gray-500">{formatDate(scan.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No scans performed yet.</p>
        )}
      </div>
    </div>
  );
}
