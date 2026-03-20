import './globals.css'

export const metadata = {
  title: 'Cheaper — השוואת מחירים ישראלית',
  description: 'השווה מחירים על מוצרים בחנויות הישראליות המובילות',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600">Cheaper</span>
            <span className="text-sm text-slate-400">השוואת מחירים ישראלית</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200 mt-12">
          מחירים מ-Zap.co.il ועשויים להתעדכן בפיגור של עד 24 שעות
        </footer>
      </body>
    </html>
  )
}
