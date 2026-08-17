import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { alertAPI } from "../services/api";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/resources", label: "Resources", icon: "☁️" },
  { to: "/scans", label: "Scans", icon: "🔍" },
  { to: "/credentials", label: "AWS Keys", icon: "🔑" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCount = () => alertAPI.unreadCount().then((r) => setUnreadCount(r.data.count)).catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
          <div>
            <h1 className="text-sm font-bold text-white">CSPM</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Security Posture</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-600/20 text-brand-400" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {item.label === "Alerts" && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-brand-400">{user?.name?.[0] || "U"}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors py-1">Logout</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1" />
          <div className="text-xs text-gray-500 hidden sm:block">Cloud Security Posture Management</div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
