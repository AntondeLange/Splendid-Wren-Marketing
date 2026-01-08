import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingAnimation from '@/components/LoadingAnimation'

export const metadata: Metadata = {
  title: 'Splendid Wren Marketing | Small Business Marketing Consultancy',
  description: 'Warm, clear, and human-focused marketing guidance for small businesses in Australia.',
  icons: {
    icon: '/Images/logo.png',
    apple: '/Images/logo.png',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LoadingAnimation />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
