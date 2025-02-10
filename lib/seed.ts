import { RecursiveCharacterTextSplitter, type RecursiveCharacterTextSplitterParams } from '@langchain/textsplitters';
import { Crawler } from './crawler'; // Assuming Crawler is in the same directory

/**
 * Crawls a webpage and returns documents in a format understandable by LLMs.
 *
 * @param {string} startUrl - The URL to start crawling from.
 * @param {number} [maxDepth=2] - The maximum depth to crawl.
 * @param {number} [maxPages=1] - The maximum number of pages to crawl.
 * @param {RecursiveCharacterTextSplitterParams} [splitterOptions] - Options for the text splitter.
 * @returns {Promise<any[]>} - A promise that resolves to an array of documents.
 */
export async function seed<T>(startUrl: string, maxDepth = 2, maxPages = 1,splitterOptions?:RecursiveCharacterTextSplitterParams): Promise<T[]> {
  const crawler = new Crawler(maxDepth, maxPages);
  const pages = await crawler.crawl(startUrl);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Adjust chunk size as needed
    chunkOverlap: 200, // Adjust chunk overlap as needed
    ...splitterOptions
  });

  const documents: T[] = [];

  for (const page of pages) {
    const chunks = await splitter.splitText(page.content);
    for (const chunk of chunks) {
      documents.push({
        url: page.url,
        content: chunk,
      } as T);
    }
  }

  return documents;
}