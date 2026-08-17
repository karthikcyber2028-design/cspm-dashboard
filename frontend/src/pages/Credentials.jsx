import { useState } from "react";
import { awsAPI } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { formatDate } from "../utils/helpers";

export default function Credentials() {
  const { data: credentials, loading, refetch } = useFetch(() => awsAPI.getCredentials());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", accessKeyId: "", secretAccessKey: "", region: "us-east-1" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addCredential = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await awsAPI.addCredential(form);
      setForm({ label: "", accessKeyId: "", secretAccessKey: "", region: "us-east-1" });
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add credential");
    } finally {
      setSaving(false);
    }
  };

  const deleteCredential = async (id, label) => {
    if (!confirm(`Delete credential "${label}"?`)) return;
    await awsAPI.deleteCredential(id);
    refetch();
  };

  const regions = ["us-east-1","us-east-2","us-west-1","us-west-2","eu-west-1","eu-west-2","eu-central-1","ap-southeast-1","ap-southeast-2","ap-northeast-1","sa-east-1","ca-central-1"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AWS Credentials</h1>
          <p className="text-sm text-gray-500">Manage AWS account access for security scanning</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? "Cancel" : "+ Add Account"}</button>
      </div>

      {showForm && (
        <form onSubmit={addCredential} className="card space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Label</label>
              <input className="input" placeholder="e.g. Production Account" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Region</label>
              <select className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Access Key ID</label>
              <input className="input font-mono text-sm" placeholder="AKIA..." value={form.accessKeyId} onChange={(e) => setForm({ ...form, accessKeyId: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Secret Access Key</label>
              <input type="password" className="input font-mono text-sm" placeholder="••••••••" value={form.secretAccessKey} onChange={(e) => setForm({ ...form, secretAccessKey: e.target.value })} required />
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs px-4 py-2 rounded-lg">
            Credentials are encrypted at rest and only used for read-only security scanning.
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Adding..." : "Add Credential"}</button>
          </div>
        </form>
      )}

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : credentials?.length > 0 ? (
          <div className="space-y-3">
            {credentials.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold">A</div>
                  <div>
                    <p className="font-medium text-gray-200">{c.label}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-mono">{c.accessKeyId}</span>
                      <span>•</span>
                      <span>{c.region}</span>
                      {c.accountNumber && <><span>•</span><span>Acct: {c.accountNumber}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-gray-500">
                    {c.lastScannedAt ? <span>Last scanned: {formatDate(c.lastScannedAt)}</span> : <span>Never scanned</span>}
                  </div>
                  <button onClick={() => deleteCredential(c.id, c.label)} className="text-gray-600 hover:text-red-400 transition-colors text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg mb-2">No AWS credentials configured</p>
            <p className="text-sm">Add your first AWS account to start scanning</p>
          </div>
        )}
      </div>
    </div>
  );
}
