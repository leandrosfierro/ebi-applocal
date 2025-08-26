import React from 'react'
export function Card({children,className=''}){ return <div className={`card ${className}`}>{children}</div> }
export function CardHeader({children}){ return <div className="px-5 pt-5">{children}</div> }
export function CardTitle({children}){ return <h2 className="text-xl font-semibold">{children}</h2> }
export function CardContent({children}){ return <div className="px-5 pb-5">{children}</div> }