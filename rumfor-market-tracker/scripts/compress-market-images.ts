import sharp from 'sharp'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1'
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''

async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN && { 'Authorization': `Bearer ${AUTH_TOKEN}` }),
      ...options?.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`)
  }
  
  return response.json()
}

const PNG_TO_WEBP: Record<string, string> = {
  '/assets/images/farmermarket.png': '/assets/images/farmermarket.webp',
  '/assets/images/artandcraft.png': '/assets/images/artandcraft.webp',
  '/assets/images/fleamarket.png': '/assets/images/fleamarket.webp',
  '/assets/images/foodfestival.png': '/assets/images/foodfestival.webp',
  '/assets/images/craftshow.png': '/assets/images/craftshow.webp',
  '/assets/images/communityevent.png': '/assets/images/communityevent.webp',
  '/assets/images/holidaymarket.png': '/assets/images/holidaymarket.webp',
  '/assets/images/nightmarket.png': '/assets/images/nightmarket.webp',
  '/assets/images/streetfair.png': '/assets/images/streetfair.webp',
  '/assets/images/vintageandantique.jpeg': '/assets/images/vintageandantique.webp',
}

const convertToWebP = (url: string): string => {
  if (PNG_TO_WEBP[url]) {
    return PNG_TO_WEBP[url]
  }
  return url
}

const compressImage = async (imageUrl: string): Promise<string> => {
  // Handle local asset paths - convert to WebP instead of compressing
  if (imageUrl.startsWith('/assets/images/') && (imageUrl.endsWith('.png') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.jpg'))) {
    const webpUrl = convertToWebP(imageUrl)
    console.log(`    Converted to WebP: ${webpUrl}`)
    return webpUrl
  }
  
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const imageBuffer = Buffer.from(arrayBuffer)
  
  const compressedBuffer = await sharp(imageBuffer)
    .webp({ quality: 70 })
    .toBuffer()
  
  return `data:image/webp;base64,${compressedBuffer.toString('base64')}`
}

async function processMarketImages(marketId: string, images: string[]): Promise<string[]> {
  const compressedImages: string[] = []
  
  for (const imageUrl of images) {
    try {
      // Skip if already a WebP data URL
      if (imageUrl.startsWith('data:image/webp;base64,')) {
        console.log(`  Skipping - already WebP: ${imageUrl.substring(0, 50)}...`)
        compressedImages.push(imageUrl)
        continue
      }
      
      console.log(`  Processing: ${imageUrl.substring(0, 80)}...`)
      const compressed = await compressImage(imageUrl)
      
      // If result is still a local path (WebP conversion), don't calculate savings
      if (compressed.startsWith('/assets/')) {
        compressedImages.push(compressed)
        console.log(`    Converted to WebP`)
      } else {
        compressedImages.push(compressed)
        const originalSize = imageUrl.length * 0.75
        const newSize = Buffer.from(compressed.split(',')[1], 'base64').length
        const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1)
        console.log(`    Compressed (${savings}% savings)`)
      }
    } catch (error) {
      console.error(`  Failed to process: ${imageUrl}`)
      compressedImages.push(imageUrl)
    }
  }
  
  return compressedImages
}

async function getAllMarketIds(): Promise<string[]> {
  const marketIds: string[] = []
  let page = 1
  let hasMore = true
  
  while (hasMore) {
    console.log(`  Fetching page ${page}...`)
    try {
      const response = await fetchJson<any>(
        `${API_BASE_URL}/admin/markets?page=${page}&limit=100`
      )
      
      // Debug: log top-level keys
      const keys = Object.keys(response)
      console.log(`  Response keys: ${keys.join(', ')}`)
      
      // Try different possible structures
      const markets = response.markets || response.data?.markets || response.data || response
      const pagination = response.pagination || response.data?.pagination || {}
      
      if (markets && Array.isArray(markets)) {
        console.log(`  Found ${markets.length} markets`)
        markets.forEach((market: any) => {
          if (market.id || market._id) {
            marketIds.push(market.id || market._id)
          }
        })
        const totalPages = pagination.totalPages || pagination.pages || 1
        hasMore = page < totalPages
        page++
      } else {
        console.log(`  No markets array found in response`)
        console.log(`  Response preview: ${JSON.stringify(response).substring(0, 500)}`)
        hasMore = false
      }
    } catch (error) {
      console.error(`  Error fetching page ${page}:`, error)
      hasMore = false
    }
  }
  
  return marketIds
}

async function updateMarketImages(marketId: string, images: any[]) {
  const response = await fetch(`${API_BASE_URL}/markets/${marketId}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN && { 'Authorization': `Bearer ${AUTH_TOKEN}` })
    },
    body: JSON.stringify({ images })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update market: ${await response.text()}`)
  }
  
  return response.json()
}

async function main() {
  console.log('Market Image Compression Tool')
  console.log('==============================\n')
  console.log(`API URL: ${API_BASE_URL}`)

  const args = process.argv.slice(2)
  const processAll = args.includes('--all')
  const marketIds = args.filter(arg => !arg.startsWith('--'))
  
  if (!AUTH_TOKEN && !marketIds.length) {
    console.log('\nError: AUTH_TOKEN environment variable is required.')
    console.log('Usage: AUTH_TOKEN=your_token npx tsx scripts/compress-market-images.ts --all')
    console.log('   or: AUTH_TOKEN=your_token npx tsx scripts/compress-market-images.ts <id1> <id2>...\n')
    return
  }
  
  if (processAll) {
    console.log('\nFetching all market IDs...\n')
    try {
      const allIds = await getAllMarketIds()
      console.log(`\nFound ${allIds.length} markets\n`)
      
      let processed = 0
      for (const marketId of allIds) {
        processed++
        console.log(`[${processed}/${allIds.length}] Processing market: ${marketId}`)
        
        try {
          const response = await fetchJson<any>(`${API_BASE_URL}/markets/${marketId}`)
          const market = response.data?.market || response.market || response.data || response
          
          if (!market.images || market.images.length === 0) {
            console.log('  No images to process\n')
            continue
          }
          
          const currentImages = market.images.map((img: any) => typeof img === 'string' ? img : img.url)
          console.log(`  Found ${currentImages.length} image(s)`)
          
          const compressedImages = await processMarketImages(marketId, currentImages)
          
          await updateMarketImages(marketId, compressedImages.map((url, i) => ({
            url,
            isHero: market.images[i]?.isHero || false
          })))
          
          console.log(`  Updated with ${compressedImages.length} compressed image(s)\n`)
        } catch (error: any) {
          console.error(`  Error: ${error.message}\n`)
        }
      }
    } catch (error: any) {
      console.error(`Failed to fetch markets: ${error.message}`)
    }
  } else if (marketIds.length > 0) {
    console.log(`\nProcessing ${marketIds.length} market(s)\n`)
    
    for (const marketId of marketIds) {
      console.log(`Processing market: ${marketId}`)
      
      try {
        const response = await fetchJson<any>(`${API_BASE_URL}/markets/${marketId}`)
        const market = response.data?.market || response.market || response.data || response
        
        if (!market.images || market.images.length === 0) {
          console.log('  No images to process')
          continue
        }
        
        const currentImages = market.images.map((img: any) => typeof img === 'string' ? img : img.url)
        console.log(`  Found ${currentImages.length} image(s)`)
        
        const compressedImages = await processMarketImages(marketId, currentImages)
        
        await updateMarketImages(marketId, compressedImages.map((url, i) => ({
          url,
          isHero: market.images[i]?.isHero || false
        })))
        
        console.log(`  Updated with ${compressedImages.length} compressed image(s)\n`)
      } catch (error: any) {
        console.error(`  Error: ${error.message}\n`)
      }
    }
  } else {
    console.log('\nUsage:')
    console.log('  AUTH_TOKEN=your_token npx tsx scripts/compress-market-images.ts --all')
    console.log('  AUTH_TOKEN=your_token npx tsx scripts/compress-market-images.ts <id1> <id2>...')
    console.log('\nExample:')
    console.log('  AUTH_TOKEN=abc123 npx tsx scripts/compress-market-images.ts mkt_123 mkt_456')
  }

  console.log('\nDone!')
}

main()
