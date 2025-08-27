import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'EBI — BS360',
  description: 'Encuesta de Bienestar Individual',
  manifest: '/manifest.webmanifest',
  themeColor: '#0ea5e9'
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="es-AR">
      <body>
        {children}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="beforeInteractive" />
        <Script id="sw-register" strategy="afterInteractive">{`
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(()=>{});
          }
        `}</Script>
      </body>
    </html>
  )
}
