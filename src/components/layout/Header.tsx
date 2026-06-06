import Link from "next/link";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-navy-700 bg-navy-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Government Crypto Intelligence Hub
            </h1>
            <p className="text-xs text-gray-400">
              Digital South Trust — Blockchain Centre of Excellence, Vellore
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">
            India Policy Advisory Platform
          </span>
          <Link
            href="/admin/login"
            className="btn-secondary text-sm flex items-center gap-1"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </header>
  );
}
