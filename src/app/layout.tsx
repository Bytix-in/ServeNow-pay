import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReactQueryProvider } from '@/lib/react-query'
import ThemeScript from '@/components/ThemeScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ServeNow - Restaurant Management SaaS',
  description: 'Modern restaurant management platform built with Next.js 14',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      </head>
      <body className={inter.className}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}