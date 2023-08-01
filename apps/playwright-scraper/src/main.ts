import playwright, { Page } from 'playwright-chromium'
import { getKeywords, getServiceSummary } from './chatGPT.js';

export interface ScrapeResult {
  url: string
  content: string
  summary?: string // remove
  keywords?: string[] //remove
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
  await new Promise(x => setTimeout(x, 100));
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
    // summary: `summary for ${pageTitle}`, // await getServiceSummary(texts),
    // keywords: ['k1', 'k2', 'k3'], //(await getKeywords(texts))?.filter(keyword => keyword.length),
    content: texts,
    summary: await getServiceSummary(texts),
    keywords: (await getKeywords(texts))?.filter(keyword => keyword.length),
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
    try {
      const scrapeResult = await scrapePage(urlsTodo[0], context) // todo: only scrape, no chatGPT call
      // chatGPT call for summary here
      // chatGPT call for keywords here
      // save to strapi (new)

      console.log(`-- scraped ${urlsTodo[0]}`)
      console.log(scrapeResult)
      results.push(scrapeResult)
      urlsTodo = Array.from(new Set([...urlsTodo, ...scrapeResult.links].filter(url => !urlsDone.includes(url))))
    }
    catch(e) {
      console.error(`error scraping ${urlsTodo[0]}`)
      urlsTodo = Array.from(new Set([...urlsTodo].filter(url => !urlsDone.includes(url))))
    }
  }

  await browser.close()
  return results
}

const results = await doScrape('https://www.medizin.uni-greifswald.de/')
