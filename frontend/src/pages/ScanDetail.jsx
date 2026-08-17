import { useParams } from "react-router-dom";
import { scanAPI } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { severityBadge, serviceIcon, formatDate, truncate } from "../utils/helpers";
import { useState } from "react";

export default function ScanDetail() {
  const { id } = useParams();
  const { data: scan, loading } = useFetch(() => scanAPI.getById(id), [id]);
  const [sevFilter, setSevFilter] = useState("");
  const [svcFilter, setSvcFilter] = useState("");

  const params = {};
  if (sevFilter) params.severity = sevFilter;
  if (svcFilter) params.service = svcFilter;

  const { data: findings, loading: findingsLoading } = useFetch(
    () => scanAPI.getFindings(id, params),
    [id, sevFilter, svcFilter]
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;
  if (!scan) return <div className="text-center py-12 text-gray-600">Scan not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scan Details</h1>
        <p className="text-sm text-gray-500">Account: {scan.credential?.label} | {formatDate(scan.startedAt)}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{scan.resourcesFound}</p>
          <p className="text-xs text-gray-500">Resources</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-400">{scan.criticalCount}</p>
          <p className="text-xs text-gray-500">Critical</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-400">{scan.highCount}</p>
          <p className="text-xs text-gray-500">High</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-400">{scan.mediumCount}</p>
          <p className="text-xs text-gray-500">Medium</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-400">{scan.complianceScore != null ? `${scan.complianceScore}%` : "—"}</p>
          <p className="text-xs text-gray-500">Score</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Findings</h3>
          <div className="flex-1" />
          <select className="input w-auto text-xs" value={sevFilter} onChange={(e) => setSevFilter(e.target.value)}>
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFORMATIONAL">Informational</option>
          </select>
          <select className="input w-auto text-xs" value={svcFilter} onChange={(e) => setSvcFilter(e.target.value)}>
            <option value="">All Services</option>
            <option value="EC2">EC2</option>
            <option value="S3">S3</option>
            <option value="IAM">IAM</option>
            <option value="RDS">RDS</option>
          </select>
        </div>

        {findingsLoading ? (
          <div className="flex items-center justify-center h-16"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div></div>
        ) : findings?.length > 0 ? (
          <div className="space-y-3">
            {findings.map((f) => (
              <div key={f.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex flex-wrap items-start gap-3">
                  <span className={severityBadge(f.severity)}>{f.severity}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{serviceIcon(f.service)}</span>
                      <p className="font-medium text-gray-200">{f.title}</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{f.description}</p>
                    {f.remediation && (
                      <div className="mt-2 bg-gray-900/50 rounded px-3 py-2">
                        <p className="text-xs text-brand-400 font-medium mb-0.5">Remediation:</p>
                        <p className="text-xs text-gray-400">{f.remediation}</p>
                      </div>
                    )}
                    {f.resource && (
                      <p className="text-xs text-gray-500 mt-2">Resource: {f.resource.name || f.resource.awsId}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm text-center py-8">No findings match the current filters</p>
        )}
      </div>
    </div>
  );
}
