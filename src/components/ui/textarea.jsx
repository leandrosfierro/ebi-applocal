import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${className}`}
      {...props}
    />
  );
}
