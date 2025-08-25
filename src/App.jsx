import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Sparkles, Download, BarChart, Shield, Users } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// ---------------------------------------------
// EBI – Encuesta de Bienestar Individual (Prototipo Canvas)
// ---------------------------------------------
// • Single-file React component ready to preview in Canvas.
// • UI tailwind + shadcn/ui + recharts.
// • Sin backend: guarda en estado local; ideal para demo y validación UX.
// • Incluye lógica de puntajes, banda de color, y un "coach IA" (heurístico) como placeholder
//   para integrar un modelo LLM (recomendaciones por dominio según puntajes bajos).
// • Estructura de dominios y ejemplos de ítems (Likert 1–5). Marcar inverse: true cuando aplique.
// • Adaptable a plantillas reales: reemplazar QUESTIONS con la base completa.

// Likert labels (AR, tono claro)
const LIKERT = [
  { v: 1, l: "1 · totalmente en desacuerdo" },
  { v: 2, l: "2 · en desacuerdo" },
  { v: 3, l: "3 · ni acuerdo ni desacuerdo" },
  { v: 4, l: "4 · de acuerdo" },
  { v: 5, l: "5 · totalmente de acuerdo" },
];

// Paleta de bandas (configurable)
const BANDAS = [
  { id: "alerta", min: 1.0, max: 2.0, label: "alerta", badge: "destructive" },
  { id: "atencion", min: 2.1, max: 3.0, label: "atención", badge: "secondary" },
  { id: "aceptable", min: 3.1, max: 4.0, label: "aceptable", badge: "outline" },
  { id: "optimo", min: 4.1, max: 5.0, label: "óptimo", badge: "default" },
];

function bandaDe(valor) {
  for (const b of BANDAS) if (valor >= b.min && valor <= b.max) return b;
  // Fallback
  return BANDAS[0];
}

// ---------------------------------------------
// Estructura de preguntas (demo). Reemplazar con base completa.
// Campo inverse: true si el enunciado es negativo (se invierte 1↔5, 2↔4, 3=3)
// ---------------------------------------------
const QUESTIONS = {
  demograficos: [
    { id: "edad", type: "number", label: "edad (opcional)", required: false },
    { id: "genero", type: "select", label: "género (autopercibido, opcional)", options: ["femenino", "masculino", "no binarie", "prefiero no decir"], required: false },
    { id: "area", type: "text", label: "área / equipo (opcional)", required: false },
  ],
  fisico: [
    { id: "f1", text: "duermo lo suficiente para sentirme descansado/a", inverse: false },
    { id: "f2", text: "hago actividad física al menos 3 veces por semana", inverse: false },
    { id: "f3", text: "consumo tabaco / sustancias con frecuencia", inverse: true },
    { id: "f4", text: "mi puesto de trabajo es físicamente seguro", inverse: false },
  ],
  nutricional: [
    { id: "n1", text: "tengo una alimentación variada y regular", inverse: false },
    { id: "n2", text: "bebo agua suficiente durante el día", inverse: false },
    { id: "n3", text: "suelo saltear comidas importantes", inverse: true },
    { id: "n4", text: "me siento satisfecho/a con mi alimentación actual", inverse: false },
  ],
  emocional: [
    { id: "e1", text: "me siento con energía y entusiasmo la mayor parte del tiempo", inverse: false },
    { id: "e2", text: "suelo sentir ansiedad intensa / pánico", inverse: true },
    { id: "e3", text: "tengo herramientas para gestionar mis emociones", inverse: false },
    { id: "e4", text: "me siento satisfecho/a con mi vida en general", inverse: false },
  ],
  sociocultural: [
    { id: "s1", text: "me siento incluido/a y con sentido de pertenencia en el equipo", inverse: false },
    { id: "s2", text: "cuento con apoyo de colegas y líderes cuando lo necesito", inverse: false },
    { id: "s3", text: "participo en actividades sociales o comunitarias", inverse: false },
    { id: "s4", text: "percibo un buen clima laboral", inverse: false },
  ],
  economico: [
    { id: "ec1", text: "mis ingresos cubren mis necesidades con previsibilidad", inverse: false },
    { id: "ec2", text: "conozco y aprovecho beneficios / convenios de la organización", inverse: false },
    { id: "ec3", text: "mi situación financiera me genera estrés frecuente", inverse: true },
    { id: "ec4", text: "tengo hábitos de educación financiera básicos", inverse: false },
  ],
  familiar: [
    { id: "fa1", text: "disfruto de vínculos familiares sanos y de apoyo mutuo", inverse: false },
    { id: "fa2", text: "cuento con tiempo de calidad con mi familia", inverse: false },
    { id: "fa3", text: "los conflictos familiares afectan mi bienestar a menudo", inverse: true },
    { id: "fa4", text: "mi organización facilita equilibrio vida-trabajo", inverse: false },
  ],
};

