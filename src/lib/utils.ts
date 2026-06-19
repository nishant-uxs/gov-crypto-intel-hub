export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    POLICY: "bg-blue-100 text-blue-800",
    ENFORCEMENT: "bg-red-100 text-red-800",
    COMPLIANCE: "bg-green-100 text-green-800",
    SCAM: "bg-orange-100 text-orange-800",
    MARKET: "bg-purple-100 text-purple-800",
    INNOVATION: "bg-teal-100 text-teal-800",
    BLOCKCHAIN: "bg-indigo-100 text-indigo-800",
    CRYPTO_SCAM: "bg-rose-100 text-rose-800",
  };
  return colors[tag] || "bg-gray-100 text-gray-800";
}

export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    CRITICAL: "bg-critical text-white",
    HIGH: "bg-high text-white",
    MEDIUM: "bg-medium text-white",
    LOW: "bg-low text-white",
  };
  return colors[level] || "bg-gray-500 text-white";
}

export function getStanceColor(stance: string): string {
  const colors: Record<string, string> = {
    PERMISSIVE: "bg-green-100 text-green-800",
    REGULATED: "bg-blue-100 text-blue-800",
    RESTRICTIVE: "bg-orange-100 text-orange-800",
    BANNED: "bg-red-100 text-red-800",
  };
  return colors[stance] || "bg-gray-100 text-gray-800";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    COMPLIANT: "bg-green-100 text-green-800",
    "LARGELY COMPLIANT": "bg-blue-100 text-blue-800",
    "PARTIALLY COMPLIANT": "bg-yellow-100 text-yellow-800",
    "NON-COMPLIANT": "bg-red-100 text-red-800",
    INTRODUCED: "bg-yellow-100 text-yellow-800",
    "UNDER DISCUSSION": "bg-blue-100 text-blue-800",
    ENACTED: "bg-green-100 text-green-800",
    ONGOING: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    "IN-PROGRESS": "bg-blue-100 text-blue-800",
    PLANNED: "bg-gray-100 text-gray-800",
    PROPOSED: "bg-yellow-100 text-yellow-800",
    IMPLEMENTED: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / 86400000);
}
