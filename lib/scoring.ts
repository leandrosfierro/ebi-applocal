export type Band = 'alerta'|'atencion'|'aceptable'|'optimo'
export const bandFor = (score:number): Band => (score<=2?'alerta':score<=3?'atencion':score<=4?'aceptable':'optimo')
export const mapLikert = (value:number, inverse?:boolean) => inverse ? 6 - value : value
export const calcDomain = (values:number[]) => {
  const v = values.filter(x=>x!=null)
  if(!v.length) return 0
  return Math.round((v.reduce((a,b)=>a+b,0)/v.length)*100)/100
}
export const calcIBI = (domains:Record<string, number>) => {
  const vals = Object.values(domains)
  if(!vals.length) return 0
  return Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*100)/100
}
