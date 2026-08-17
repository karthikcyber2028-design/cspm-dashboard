import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Scans from "./pages/Scans";
import ScanDetail from "./pages/ScanDetail";
import Credentials from "./pages/Credentials";
import Alerts from "./pages/Alerts";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="resources" element={<Resources />} />
        <Route path="scans" element={<Scans />} />
        <Route path="scans/:id" element={<ScanDetail />} />
        <Route path="credentials" element={<Credentials />} />
        <Route path="alerts" element={<Alerts />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
