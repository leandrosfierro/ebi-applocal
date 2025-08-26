import React from 'react'
export function Switch({checked,onCheckedChange}){
  return (<label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={!!checked} onChange={e=>onCheckedChange?.(e.target.checked)} />
    <div className="w-12 h-7 bg-slate-300 rounded-full peer-checked:bg-slate-900 transition" />
    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transform transition peer-checked:translate-x-5" />
  </label>)
}