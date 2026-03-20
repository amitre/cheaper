'use client'

import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה בחיפוש')
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="חפש מוצר... למשל: iPhone 15, Samsung TV 55"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
          dir="rtl"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-xl shadow-sm transition-colors"
        >
          {loading ? '...' : 'חפש'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center text-slate-400 py-12">
          <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>מחפש מחירים...</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-500">
              {results.total > 0
                ? `נמצאו ${results.total} מוצרים`
                : 'לא נמצאו תוצאות'}
            </h2>
            <a
              href={`https://www.zap.co.il/search.aspx?keyword=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline"
            >
              פתח ב-Zap ←
            </a>
          </div>

          {results.products.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              נסה מונח חיפוש אחר
            </div>
          )}

          <div className="space-y-3">
            {results.products.map((product, i) => (
              <ProductCard key={i} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!results && !loading && !error && (
        <div className="text-center text-slate-400 py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-base">חפש מוצר כדי להשוות מחירים</p>
          <p className="text-sm mt-1">מחירים מ-Zap, KSP, iDigital ועוד</p>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
    >
      <div className="flex gap-4 items-start">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 object-contain rounded-lg bg-slate-50 flex-shrink-0"
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors leading-snug mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.category && (
            <span className="text-xs text-slate-400">{product.category}</span>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {product.minPrice && (
            <div className="text-lg font-bold text-emerald-600">
              ₪{product.minPrice.toLocaleString()}
            </div>
          )}
          {product.numStores && (
            <div className="text-xs text-slate-400 mt-0.5">
              {product.numStores} חנויות
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
