import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">S</div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your CSPM dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign in"}</button>
          <p className="text-center text-sm text-gray-500">No account? <Link to="/register" className="text-brand-400 hover:text-brand-300">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
