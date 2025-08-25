import React from "react";

export function Select({ children, onValueChange }) {
  // Simple wrapper; not fully functional Radix. For demo, render children.
  return <div className="border rounded-md p-2">{children}</div>;
}
export function SelectTrigger({ children }) {
  return <div className="text-sm text-slate-600">{children}</div>;
}
export function SelectValue({ placeholder }) {
  return <span className="text-slate-500">{placeholder || "seleccionar"}</span>;
}
export function SelectContent({ children }) {
  return <div className="mt-2 grid gap-1">{children}</div>;
}
export function SelectItem({ value, children }) {
  return <div className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer" data-value={value}>{children}</div>;
}
