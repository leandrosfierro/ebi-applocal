import React from 'react'
export function Badge({children,variant='default'}){
  const map={default:'bg-slate-900 text-white',secondary:'bg-slate-100 text-slate-800',outline:'border border-slate-300',destructive:'bg-red-600 text-white'}
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${map[variant]}`}>{children}</span>
}