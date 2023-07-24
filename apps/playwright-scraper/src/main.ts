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
    const acceptCookies = await page.getByText(/alle akzeptieren/i).getByRole('button');
    const buttons = (await acceptCookies.all())
    if (buttons.length > 0) {
      const isVisible = await buttons[0].isVisible()
      if (isVisible) {
        await buttons[0].click()
      }
    }
  }
  catch(e) {
    console.error('Error accepting cookies', e)
  }
}

const scrapePage = async (url: string, context: playwright.BrowserContext): Promise<ScrapeResult> => {

  const page = await context.newPage()
  await new Promise(x => setTimeout(x, 1000));
  await page.goto(url)
  await acceptCookies(page)
  const pageTitle = await page.title()
  const body = await page.locator('main')
  const linkLocators = await page.locator('a').all()
  const links = await Promise.all(linkLocators.map(ll => ll.getAttribute('href')))
  const texts = pageTitle + '\n\n' + (await body.allTextContents()).map(text => text.replace(/\s\s+/g, ' ')).join('\n')
  await page.close()
  return {
    url,
    summary: `summary for ${pageTitle}`, // await getServiceSummary(texts),
    keywords: ['k1', 'k2', 'k3'], //(await getKeywords(texts))?.filter(keyword => keyword.length),
    links: Array.from(new Set(links.filter(link => link && link.length > 0 && !link.startsWith('#')))) as string[]
  }
}

const doScrape = async (url: string): Promise<Array<ScrapeResult>> => {
  const browser = await playwright['chromium'].launch({headless: false})
  const context = await browser.newContext()
  const urls = [url]
  const urlsDone: Array<string> =[]
  const results: Array<ScrapeResult> = []
  let urlsTodo = urls.filter(url => !urlsDone.includes(url))
  while (urlsTodo.length > 0) {
    urlsDone.push(urlsTodo[0])
    console.log(`scraping ${urlsTodo[0]}`)
    const result = await scrapePage(urlsTodo[0], context)
    urlsTodo = Array.from(new Set([...urlsTodo, ...result.links].filter(url => !urlsDone.includes(url))))
    console.log(`-- scraped ${urlsTodo[0]}`)
    results.push(result)
  }

  await browser.close()
  return results
}

const results = await doScrape('https://www.medizin.uni-greifswald.de/')
console.log(results)
