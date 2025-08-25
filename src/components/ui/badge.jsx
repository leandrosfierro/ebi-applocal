import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "bg-slate-900 text-white",
    secondary: "bg-gray-200 text-slate-800",
    outline: "border border-slate-300 text-slate-800",
    destructive: "bg-red-600 text-white",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${styles[variant] || styles.default} ${className}`}>{children}</span>;
}
