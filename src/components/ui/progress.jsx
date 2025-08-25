import React from "react";

export function Progress({ value = 0 }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded">
      <div className="h-2 bg-slate-900 rounded" style={{ width: `${value}%` }} />
    </div>
  );
}
