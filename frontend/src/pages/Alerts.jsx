import { alertAPI } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { severityBadge, formatDate } from "../utils/helpers";
import { useState } from "react";

export default function Alerts() {
  const [showUnread, setShowUnread] = useState(false);
  const { data: alerts, loading, refetch } = useFetch(() => alertAPI.list({ unread: showUnread || undefined }), [showUnread]);

  const markRead = async (id) => {
    await alertAPI.markRead(id);
    refetch();
  };

  const markAllRead = async () => {
    await alertAPI.markAllRead();
    refetch();
  };

  const unreadCount = alerts?.filter((a) => !a.isRead).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-sm text-gray-500">Security alerts and notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUnread(!showUnread)} className="btn-secondary text-sm">{showUnread ? "Show All" : "Unread Only"}</button>
          {unreadCount > 0 && <button onClick={markAllRead} className="btn-secondary text-sm">Mark All Read</button>}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : alerts?.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${alert.isRead ? "bg-gray-800/20 border-gray-800/50 opacity-60" : "bg-gray-800/50 border-gray-700/50"}`}>
                <span className={severityBadge(alert.severity)}>{alert.severity}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-200">{alert.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(alert.createdAt)}</p>
                </div>
                {!alert.isRead && (
                  <button onClick={() => markRead(alert.id)} className="text-xs text-brand-400 hover:text-brand-300 whitespace-nowrap">Mark read</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg mb-2">No alerts</p>
            <p className="text-sm">Security alerts will appear here when issues are detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
