'use client'
import React, { useState, useMemo, useRef } from 'react'
import { Bar, Radar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler)

const IconChevronLeft = () => <span>◀</span>
const IconChevronRight = () => <span>▶</span>
const IconDownload = () => <span className="mr-2">⬇</span>
const IconSave = () => <span className="mr-2">💾</span>
const IconClock = () => <span className="mr-1">🕒</span>
const IconRefresh = () => <span className="mr-2">🔄</span>

const DOMAINS = [
  { key: 'demografico', name: 'Datos Demográficos', icon: '👤' },
  { key: 'fisico', name: 'Bienestar Físico', icon: '🏃‍♂️' },
  { key: 'nutricional', name: 'Bienestar Nutricional', icon: '🍎' },
  { key: 'emocional', name: 'Bienestar Emocional', icon: '😊' },
  { key: 'sociocultural', name: 'Bienestar Socio-cultural', icon: '🤝' },
  { key: 'economico', name: 'Bienestar Económico', icon: '💰' },
  { key: 'familiar', name: 'Bienestar Familiar', icon: '👨‍👩‍👧‍👦' },
]

const SEED_DATA = {
  organization: { name: 'BS360', logo: 'https://placehold.co/150x50/003366/FFFFFF?text=BS360' },
  campaign: { name: 'EBI Demo - Septiembre 2025', anonymous: true },
  questions: [
    { id:'d1', domain:'demografico', text:'Género autopercibido', type:'select', options:['Masculino','Femenino','No binario','Prefiero no decirlo'] },
    { id:'d2', domain:'demografico', text:'Rango de edad', type:'select', options:['Menor de 25','25-34','35-44','45-54','55 o más'] },
    { id:'d3', domain:'demografico', text:'Área / Departamento', type:'text' },
    { id:'f1', domain:'fisico', text:'Realizo actividad física regularmente (al menos 3 veces por semana).', inverse:false },
    { id:'f2', domain:'fisico', text:'Mi descanso nocturno es reparador y suficiente.', inverse:false },
    { id:'f3', domain:'fisico', text:'Fumo o consumo tabaco con frecuencia.', inverse:true },
    { id:'f4', domain:'fisico', text:'Mi lugar de trabajo cuenta con condiciones físicas seguras y ergonómicas.', inverse:false },
    { id:'n1', domain:'nutricional', text:'Mi dieta es variada y equilibrada.', inverse:false },
    { id:'n2', domain:'nutricional', text:'Bebo suficiente agua durante el día.', inverse:false },
    { id:'n3', domain:'nutricional', text:'Generalmente, realizo las comidas principales de forma regular.', inverse:false },
    { id:'e1', domain:'emocional', text:'Siento energía y entusiasmo en mi día a día.', inverse:false },
    { id:'e2', domain:'emocional', text:'Manejo adecuadamente mis emociones frente a situaciones de estrés.', inverse:false },
    { id:'e3', domain:'emocional', text:'En el último tiempo, he sentido pánico o síntomas de burnout.', inverse:true },
    { id:'e4', domain:'emocional', text:'En general, estoy satisfecho/a con mi vida.', inverse:false },
    { id:'s1', domain:'sociocultural', text:'Siento que pertenezco y soy incluido/a en mi equipo de trabajo.', inverse:false },
    { id:'s2', domain:'sociocultural', text:'Encuentro un propósito en las tareas que realizo.', inverse:false },
    { id:'s3', domain:'sociocultural', text:'Existe un clima de apoyo mutuo y colaboración en mi entorno laboral.', inverse:false },
    { id:'ec1', domain:'economico', text:'Mis ingresos son suficientes para cubrir mis necesidades básicas y las de mi familia.', inverse:false },
    { id:'ec2', domain:'economico', text:'Me siento seguro/a respecto a mi estabilidad financiera futura.', inverse:false },
    { id:'ec3', domain:'economico', text:'Valoro los beneficios adicionales que ofrece la organización (seguro médico, capacitaciones, etc.).', inverse:false },
    { id:'fa1', domain:'familiar', text:'La dinámica en mi hogar es saludable y de apoyo.', inverse:false },
    { id:'fa2', domain:'familiar', text:'Dispongo de tiempo de calidad para compartir con mi familia y seres queridos.', inverse:false },
    { id:'fa3', domain:'familiar', text:'Las políticas de la organización facilitan la conciliación entre mi vida laboral y familiar.', inverse:false },
  ],
}

