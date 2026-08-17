import { useState } from "react";
import { dashboardAPI } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { serviceIcon, formatDate } from "../utils/helpers";

export default function Resources() {
  const [filters, setFilters] = useState({ service: "", region: "", page: 1 });
  const { data, loading, refetch } = useFetch(() => dashboardAPI.resources(filters), [filters]);
  const { data: services } = useFetch(() => dashboardAPI.services());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AWS Resources</h1>
        <p className="text-sm text-gray-500">Discovered cloud resources across your accounts</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input w-auto" value={filters.service} onChange={(e) => setFilters({ ...filters, service: e.target.value, page: 1 })}>
          <option value="">All Services</option>
          {(services || []).map((s) => <option key={s.service} value={s.service}>{s.service} ({s.count})</option>)}
        </select>
        <input type="text" className="input w-auto" placeholder="Region filter..." value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value, page: 1 })} />
        <button onClick={() => setFilters({ service: "", region: "", page: 1 })} className="btn-secondary">Clear</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : data?.resources?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-800">
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Region</th>
                    <th className="pb-3 font-medium">Public</th>
                    <th className="pb-3 font-medium">Encrypted</th>
                    <th className="pb-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.resources.map((r) => (
                    <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3"><span className="mr-2">{serviceIcon(r.service)}</span>{r.service}</td>
                      <td className="py-3 text-gray-200 font-medium">{r.name || "—"}</td>
                      <td className="py-3 text-gray-500 font-mono text-xs">{r.awsId}</td>
                      <td className="py-3 text-gray-400">{r.region}</td>
                      <td className="py-3">{r.isPublic ? <span className="badge-high">Public</span> : <span className="badge-info">Private</span>}</td>
                      <td className="py-3">{r.isEncrypted === true ? <span className="badge-low">Yes</span> : r.isEncrypted === false ? <span className="badge-critical">No</span> : <span className="badge-info">—</span>}</td>
                      <td className="py-3 text-gray-500 text-xs">{r.resourceType || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })} disabled={filters.page === 1} className="btn-secondary text-xs">Prev</button>
                <span className="text-sm text-gray-500">Page {data.page} of {data.totalPages}</span>
                <button onClick={() => setFilters({ ...filters, page: Math.min(data.totalPages, filters.page + 1) })} disabled={filters.page === data.totalPages} className="btn-secondary text-xs">Next</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg mb-2">No resources found</p>
            <p className="text-sm">Run a scan to discover your AWS resources</p>
          </div>
        )}
      </div>
    </div>
  );
}
