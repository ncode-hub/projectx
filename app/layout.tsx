import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solana Launchpad - Pump Your Tokens',
  description: 'Launch and trade Solana tokens instantly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.className}>
        <nav className="border-b border-matrix-green/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-matrix-green flex items-center gap-2">
              <span className="animate-pulse-green">▲</span>
              PUMP.SOL
            </a>
            <a href="/create" className="btn-primary">
              + Launch Token
            </a>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-matrix-green/20 bg-black/50 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-matrix-green/60">
            <p>Powered by Solana x Speed MVP Architecture</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