function ProgressBar({ current, total }:{current:number,total:number}){
  const percentage = (current/total)*100
  return <div className="w-full bg-gray-200 rounded-full h-2.5 my-4"><div className="bg-blue-600 h-2.5 rounded-full" style={{width:`${percentage}%`}}/></div>
}

function Likert({ questionId, value, onChange }:{questionId:string, value:number, onChange:(id:string,v:any)=>void}){
  const options = [
    { value:1, label:'Totalmente en desacuerdo' },
    { value:2, label:'En desacuerdo' },
    { value:3, label:'Ni de acuerdo ni en desacuerdo' },
    { value:4, label:'De acuerdo' },
    { value:5, label:'Totalmente de acuerdo' },
  ]
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-2 mt-4">
      {options.map(o=>(
        <label key={o.value} className="flex flex-col items-center space-y-2 cursor-pointer">
          <input type="radio" name={questionId} value={o.value} checked={value===o.value} onChange={()=>onChange(questionId,o.value)} className="h-5 w-5"/>
          <span className="text-sm text-center text-gray-600">{o.label}</span>
        </label>
      ))}
    </div>
  )
}

function QuestionCard({ question, answer, onChange }:{question:any, answer:any, onChange:(id:string,v:any)=>void}){
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-2">
      <p className="text-lg font-medium text-gray-800">{question.text}</p>
      {question.type==='select' ? (
        <select value={answer||''} onChange={(e)=>onChange(question.id, e.target.value)} className="mt-4 block w-full p-2 border rounded-md">
          <option value="" disabled>Seleccioná una opción</option>
          {question.options.map((opt:string)=><option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : question.type==='text' ? (
        <input value={answer||''} onChange={(e)=>onChange(question.id, e.target.value)} className="mt-4 block w-full p-2 border rounded-md"/>
      ) : (
        <Likert questionId={question.id} value={answer} onChange={onChange}/>
      )}
    </div>
  )
}

function getBand(score:number){
  if(score<=2.0) return { name:'alerta', color:'bg-red-500', textColor:'text-red-800', bgColor:'bg-red-100' }
  if(score<=3.0) return { name:'atencion', color:'bg-yellow-500', textColor:'text-yellow-800', bgColor:'bg-yellow-100' }
  if(score<=4.0) return { name:'aceptable', color:'bg-blue-500', textColor:'text-blue-800', bgColor:'bg-blue-100' }
  return { name:'optimo', color:'bg-green-500', textColor:'text-green-800', bgColor:'bg-green-100' }
}

function Results({ results, onRestart }:{results:any, onRestart:()=>void}){
  const { scores, strengths, opportunities, ibi } = results
  const reportRef = useRef<HTMLDivElement>(null)
  const ibiBand = getBand(ibi)

  const radarData = {
    labels: Object.keys(scores).map(key=>DOMAINS.find(d=>d.key===key)?.name),
    datasets:[{
      label:'Tu Bienestar',
      data: Object.values(scores),
      backgroundColor:'rgba(59,130,246,0.2)',
      borderColor:'rgba(59,130,246,1)',
      borderWidth:2,
      pointBackgroundColor:'rgba(59,130,246,1)',
      pointBorderColor:'#fff',
    }]
  }
  const radarOptions = { scales: { r: { suggestedMin:1, suggestedMax:5, ticks:{ stepSize:1 } } }, plugins:{ legend:{ display:false } } } as any

  const handleDownloadPdf = async () => {
    const input = reportRef.current
    if(!input){ alert('No se encontró el reporte'); return }
    const html2canvas = (window as any).html2canvas
    const jspdf = (window as any).jspdf
    if(!html2canvas || !jspdf){ alert('Faltan librerías PDF'); return }
    const canvas = await html2canvas(input, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jspdf.jsPDF('p','mm','a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const ratio = canvas.width/pdfWidth
    const imgHeight = canvas.height/ratio
    let heightLeft = imgHeight, position = 0
    pdf.addImage(imgData,'PNG',0,position,pdfWidth,imgHeight)
    heightLeft -= pdfHeight
    while(heightLeft>0){
      position -= pdfHeight
      pdf.addPage()
      pdf.addImage(imgData,'PNG',0,position,pdfWidth,imgHeight)
      heightLeft -= pdfHeight
    }
    pdf.save(`Reporte_EBI_${new Date().toISOString().slice(0,10)}.pdf`)
  }

  return (
    <>
      <div ref={reportRef} className="p-4 sm:p-8 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-800">Tu Reporte de Bienestar Individual</h2>
          <p className="text-gray-600 mt-2">Generado el {new Date().toLocaleDateString('es-AR')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className={`md:col-span-1 p-6 rounded-2xl shadow-lg flex flex-col items-center ${ibiBand.bgColor}`}>
            <h3 className={`text-xl font-bold ${ibiBand.textColor}`}>Índice de Bienestar Integral (IBI)</h3>
            <p className={`text-7xl font-extrabold my-4 ${ibiBand.textColor}`}>{ibi.toFixed(1)}</p>
            <span className={`px-4 py-1 rounded-full text-white font-semibold ${ibiBand.color}`}>{ibiBand.name}</span>
          </div>
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Radar de Dominios</h3>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-green-600 mb-4">✅ tus 3 fortalezas</h3>
            <ul className="space-y-3">{strengths.map((s:any)=>(
              <li key={s.domain} className="p-3 bg-green-50 rounded-lg">
                <strong className="text-green-800">{DOMAINS.find(d=>d.key===s.domain)?.name}:</strong>
                <span className="ml-2 text-gray-700">Puntaje {s.score.toFixed(1)}</span>
              </li>
            ))}</ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-yellow-600 mb-4">🎯 3 oportunidades</h3>
            <ul className="space-y-3">{opportunities.map((o:any)=>(
              <li key={o.domain} className="p-3 bg-yellow-50 rounded-lg">
                <strong className="text-yellow-800">{DOMAINS.find(d=>d.key===o.domain)?.name}:</strong>
                <span className="ml-2 text-gray-700">Puntaje {o.score.toFixed(1)}</span>
              </li>
            ))}</ul>
          </div>
        </div>
        <div className="mt-12 p-6 bg-gray-100 rounded-2xl text-sm text-gray-600">
          <h4 className="font-bold text-gray-800 mb-2">aviso importante</h4>
          <p>Este reporte es una herramienta de autoconocimiento y no reemplaza el diagnóstico de un profesional. Ante malestar, buscá ayuda.</p>
        </div>
      </div>
      <div className="mt-10 p-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onClick={handleDownloadPdf} className="flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold">
          <IconDownload/> Descargar mi Reporte en PDF
        </button>
        <button onClick={onRestart} className="flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 font-semibold">
          <IconRefresh/> Iniciar de nuevo
        </button>
      </div>
    </>
  )
}

function Survey({ onComplete }:{onComplete:(ans:any)=>void}){
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const surveyDomains = useMemo(()=>DOMAINS.filter(d=>d.key!=='ibi'),[])
  const currentDomainKey = surveyDomains[step]?.key
  const questionsForCurrentStep = useMemo(()=>SEED_DATA.questions.filter(q=>q.domain===currentDomainKey), [currentDomainKey])

  const handleAnswerChange = (id:string, value:any)=> setAnswers(p=>({...p,[id]:value}))
  const areCurrentAnswered = ()=> questionsForCurrentStep.every(q=> answers[q.id]!==undefined && answers[q.id] !== '')
  const areAllAnswered = ()=> SEED_DATA.questions.filter(q=>q.domain!=='ibi').every(q=> answers[q.id]!==undefined && answers[q.id] !== '')

  const nextStep = ()=> { if(areCurrentAnswered()) setStep(s=>Math.min(s+1, surveyDomains.length)); else alert('Ups, te falta responder.'); }
  const prevStep = ()=> setStep(s=>Math.max(s-1,0))
  const handleSubmit = ()=> { if(areAllAnswered()) onComplete(answers); else alert('Faltan respuestas.'); }

  if(step===surveyDomains.length){
    return (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">¡ya casi terminamos!</h2>
        <p className="text-gray-600 mb-8">revisá tus respuestas o envialas.</p>
        <button onClick={handleSubmit} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg">enviar mis respuestas</button>
        <button onClick={prevStep} className="mt-4 w-full sm:w-auto text-gray-600 py-2 px-6">volver</button>
      </div>
    )
  }

  const currentDomain = surveyDomains[step]
  return (
    <div>
      <div className="p-4 bg-gray-50 rounded-t-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800">{currentDomain.icon} {currentDomain.name}</h2>
        <ProgressBar current={step+1} total={surveyDomains.length+1} />
      </div>
      <div className="p-6">
        {questionsForCurrentStep.map(q=>(
          <QuestionCard key={q.id} question={q} answer={answers[q.id]} onChange={handleAnswerChange}/>
        ))}
      </div>
      <div className="flex justify-between items-center p-6 bg-gray-50 rounded-b-2xl">
        <button onClick={prevStep} disabled={step===0} className="flex items-center px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold disabled:opacity-50"><IconChevronLeft/> Anterior</button>
        <div className="flex gap-2">
          <button onClick={()=>alert('Progreso guardado (demo)')} className="flex items-center px-4 py-2 rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 font-semibold"><IconSave/> Guardar y seguir después</button>
          <button onClick={nextStep} className="flex items-center px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold">Siguiente <IconChevronRight/></button>
        </div>
      </div>
    </div>
  )
}

export default function Page(){
  const [view, setView] = useState<'welcome'|'survey'|'results'|'admin'>('welcome')
  const [results, setResults] = useState<any>(null)

  const handleSurveyComplete = (answers:Record<string, any>)=>{
    const scores: Record<string, number> = {}
    const likertDomains = DOMAINS.filter(d=>d.key!=='demografico' && d.key!=='ibi').map(d=>d.key)
    for(const domain of likertDomains){
      const qs = SEED_DATA.questions.filter(q=>q.domain===domain)
      let total = 0
      for(const q of qs){
        let v = Number(answers[q.id])
        if(q.inverse) v = 6 - v
        total += v
      }
      scores[domain] = total/qs.length
    }
    const ibi = Object.values(scores).reduce((s,v)=>s+v,0)/Object.values(scores).length
    const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1])
    const strengths = sorted.slice(0,3).map(([domain,score])=>({domain,score}))
    const opportunities = sorted.slice(-3).reverse().map(([domain,score])=>({domain,score}))
    setResults({ scores, ibi, strengths, opportunities })
    setView('results')
  }

  const callAI = async ()=>{
    if(!results){ alert('Primero completá la encuesta'); return }
    const res = await fetch('/api/ai/coach', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ scores: results?.scores, ibi: results?.ibi }) })
    const data = await res.json()
    alert(data.text || 'sin respuesta')
  }

  const renderView = ()=>{
    switch(view){
      case 'survey': return <Survey onComplete={handleSurveyComplete}/>
      case 'results': return <Results results={results} onRestart={()=>{ setResults(null); setView('welcome') }}/>
      case 'admin': return <div className="p-6">Dashboard demo (conectar a /api/dashboards/campaign/:id)</div>
      default: return (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full">
          <img src={SEED_DATA.organization.logo} alt="Logo" className="h-16 mb-6"/>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Encuesta de Bienestar Individual</h2>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">Conocé tu bienestar y su impacto en el trabajo. Completá la EBI en aproximadamente <IconClock/> 8-10 minutos.</p>
          <div className="flex gap-3">
            <button onClick={()=>setView('survey')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg">Comenzar Encuesta</button>
            {results && <button onClick={callAI} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg">Sugerencias IA</button>}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <img src={SEED_DATA.organization.logo} alt="Logo de la Organización" className="h-10" />
        <h1 className="text-xl font-semibold text-gray-700 hidden sm:block">{SEED_DATA.campaign.name}</h1>
      </header>
      <div className="p-2 bg-yellow-200 text-center text-sm text-yellow-800">
        <strong>vista demo:</strong>
        <button onClick={()=>setView('welcome')} className={`ml-2 px-2 py-1 rounded ${view==='welcome'?'bg-blue-600 text-white':''}`}>Inicio</button>
        <button onClick={()=>setView('admin')} className={`ml-2 px-2 py-1 rounded ${view==='admin'?'bg-blue-600 text-white':''}`}>Admin</button>
      </div>
      <main className="container mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {renderView()}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} BS360. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
