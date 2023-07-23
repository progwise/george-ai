import playwright, { Page } from 'playwright'
import { getKeywords, getServiceSummary } from './chatGPT.js';

const acceptCookies = async (page: playwright.Page) => {
  try {
    const acceptCookies = await page.getByText(/alle akzeptieren/i);
    await Promise.all((await acceptCookies.all()).map(async button => button.click()))
  }
  catch(e) {
    console.error('Error accepting cookies', e)
  }
}

const scrape = async (url: string) => {
  const browser = await playwright['chromium'].launch({headless: true})
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(url, {waitUntil: 'networkidle'})
  await acceptCookies(page)
  const pageTitle = await page.title()
  const content: Array<string | string[]> = []
  const body = await page.locator('main')
  const texts = pageTitle + '\n\n' + (await body.allTextContents()).map(text => text.replace(/\s\s+/g, ' ')).join('\n')
  
  // console.log(texts)
  if (content) {

    const summary = await getServiceSummary(texts)
    const keywords = await getKeywords(texts)
    console.log(summary)
    console.log(keywords)
  }
  await browser.close()
}

await scrape("https://www.medizin.uni-greifswald.de/");
