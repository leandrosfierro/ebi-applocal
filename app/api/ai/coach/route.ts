export async function POST(req: Request){
  const body = await req.json()
  const apiKey = process.env.OPENAI_API_KEY
  if(!apiKey) return new Response('OPENAI_API_KEY no configurada', { status: 500 })
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      messages: [
        { role: 'system', content: 'Sos un coach de bienestar de BS360. Respondé en es-AR, tono cercano y claro. No des diagnósticos.' },
        { role: 'user', content: JSON.stringify(body) }
      ]
    })
  })
  const json = await r.json()
  const text = json?.choices?.[0]?.message?.content ?? 'No pude generar sugerencias ahora.'
  return Response.json({ text })
}
