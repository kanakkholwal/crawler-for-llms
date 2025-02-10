import { seed } from '@/lib/seed';
import { NextResponse } from 'next/server';

export const runtime = 'edge'

/**
 * Handles POST requests to start the crawling process.
 *
 */
export async function POST(req: Request) {

  const { url, options } = await req.json()
  try {
    console.log('Crawling', url)
    console.log('Options', options)
    const documents = await seed(url, options.maxDepth, options.maxPages, options.splitterOptions)
    console.log('Crawling done')
    console.log('Documents count', documents.length)
    return NextResponse.json({ success: true, documents })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed crawling" })
  }
}

/**
 * Sample request body:
 * {
 *   "url": "https://example.com",
 *   "options": {
 *     "maxDepth": 2,
 *     "maxPages": 10,
 *     "splitterOptions": {
 *       "chunkSize": 1000,
 *       "chunkOverlap": 200
 *     }
 *   }
 * }
 */

