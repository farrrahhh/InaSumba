// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InaSumba | Weaving The Cultures of Sumba',
  description: 'InaSumba adalah aplikasi progresif untuk mempromosikan dan memberdayakan budaya Sumba melalui teknologi modern.',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  icons: {
    icon: '/logo.png', // ubah ke logo
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="InaSumba adalah aplikasi progresif untuk mempromosikan dan memberdayakan budaya Sumba melalui teknologi modern." />
        <meta name="keywords" content="InaSumba, Tenun Ikat, Budaya Sumba, Indonesia, Tradisi, PWA, Digitalisasi Budaya" />
        <meta name="author" content="InaSumba Team" />
        <meta name="application-name" content="InaSumba" />

        <meta property="og:title" content="InaSumba | Weaving The Cultures of Sumba" />
        <meta property="og:description" content="Promosi dan pelestarian budaya Sumba melalui aplikasi progresif modern." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inasumba.app/" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXX');
            `,
          }}
        />
      </head>
      <body className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {children}
      </body>
    </html>
  )
}
