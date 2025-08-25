import React, {useMemo, useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Switch} from '@/components/ui/switch'
import {Badge} from '@/components/ui/badge'
import {Progress} from '@/components/ui/progress'
import {Info, Shield, ChevronLeft, ChevronRight} from 'lucide-react'
import {RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer} from 'recharts'

const LIKERT=[1,2,3,4,5]
const BANDAS=[{id:'alerta',min:1,max:2,label:'alerta',badge:'destructive'},
{id:'atencion',min:2.1,max:3,label:'atención',badge:'secondary'},
{id:'aceptable',min:3.1,max:4,label:'aceptable',badge:'outline'},
{id:'optimo',min:4.1,max:5,label:'óptimo',badge:'default'}]
const bandaDe=v=>BANDAS.find(b=>v>=b.min&&v<=b.max)||BANDAS[0]
const invertLikert=v=>({1:5,2:4,3:3,4:2,5:1})[v]||v

const QUESTIONS={
  fisico:[
    {id:'f1',text:'duermo lo suficiente para sentirme descansado/a',inverse:false,coachLow:'probá higiene del sueño: horarios regulares, menos pantallas 1h antes y ambiente oscuro.'},
    {id:'f2',text:'hago actividad física al menos 3 veces por semana',inverse:false,coachLow:'agendá 3 bloques de 20–30 min/semana. caminata rápida ya suma.'},
    {id:'f3',text:'consumo tabaco / sustancias con frecuencia',inverse:true,coachLow:'si querés reducir, probá regla 1%: pequeños recortes progresivos + apoyo profesional si lo necesitás.'},
    {id:'f4',text:'mi puesto de trabajo es físicamente seguro',inverse:false,coachLow:'si detectás riesgos, registralos y pedí mejoras (ergonomía, pausas activas).'},
  ],
  nutricional:[
    {id:'n1',text:'tengo una alimentación variada y regular',inverse:false,coachLow:'planificá 3 comidas + 2 colaciones. empezá por sumar 1 fruta diaria.'},
    {id:'n2',text:'bebo agua suficiente durante el día',inverse:false,coachLow:'lleva botella y definí un objetivo simple: 8 vasos/día o 2 botellas.'},
    {id:'n3',text:'suelo saltear comidas importantes',inverse:true,coachLow:'poné recordatorios y dejá opciones rápidas a mano (yogur, frutos secos).'},
    {id:'n4',text:'me siento satisfecho/a con mi alimentación actual',inverse:false,coachLow:'elegí 1 mejora semanal (menos ultra-procesados o más verduras).'},
  ],
  emocional:[
    {id:'e1',text:'me siento con energía y entusiasmo la mayor parte del tiempo',inverse:false,coachLow:'check de energía: 3 micro-pausas/día y respiración 4-7-8.'},
    {id:'e2',text:'suelo sentir ansiedad intensa / pánico',inverse:true,coachLow:'si aparece, anclate a la respiración + contacto profesional si persiste.'},
    {id:'e3',text:'tengo herramientas para gestionar mis emociones',inverse:false,coachLow:'probá journaling 5 min + identificar 1 emoción/día.'},
    {id:'e4',text:'me siento satisfecho/a con mi vida en general',inverse:false,coachLow:'definí una micro-meta semanal alineada a lo que te importa.'},
  ],
  sociocultural:[
    {id:'s1',text:'me siento incluido/a y con sentido de pertenencia en el equipo',inverse:false,coachLow:'proponé un ritual breve de agradecimientos al cierre de semana.'},
    {id:'s2',text:'cuento con apoyo de colegas y líderes cuando lo necesito',inverse:false,coachLow:'pedí 1 feedback específico esta semana; ofrecé ayuda a alguien.'},
    {id:'s3',text:'participo en actividades sociales o comunitarias',inverse:false,coachLow:'bloqueá 1 actividad social/mes que disfrutes.'},
    {id:'s4',text:'percibo un buen clima laboral',inverse:false,coachLow:'si hay tensiones, registrá hechos y buscá una conversación cuidada.'},
  ],
  economico:[
    {id:'ec1',text:'mis ingresos cubren mis necesidades con previsibilidad',inverse:false,coachLow:'armá una planilla simple de gastos fijos/variables (7 días).'},
    {id:'ec2',text:'conozco y aprovecho beneficios / convenios',inverse:false,coachLow:'revisá beneficios vigentes y elegí 1 para usar este mes.'},
    {id:'ec3',text:'mi situación financiera me genera estrés frecuente',inverse:true,coachLow:'definí un % de ahorro automático o tope de gastos variables.'},
    {id:'ec4',text:'tengo hábitos de educación financiera básicos',inverse:false,coachLow:'mirá 1 micro-curso de 20 min y aplicá una idea.'},
  ],
  familiar:[
    {id:'fa1',text:'disfruto de vínculos familiares sanos y de apoyo mutuo',inverse:false,coachLow:'agendá 1 momento de calidad (sin pantallas) esta semana.'},
    {id:'fa2',text:'cuento con tiempo de calidad con mi familia',inverse:false,coachLow:'definí un bloque no negociable/semana.'},
    {id:'fa3',text:'los conflictos familiares afectan mi bienestar a menudo',inverse:true,coachLow:'si aparece conflicto, probá técnica “yo-mensaje” y escucha activa.'},
    {id:'fa4',text:'mi organización facilita equilibrio vida-trabajo',inverse:false,coachLow:'consultá políticas de flexibilidad o alternativas de organización.'},
  ],
}

