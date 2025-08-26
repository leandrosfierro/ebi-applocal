import React from 'react'
export function Button({ children, variant='default', className='', ...props }){
  const base='inline-flex items-center justify-center rounded-xl text-sm px-4 py-2 transition border';
  const map={ default:'bg-slate-900 text-white border-slate-900 hover:opacity-90',
    outline:'bg-white text-slate-900 border-slate-300 hover:bg-slate-50',
    ghost:'bg-transparent border-transparent hover:bg-slate-100' };
  return <button className={`${base} ${map[variant]||map.default} ${className}`} {...props}>{children}</button>
}