import * as cheerio from 'cheerio';
import { NodeHtmlMarkdown, type NodeHtmlMarkdownOptions } from 'node-html-markdown';

/**
 * Represents a crawled page.
 */
export interface Page {
    url: string;
    content: string;
}

/**
 * A web crawler that fetches and processes web pages.
 */
export class Crawler {
    private seen = new Set<string>();
    private pages: Page[] = [];
    private queue: { url: string; depth: number }[] = [];

    /**
     * Creates an instance of Crawler.
     * @param {number} [maxDepth=2] - The maximum depth to crawl.
     * @param {number} [maxPages=1] - The maximum number of pages to crawl.
     */
    constructor(private maxDepth = 2, private maxPages = 1) { }

    /**
     * Starts crawling from the given URL.
     * @param {string} startUrl - The URL to start crawling from.
     * @returns {Promise<Page[]>} - A promise that resolves to an array of crawled pages.
     */
    async crawl(startUrl: string): Promise<Page[]> {
        this.addToQueue(startUrl);

        while (this.shouldContinueCrawling()) {
            const { url, depth } = this.queue.shift() as { url: string; depth: number };

            if (this.isTooDeep(depth) || this.isAlreadySeen(url)) continue;

            this.seen.add(url);

            const html = await this.fetchPage(url);

            this.pages.push({ url, content: this.parseHtml(html) });

            this.addNewUrlsToQueue(this.extractUrls(html, url), depth);
        }

        return this.pages;
    }

    /**
     * Checks if the current depth exceeds the maximum depth.
     * @param {number} depth - The current depth.
     * @returns {boolean} - True if the depth is too great, false otherwise.
     */
    private isTooDeep(depth: number): boolean {
        return depth > this.maxDepth;
    }

    /**
     * Checks if the URL has already been seen.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL has already been seen, false otherwise.
     */
    private isAlreadySeen(url: string): boolean {
        return this.seen.has(url);
    }

    /**
     * Checks if the crawler should continue crawling.
     * @returns {boolean} - True if there are more URLs to crawl and the maximum number of pages has not been reached, false otherwise.
     */
    private shouldContinueCrawling(): boolean {
        return this.queue.length > 0 && this.pages.length < this.maxPages;
    }

    /**
     * Adds a URL to the crawl queue.
     * @param {string} url - The URL to add to the queue.
     * @param {number} [depth=0] - The depth of the URL.
     */
    private addToQueue(url: string, depth = 0): void {
        this.queue.push({ url, depth });
    }

    /**
     * Adds new URLs to the crawl queue.
     * @param {string[]} urls - The URLs to add to the queue.
     * @param {number} depth - The depth of the current URL.
     */
    private addNewUrlsToQueue(urls: string[], depth: number): void {
        this.queue.push(...urls.map(url => ({ url, depth: depth + 1 })));
    }

    /**
     * Fetches the HTML content of a page.
     * @param {string} url - The URL of the page to fetch.
     * @returns {Promise<string>} - A promise that resolves to the HTML content of the page.
     */
    private async fetchPage(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            return await response.text();
        } catch (error) {
            console.error(`Failed to fetch ${url}: ${error}`);
            return '';
        }
    }

    /**
     * Parses the HTML content of a page.
     * @param {string} html - The HTML content to parse.
     * @returns {string} - The parsed content.
     */
    private parseHtml(html: string, options?: NodeHtmlMarkdownOptions): string {
        const $ = cheerio.load(html);
        $('a').removeAttr('href');
        return NodeHtmlMarkdown.translate($.html(), options);
    }

    /**
     * Extracts URLs from the HTML content of a page.
     * @param {string} html - The HTML content to extract URLs from.
     * @param {string} baseUrl - The base URL of the page.
     * @returns {string[]} - An array of extracted URLs.
     */
    private extractUrls(html: string, baseUrl: string): string[] {
        const $ = cheerio.load(html);
        const urls: string[] = [];
        $('a[href]').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                const url = new URL(href, baseUrl);
                urls.push(url.href);
            }
        });
        return urls;
    }
}