import playwright, { Page } from 'playwright-chromium'

export interface ScrapeResult {
  title: string
  url: string
  content: string
  links: string[]
  scrapedLanguage: string
}

const acceptCookies = async (page: playwright.Page) => {
  try {
    const acceptCookies = await page
      .getByText(/alle akzeptieren/i)
      .getByRole('button')
    const buttons = await acceptCookies.all()
    if (buttons.length > 0) {
      const isVisible = await buttons[0].isVisible()
      if (isVisible) {
        await buttons[0].click()
      }
    }
  } catch (error) {
    console.error('Error accepting cookies', error)
  }
}

const extractLinks = async (page: Page): Promise<string[]> => {
  const linkLocators = await page.locator('a').all()
  const links = await Promise.all(
    linkLocators.map((ll) => ll.getAttribute('href')),
  )
  return [
    ...new Set(
      links.filter(
        (link): link is string =>
          link !== null && link.length > 0 && !link.startsWith('#'),
      ),
    ),
  ]
}

export const scrapePage = async (
  url: string,
  context: playwright.BrowserContext,
): Promise<ScrapeResult> => {
  const page = await context.newPage()
  await page.goto(url)
  await acceptCookies(page)
  const pageTitle = await page.title()
  const body = await page.locator('main')
  const allTexts = await body.allTextContents()
  const texts =
    pageTitle +
    '\n\n' +
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    allTexts.map((text) => text.replace(/\s\s+/g, ' ')).join('\n')
  const scrapedLanguage =
    (await page.locator('html').getAttribute('lang')) || 'en'
  console.log('scrapedLanguage:', scrapedLanguage)
  const links = await extractLinks(page)
  await page.close()
  return {
    title: pageTitle,
    url,
    content: texts,
    links,
    scrapedLanguage,
  }
}
