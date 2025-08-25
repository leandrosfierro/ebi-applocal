import React from "react";

export function Button({ children, className = "", variant = "default", size = "md", ...props }) {
  const base = "px-3 py-2 rounded-md border text-sm font-medium shadow-sm transition";
  const variants = {
    default: "bg-slate-900 text-white hover:opacity-90 border-slate-900",
    outline: "bg-white text-slate-900 hover:bg-gray-50 border-slate-200",
    ghost: "bg-transparent text-slate-700 hover:bg-gray-100 border-transparent",
  };
  const sizes = { sm: "px-2 py-1 text-xs", md: "", lg: "px-4 py-3 text-base" };
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${sizes[size] || ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
