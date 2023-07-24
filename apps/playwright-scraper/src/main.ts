import playwright, { Page } from 'playwright'
import { getKeywords, getServiceSummary } from './chatGPT.js';

export interface ScrapeResult {
  url: string
  summary?: string
  keywords?: string[]
  links: string[]
}

const acceptCookies = async (page: playwright.Page) => {
  try {
    const acceptCookies = await page.getByText(/alle akzeptieren/i);
    await Promise.all((await acceptCookies.all()).map(async button => button.click()))
  }
  catch(e) {
    console.error('Error accepting cookies', e)
  }
}

const scrapePage = async (url: string): Promise<ScrapeResult> => {
  const browser = await playwright['chromium'].launch({headless: false})
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(url, {waitUntil: 'networkidle'})
  await acceptCookies(page)
  const pageTitle = await page.title()
  const body = await page.locator('main')
  const linkLocators = await page.locator('a').all()
  const links = await Promise.all(linkLocators.map(ll => ll.getAttribute('href')))
  const texts = pageTitle + '\n\n' + (await body.allTextContents()).map(text => text.replace(/\s\s+/g, ' ')).join('\n')
  
  await browser.close()
  return {
    url,
    summary: `summary for ${pageTitle}`, // await getServiceSummary(texts),
    keywords: ['k1', 'k2', 'k3'], //(await getKeywords(texts))?.filter(keyword => keyword.length),
    links: Array.from(new Set(links.filter(link => link && link.length > 0 && !link.startsWith('#')))) as string[]
  }
}

const doScrape = async (url: string): Promise<Array<ScrapeResult>> => {
  const urls = [url]
  const urlsDone: Array<string> =[]
  const results: Array<ScrapeResult> = []
  let urlsTodo = urls.filter(url => !urlsDone.includes(url))
  while (urlsTodo.length > 0) {
    urlsDone.push(urlsTodo[0])
    console.log(`scraping ${urlsTodo[0]}`)
    const result = await scrapePage(urlsTodo[0])
    urlsTodo = Array.from(new Set([...urlsTodo, ...result.links].filter(url => !urlsDone.includes(url))))
    console.log(`-- scraped ${urlsTodo[0]}`)
    results.push(result)
  }
  return results
}

const results = await doScrape('https://www.medizin.uni-greifswald.de/')
console.log(results)
