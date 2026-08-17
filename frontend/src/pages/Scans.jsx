import { useState } from "react";
import { Link } from "react-router-dom";
import { scanAPI, awsAPI } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { formatDate } from "../utils/helpers";

export default function Scans() {
  const { data: scans, loading, refetch } = useFetch(() => scanAPI.list());
  const [credentials, setCredentials] = useState([]);
  const [selected, setSelected] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openModal = async () => {
    const res = await awsAPI.getCredentials();
    setCredentials(res.data);
    setShowModal(true);
  };

  const runScan = async () => {
    if (!selected) return alert("Select a credential");
    setScanning(true);
    try {
      await scanAPI.run({ credentialId: selected });
      setShowModal(false);
      setTimeout(refetch, 1000);
    } catch (err) {
      alert(err.response?.data?.error || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Scans</h1>
          <p className="text-sm text-gray-500">Run and review security posture scans</p>
        </div>
        <button onClick={openModal} className="btn-primary flex items-center gap-2"><span>🔍</span> New Scan</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white">Run New Scan</h2>
            <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Select AWS Account</option>
              {credentials.map((c) => <option key={c.id} value={c.id}>{c.label} ({c.accessKeyId})</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={runScan} disabled={scanning} className="btn-primary">{scanning ? "Starting..." : "Start Scan"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : scans?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Account</th>
                  <th className="pb-3 font-medium">Resources</th>
                  <th className="pb-3 font-medium">Critical</th>
                  <th className="pb-3 font-medium">High</th>
                  <th className="pb-3 font-medium">Medium</th>
                  <th className="pb-3 font-medium">Low</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${scan.status === "COMPLETED" ? "text-green-400" : scan.status === "FAILED" ? "text-red-400" : scan.status === "RUNNING" ? "text-blue-400" : "text-yellow-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${scan.status === "COMPLETED" ? "bg-green-400" : scan.status === "FAILED" ? "bg-red-400" : scan.status === "RUNNING" ? "bg-blue-400" : "bg-yellow-400"}`}></span>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">{scan.credential?.label || "—"}</td>
                    <td className="py-3 text-gray-300">{scan.resourcesFound}</td>
                    <td className="py-3">{scan.criticalCount > 0 ? <span className="badge-critical">{scan.criticalCount}</span> : "0"}</td>
                    <td className="py-3">{scan.highCount > 0 ? <span className="badge-high">{scan.highCount}</span> : "0"}</td>
                    <td className="py-3">{scan.mediumCount > 0 ? <span className="badge-medium">{scan.mediumCount}</span> : "0"}</td>
                    <td className="py-3">{scan.lowCount > 0 ? <span className="badge-low">{scan.lowCount}</span> : "0"}</td>
                    <td className="py-3 text-gray-300">{scan.complianceScore != null ? `${scan.complianceScore}%` : "—"}</td>
                    <td className="py-3 text-gray-500 text-xs">{formatDate(scan.startedAt)}</td>
                    <td className="py-3">
                      {scan.status === "COMPLETED" && <Link to={`/scans/${scan.id}`} className="text-brand-400 hover:text-brand-300 text-xs font-medium">View →</Link>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg mb-2">No scans yet</p>
            <p className="text-sm">Click "New Scan" to perform your first security assessment</p>
          </div>
        )}
      </div>
    </div>
  );
}
