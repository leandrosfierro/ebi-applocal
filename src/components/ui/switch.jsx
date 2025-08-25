import React from "react";

export function Switch({ checked, onCheckedChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={!!checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      />
      <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-slate-900 transition"></div>
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition peer-checked:translate-x-4"></div>
    </label>
  );
}
