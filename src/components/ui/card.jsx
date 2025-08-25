import React from "react";

export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>;
}
export function CardHeader({ children }) {
  return <div className="px-4 pt-4">{children}</div>;
}
export function CardTitle({ children, className = "" }) {
  return <h2 className={`font-semibold text-lg ${className}`}>{children}</h2>;
}
export function CardContent({ children, className = "" }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}
