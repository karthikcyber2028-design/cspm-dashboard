export function severityBadge(severity) {
  const map = {
    CRITICAL: "badge-critical",
    HIGH: "badge-high",
    MEDIUM: "badge-medium",
    LOW: "badge-low",
    INFORMATIONAL: "badge-info",
  };
  return map[severity] || "badge-info";
}

export function severityColor(severity) {
  const map = {
    CRITICAL: "#ef4444",
    HIGH: "#f97316",
    MEDIUM: "#eab308",
    LOW: "#3b82f6",
    INFORMATIONAL: "#6b7280",
  };
  return map[severity] || "#6b7280";
}

export function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function serviceIcon(service) {
  const icons = { EC2: "🖥️", S3: "🪣", IAM: "👤", RDS: "🗃️", VPC: "🌐" };
  return icons[service] || "☁️";
}

export function truncate(str, len = 80) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}
