# EBI — BS360 (Next.js + Prisma + Tailwind + Vercel + IA)

## Local
```bash
npm install
cp .env.example .env
# setear DATABASE_URL y OPENAI_API_KEY
npm run db:push
npm run seed
npm run dev
```

## Deploy Vercel
- Variables: `DATABASE_URL`, `OPENAI_API_KEY`
- Rutas: `/api/health`, `/api/ai/coach`
- PWA: manifest + sw

Componente principal en `app/page.tsx`. PDF: jsPDF + html2canvas desde CDN en `app/layout.tsx`.