// Orden de dominios para UI / cálculos
const DOMAINS = [
  { key: "fisico", label: "físico" },
  { key: "nutricional", label: "nutricional" },
  { key: "emocional", label: "emocional" },
  { key: "sociocultural", label: "socio-cultural" },
  { key: "economico", label: "económico" },
  { key: "familiar", label: "familiar" },
];

// Inversión de escala para ítems negativos
function invertLikert(v) {
  if (v === undefined || v === null) return v;
  const map = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 };
  return map[v] ?? v;
}

// Coach IA (placeholder): genera micro-acciones en base a dominios con puntaje < umbral
function aiCoachSugerencias(scores, umbral = 3.0) {
  const tips = [];
  if (scores.fisico < umbral) tips.push("físico: probá pausas activas de 3–5 min cada 90 min, y establecé una rutina de sueño consistente (7–8 hs).");
  if (scores.nutricional < umbral) tips.push("nutricional: llevá una botella y establecé metas de hidratación (8 vasos); planificá 3 comidas + 2 colaciones.");
  if (scores.emocional < umbral) tips.push("emocional: técnica 4-7-8 de respiración, journaling 5 minutos y acordar un check-in semanal con alguien de confianza.");
  if (scores.sociocultural < umbral) tips.push("socio-cultural: proponé un espacio breve de retrospectiva/agradecimientos al cierre de la semana.");
  if (scores.economico < umbral) tips.push("económico: registrá gastos 7 días y definí 1 hábito: % de ahorro automático o tope de gastos variables.");
  if (scores.familiar < umbral) tips.push("familiar: agendá 1 bloque no negociable de tiempo de calidad y pedí flexibilidad si la política lo permite.");
  return tips;
}

// Util para promedio con manejo de vacíos
function avg(arr) {
  const vals = arr.filter((v) => typeof v === "number");
  if (!vals.length) return 0;
  const s = vals.reduce((a, b) => a + b, 0);
  return +(s / vals.length).toFixed(2);
}

