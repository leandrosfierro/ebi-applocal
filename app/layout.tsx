import './globals.css'
import Script from 'next/script'
export const metadata={title:'EBI — BS360',manifest:'/manifest.webmanifest'}
export default function RootLayout({children}:{children:React.ReactNode}){
  return (<html lang="es-AR"><body>{children}
    <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="beforeInteractive"/>
    <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="beforeInteractive"/>
  </body></html>)
}