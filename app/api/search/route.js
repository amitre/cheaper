import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const runtime = 'nodejs'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'נדרש מונח חיפוש' }, { status: 400 })
  }

  try {
    const zapUrl = `https://www.zap.co.il/search.aspx?keyword=${encodeURIComponent(q)}&sog=a`

    const response = await fetch(zapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      throw new Error(`Zap returned ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const products = []

    // Zap product cards — selector based on their search results layout
    $('.ProductBox, [class*="productBox"], .ProdBox').each((_, el) => {
      const $el = $(el)

      const name =
        $el.find('.ProdInfoTxt a, [class*="prodName"], h2 a, h3 a').first().text().trim() ||
        $el.find('a[title]').first().attr('title') || ''

      if (!name) return

      const href =
        $el.find('a').first().attr('href') || ''
      const url = href.startsWith('http') ? href : `https://www.zap.co.il${href}`

      const priceText =
        $el.find('[class*="price"], .Price, .CurPrice').first().text().replace(/[^\d]/g, '')
      const minPrice = priceText ? parseInt(priceText, 10) : null

      const image =
        $el.find('img').first().attr('src') ||
        $el.find('img').first().attr('data-src') || null

      const numStoresText =
        $el.find('[class*="stores"], [class*="Stores"]').first().text().replace(/[^\d]/g, '')
      const numStores = numStoresText ? parseInt(numStoresText, 10) : null

      const category =
        $el.find('[class*="cat"], [class*="Cat"]').first().text().trim() || null

      products.push({ name, url, minPrice, image, numStores, category })
    })

    // Fallback: try generic product link pattern if the above found nothing
    if (products.length === 0) {
      $('a[href*="/model.aspx"]').each((_, el) => {
        const $el = $(el)
        const name = $el.text().trim() || $el.attr('title') || ''
        if (!name || name.length < 3) return
        const href = $el.attr('href') || ''
        const url = href.startsWith('http') ? href : `https://www.zap.co.il${href}`

        // Look for nearby price
        const container = $el.closest('li, div, article')
        const priceText = container.find('[class*="price"], [class*="Price"]').first().text().replace(/[^\d]/g, '')
        const minPrice = priceText ? parseInt(priceText, 10) : null

        products.push({ name, url, minPrice, image: null, numStores: null, category: null })
      })
    }

    return NextResponse.json({
      query: q,
      total: products.length,
      products: products.slice(0, 20),
      zapUrl,
    })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json(
      { error: 'שגיאה בחיפוש. נסה שוב מאוחר יותר.' },
      { status: 500 }
    )
  }
}