const DOMAINS=[
  {key:'fisico',label:'físico'},
  {key:'nutricional',label:'nutricional'},
  {key:'emocional',label:'emocional'},
  {key:'sociocultural',label:'socio-cultural'},
  {key:'economico',label:'económico'},
  {key:'familiar',label:'familiar'},
]

const avg = arr => {
  const vals = arr.filter(v=>typeof v==='number')
  if(!vals.length) return 0
  return +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)
}

export default function App(){
  const [step,setStep]=useState(0) // 0 bienvenida, 1..6 dominios, 7 ibi, 8 resultados
  const [consent,setConsent]=useState(false)
  const [anonymous,setAnonymous]=useState(true)
  const [ibiAuto,setIbiAuto]=useState(0)
  const [answers,setAnswers]=useState({}) // {questionId:number}
  const [org,setOrg]=useState('Individual – bs360')
  const [camp,setCamp]=useState('ebi personal')

  const totalQuestions = DOMAINS.reduce((acc,d)=>acc+QUESTIONS[d.key].length,0)
  const answeredCount = Object.values(answers).filter(v=>typeof v==='number').length
  const progress = Math.round((answeredCount/totalQuestions)*100)

  const domainScores = useMemo(()=>{
    const out={}
    for(const d of DOMAINS){
      const vals=QUESTIONS[d.key].map(q=>{
        const raw=answers[q.id]
        if(raw==null) return undefined
        return q.inverse?invertLikert(raw):raw
      })
      out[d.key]=avg(vals)
    }
    return out
  },[answers])

  const ibi = useMemo(()=>avg(DOMAINS.map(d=>domainScores[d.key])),[domainScores])
  const radarData = DOMAINS.map(d=>({domain:d.label,score:domainScores[d.key]||0}))

  const setLikert=(qid,val)=> setAnswers(s=>({...s,[qid]:val}))

  const currentDomain = DOMAINS[step-1]?.key
  const currentQuestions = currentDomain?QUESTIONS[currentDomain]:[]

  const allAnsweredCurrent = currentQuestions.every(q=>typeof answers[q.id]==='number')

  // Per-answer inline coach: when selecting a value <=2 (or inverse mapped), show tip
  const coachFor = (q)=>{
    const v = answers[q.id]
    if(v==null) return null
    const score = q.inverse?invertLikert(v):v
    if(score<=2) return q.coachLow
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="container py-6">
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">EBI</div>
            <div>
              <h1 className="text-2xl font-bold">encuesta de bienestar individual · ebi</h1>
              <p className="text-sm text-slate-500">bs360 · asistida por ia · wizard paso a paso</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16}/><span className="text-sm">campaña anónima</span>
            <Switch checked={anonymous} onCheckedChange={setAnonymous}/>
          </div>
        </div>

        {/* progress */}
        <Card className="mb-5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>avance</span><span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress}/>
          </CardContent>
        </Card>

        {/* wizard steps */}
        <div className="space-y-5">
          {step===0 && (
            <div className="grid gap-5">
              <Card>
                <CardHeader><CardTitle>bienvenida</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">
                    conocé tu bienestar integral y su impacto en el trabajo. tus respuestas son confidenciales. {anonymous?'en esta campaña los resultados son anónimos.':'los resultados se verán en agregados por segmento.'}
                  </p>
                  <div className="flex items-center gap-3">
                    <Switch checked={consent} onCheckedChange={setConsent}/>
                    <span className="text-sm">doy mi consentimiento informado</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={org} onChange={e=>setOrg(e.target.value)} placeholder="organización"/>
                    <Input value={camp} onChange={e=>setCamp(e.target.value)} placeholder="nombre de campaña"/>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Info size={16}/><span>duración estimada: 8–10 minutos</span>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={()=>setStep(1)} disabled={!consent}>comenzar</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step>=1 && step<=6 && (
            <div className="grid gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>{DOMAINS[step-1].label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentQuestions.map((q,idx)=>(
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm">{idx+1}. {q.text}</p>
                        {q.inverse && <Badge variant="secondary">ítem inverso</Badge>}
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {LIKERT.map(v=>(
                          <Button key={v}
                                  variant={answers[q.id]===v?'primary':'outline'}
                                  onClick={()=>setLikert(q.id,v)}
                                  className="px-3 py-1.5">
                            {v}
                          </Button>
                        ))}
                      </div>
                      {/* inline AI coach */}
                      {coachFor(q) && (
                        <div className="mt-3 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <span className="font-medium">coach (ia): </span>{coachFor(q)}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" onClick={()=>setStep(step-1)} className="gap-1"><ChevronLeft size={16}/>anterior</Button>
                    <Button onClick={()=>setStep(step+1)} disabled={!allAnsweredCurrent} className="gap-1">siguiente<ChevronRight size={16}/></Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step===7 && (
            <Card>
              <CardHeader><CardTitle>índice de bienestar integral (autopercepción)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">elegí un valor de 1 a 5 que represente tu bienestar integral actual.</p>
                <div className="flex gap-2">
                  {LIKERT.map(v=>(
                    <Button key={v} variant={ibiAuto===v?'primary':'outline'} onClick={()=>setIbiAuto(v)}>{v}</Button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={()=>setStep(6)} className="gap-1"><ChevronLeft size={16}/>anterior</Button>
                  <Button onClick={()=>setStep(8)} disabled={!ibiAuto}>ver resultados<ChevronRight size={16}/></Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step===8 && (
            <div className="grid gap-5">
              <Card>
                <CardHeader><CardTitle>resultados</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="card p-4">
                      <p className="text-sm text-slate-500">ibi global</p>
                      <div className="text-4xl font-bold">{ibi||0}</div>
                      <Badge variant={bandaDe(ibi||0).badge}>{bandaDe(ibi||0).label}</Badge>
                    </div>
                    <div className="card p-4">
                      <p className="text-sm text-slate-500">autopercepción</p>
                      <div className="text-4xl font-bold">{ibiAuto||0}</div>
                      <Badge variant={bandaDe(ibiAuto||0).badge}>{bandaDe(ibiAuto||0).label}</Badge>
                    </div>
                    <div className="card p-4">
                      <p className="text-sm text-slate-500">brecha</p>
                      <div className="text-4xl font-bold">{Math.abs((ibi||0)-(ibiAuto||0)).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="card p-4" style={{height:320}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius={110}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="domain" />
                        <PolarRadiusAxis angle={30} domain={[0,5]} />
                        <Radar name="puntaje" dataKey="score" stroke="#0f172a" fill="#0f172a" fillOpacity={0.25}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button onClick={()=>window.location.reload()} variant="outline">nueva respuesta</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} bs360 · ebi (prototipo). hechos con ❤ en córdoba, ar.</footer>
      </div>
    </div>
  )
}
