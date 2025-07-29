import { ReactNode } from 'react'
import Link from 'next/link'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect grid-pattern-subtle border-b border-gray-200 dark:border-gray-700 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <nav className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 bg-black dark:bg-white rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className="text-xl font-black text-black dark:text-white tracking-tight">ServeNow</span>
              </div>

              {/* Navigation Links - Centered */}
              <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-12">
                  <Link href="/" className="text-black dark:text-white font-black hover:text-gray-600 dark:hover:text-gray-300 transition-colors tracking-tight">
                    Home
                  </Link>
                  <Link href="/features" className="text-gray-600 dark:text-gray-300 font-bold hover:text-black dark:hover:text-white transition-colors">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-gray-600 dark:text-gray-300 font-bold hover:text-black dark:hover:text-white transition-colors">
                    Pricing
                  </Link>
                  <Link href="/contact" className="text-gray-600 dark:text-gray-300 font-bold hover:text-black dark:hover:text-white transition-colors">
                    Contact
                  </Link>
                </div>
              </div>

              {/* Access Portal Button */}
              <div>
                <Link 
                  href="/access" 
                  className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Access Portal
                </Link>
              </div>
            </nav>
          </div>
        </header>
        
        <main className="pt-20">{children}</main>
        
        <Footer />
      </div>
    </ThemeProvider>
  )
}