export default function EBIApp() {
  // Estado general
  const [step, setStep] = useState(0); // 0 bienvenida, 1 demográficos, 2.. dominios, 99 resumen
  const [orgName, setOrgName] = useState("demo – bs360");
  const [campaignName, setCampaignName] = useState("ebi · prueba piloto");
  const [anonymous, setAnonymous] = useState(true);
  const [consent, setConsent] = useState(false);
  const [ibiAuto, setIbiAuto] = useState(0); // autocalificación final 1–5

  // Respuestas por dominio
  const [answers, setAnswers] = useState({}); // { [questionId]: number }
  const totalItems = useMemo(
    () => DOMAINS.reduce((acc, d) => acc + QUESTIONS[d.key].length, 0),
    []
  );
  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => typeof v === "number").length,
    [answers]
  );

  // Cálculos por dominio
  const domainScores = useMemo(() => {
    const out = {};
    for (const d of DOMAINS) {
      const items = QUESTIONS[d.key];
      const vals = items.map((q) => {
        const raw = answers[q.id];
        if (raw === undefined) return undefined;
        return q.inverse ? invertLikert(raw) : raw;
      });
      out[d.key] = avg(vals);
    }
    return out;
  }, [answers]);

  const ibi = useMemo(() => {
    const vals = DOMAINS.map((d) => domainScores[d.key]);
    const global = avg(vals);
    return global;
  }, [domainScores]);

  const progress = Math.round((answeredCount / totalItems) * 100);

  // Datos para gráficos
  const radarData = DOMAINS.map((d) => ({
    domain: d.label,
    score: domainScores[d.key] || 0,
  }));

  const barData = DOMAINS.map((d) => ({
    domain: d.label,
    score: domainScores[d.key] || 0,
  }));

  // Sugerencias IA
  const aiTips = useMemo(() => aiCoachSugerencias(domainScores, 3.1), [domainScores]);

  // Handlers
  const setLikert = (qid, value) => setAnswers((s) => ({ ...s, [qid]: value }));

  const allDomainAnswered = (key) => {
    return QUESTIONS[key].every((q) => typeof answers[q.id] === "number");
  };

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => Math.max(0, s - 1));

  // UI Helpers
  const SectionHeader = ({ title, subtitle, icon }) => (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {icon}
    </div>
  );

  const LikertRow = ({ q }) => (
    <div className="py-3 border-b last:border-b-0">
      <p className="mb-2">{q.text}</p>
      <div className="flex flex-wrap gap-2">
        {LIKERT.map((o) => (
          <Button
            key={o.v}
            variant={answers[q.id] === o.v ? "default" : "outline"}
            size="sm"
            onClick={() => setLikert(q.id, o.v)}
            className="whitespace-normal"
            title={o.l}
          >
            {o.v}
          </Button>
        ))}
        {q.inverse && <Badge variant="secondary" className="ml-2">ítem inverso</Badge>}
      </div>
    </div>
  );

  const DomainBlock = ({ domainKey, label }) => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-4 h-4" /> {label}
          {domainScores[domainKey] > 0 && (
            <Badge className="ml-2" variant={bandaDe(domainScores[domainKey]).badge}>
              {domainScores[domainKey]}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {QUESTIONS[domainKey].map((q) => (
          <LikertRow key={q.id} q={q} />
        ))}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            completado: {QUESTIONS[domainKey].filter((q) => typeof answers[q.id] === "number").length}/{QUESTIONS[domainKey].length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={prev} disabled={step <= 2}>anterior</Button>
            <Button onClick={next} disabled={!allDomainAnswered(domainKey)}>siguiente</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">EBI</div>
            <div>
              <h1 className="text-2xl font-bold">encuesta de bienestar individual · ebi</h1>
              <p className="text-sm text-muted-foreground">bs360 · prototipo interactivo (canvas)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4" />
            <span className="text-sm">campaña anónima</span>
            <Switch checked={anonymous} onCheckedChange={setAnonymous} />
          </div>
        </header>

        {/* barra de progreso */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">avance</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* columna izquierda: navegación y contexto */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>campaña</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="organización" />
                <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="nombre de campaña" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <span>duración estimada: 8–10 minutos</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4"/>coach de bienestar (ia)</CardTitle>
              </CardHeader>
              <CardContent>
                {aiTips.length ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {aiTips.map((t, i) => (<li key={i}>{t}</li>))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">cuando completes algunos dominios, vas a ver sugerencias personalizadas acá.</p>
                )}
                <Alert className="mt-3">
                  <AlertTitle>nota</AlertTitle>
                  <AlertDescription>
                    este coach es heurístico para demo. en producción, conectá un llm (openai/vertex/etc.) enviando solo promedios por dominio (respetando anonimato) y devolviendo micro-acciones segmentadas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* columna derecha: pasos / encuesta */}
          <div className="lg:col-span-2 space-y-6">
            {step === 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>bienvenida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    conocé tu bienestar integral y su impacto en el trabajo. tus respuestas son confidenciales.
                    {" "}
                    {anonymous ? "en esta campaña los resultados son anónimos." : "en esta campaña los admins podrán ver agregados por segmento."}
                  </p>
                  <div className="flex items-center gap-3">
                    <Switch checked={consent} onCheckedChange={setConsent} />
                    <span className="text-sm">doy mi consentimiento informado</span>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={next} disabled={!consent}>comenzar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>datos demográficos (opcionales)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm">edad</label>
                      <Input type="number" min={16} max={90} placeholder="por ej. 34" />
                    </div>
                    <div>
                      <label className="text-sm">género</label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="f">femenino</SelectItem>
                          <SelectItem value="m">masculino</SelectItem>
                          <SelectItem value="nb">no binarie</SelectItem>
                          <SelectItem value="nd">prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm">área / equipo</label>
                      <Input placeholder="por ej. operaciones" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={prev}>anterior</Button>
                    <Button onClick={next}>siguiente</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && <DomainBlock domainKey="fisico" label="físico" />}
            {step === 3 && <DomainBlock domainKey="nutricional" label="nutricional" />}
            {step === 4 && <DomainBlock domainKey="emocional" label="emocional" />}
            {step === 5 && <DomainBlock domainKey="sociocultural" label="socio-cultural" />}
            {step === 6 && <DomainBlock domainKey="economico" label="económico" />}
            {step === 7 && <DomainBlock domainKey="familiar" label="familiar" />}

            {step === 8 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>índice de bienestar integral (autopercepción)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">calificate de 1 a 5 sobre tu bienestar integral actual.</p>
                  <div className="px-2">
                    <Slider value={[ibiAuto]} min={1} max={5} step={1} onValueChange={(v) => setIbiAuto(v[0])} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={prev}>anterior</Button>
                    <Button onClick={next} disabled={ibiAuto === 0}>ver resultados</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step >= 9 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart className="w-4 h-4"/>resultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>ibi global</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2">{ibi || 0}</div>
                        <Badge variant={bandaDe(ibi || 0).badge}>{bandaDe(ibi || 0).label}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">promedio de dominios (1–5)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>autopercepción</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2">{ibiAuto || 0}</div>
                        <Badge variant={bandaDe(ibiAuto || 0).badge}>{bandaDe(ibiAuto || 0).label}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">ibi declarado (1–5)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>brecha</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2">{Math.abs((ibi || 0) - (ibiAuto || 0)).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">|ibi - autopercepción|</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>radar de dominios</CardTitle>
                      </CardHeader>
                      <CardContent style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData} outerRadius={110}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="domain" />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} />
                            <Radar name="puntaje" dataKey="score" stroke="#0f172a" fill="#0f172a" fillOpacity={0.25} />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>comparativa por dominio</CardTitle>
                      </CardHeader>
                      <CardContent style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RBarChart data={barData}>
                            <XAxis dataKey="domain" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip />
                            <Bar dataKey="score" />
                          </RBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {aiTips.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>micro-acciones sugeridas (ia)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {aiTips.map((t, i) => (<li key={i}>{t}</li>))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline"><Download className="w-4 h-4 mr-2"/>exportar pdf</Button>
                    <Button onClick={() => setStep(0)} variant="default">nueva respuesta</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navegación simple por tabs (extra) */}
            <Tabs defaultValue="nav" className="mt-2">
              <TabsList>
                <TabsTrigger value="nav">navegación</TabsTrigger>
                <TabsTrigger value="aclaraciones">aclaraciones</TabsTrigger>
              </TabsList>
              <TabsContent value="nav" className="text-sm text-muted-foreground">
                pasos: 0 bienvenida · 1 demográficos · 2 físico · 3 nutricional · 4 emocional · 5 socio-cultural · 6 económico · 7 familiar · 8 ibi auto · 9 resultados
              </TabsContent>
              <TabsContent value="aclaraciones" className="text-sm text-muted-foreground">
                este prototipo funciona 100% en el cliente. para producción, conectar a backend (node/fastapi + postgres), anonimización opcional (k-anonymity en cortes), generación de pdf server-side y auth con magic-link.
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} bs360 · ebi (prototipo). hechos con ❤ en córdoba, ar.
        </footer>
      </div>
    </div>
  );
}
