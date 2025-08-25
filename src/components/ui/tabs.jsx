import React, { useState } from "react";

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);
  const ctx = { value, setValue };
  return <div className={className}>{React.Children.map(children, (c) => React.cloneElement(c, { __tabs: ctx }))}</div>;
}

export function TabsList({ children, __tabs }) {
  return <div className="inline-flex gap-2 border rounded-md p-1">{React.Children.map(children, (c) => React.cloneElement(c, { __tabs }))}</div>;
}

export function TabsTrigger({ value, children, __tabs }) {
  const active = __tabs?.value === value;
  return (
    <button
      className={`px-2 py-1 rounded text-sm ${active ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
      onClick={() => __tabs?.setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, __tabs, className = "" }) {
  if (__tabs?.value !== value) return null;
  return <div className={`mt-2 ${className}`}>{children}</div>;
}
