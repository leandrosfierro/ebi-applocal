import React from "react";

export function Alert({ children, className = "" }) {
  return <div className={`border border-slate-200 rounded-md p-3 ${className}`}>{children}</div>;
}
export function AlertTitle({ children }) {
  return <div className="font-semibold mb-1">{children}</div>;
}
export function AlertDescription({ children }) {
  return <div className="text-sm text-slate-600">{children}</div>;
}
