import playwright, { Page } from "playwright-chromium";
import { getKeywords, getServiceSummary } from "./chatGPT.js";
import { upsertWebPageSummaries } from "./strapi.js";

const MAX_RUNS = 1; // Maximum number of runs

export interface ScrapeResult {
  title: string;
  url: string;
  content: string;
  links: string[];
}

export interface WebPageSummary extends ScrapeResult {
  summary: string;
  keywords: string[];
}

const acceptCookies = async (page: playwright.Page) => {
  try {
    const acceptCookies = await page
      .getByText(/alle akzeptieren/i)
      .getByRole("button");
    const buttons = await acceptCookies.all();
    if (buttons.length > 0) {
      const isVisible = await buttons[0].isVisible();
      if (isVisible) {
        await buttons[0].click();
      }
    }
  } catch (e) {
    console.error("Error accepting cookies", e);
  }
};

const extractLinks = async (page: Page): Promise<string[]> => {
  const linkLocators = await page.locator("a").all();
  const links = (
    await Promise.all(linkLocators.map((ll) => ll.getAttribute("href")))
  ).filter((link): link is string => link !== null);
  return Array.from(
    new Set(links.filter((link) => link.length > 0 && !link.startsWith("#")))
  );
};

const scrapePage = async (
  url: string,
  context: playwright.BrowserContext
): Promise<ScrapeResult> => {
  const page = await context.newPage();
  await page.goto(url);
  await acceptCookies(page);
  const pageTitle = await page.title();
  const body = await page.locator("main");
  const texts =
    pageTitle +
    "\n\n" +
    (await body.allTextContents())
      .map((text) => text.replace(/\s\s+/g, " "))
      .join("\n");
  const links = await extractLinks(page);
  await page.close();
  return {
    title: pageTitle,
    url,
    content: texts,
    links: Array.from(
      new Set(
        links.filter((link) => link && link.length > 0 && !link.startsWith("#"))
      )
    ),
  };
};

const doScrape = async (url: string): Promise<Array<WebPageSummary>> => {
  const browser = await playwright["chromium"].launch({ headless: false });
  const context = await browser.newContext();
  const urls = [url];
  const urlsDone: Array<string> = [];
  const results: Array<WebPageSummary> = [];
  let urlsTodo = urls.filter((url) => !urlsDone.includes(url));
  let runCounter = 0; // Counter
  while (urlsTodo.length > 0 && runCounter < MAX_RUNS) {
    const currentUrl = urlsTodo[0];
    urlsDone.push(currentUrl);
    console.log(`scraping ${currentUrl}`);
    try {
      const scrapeResult = await scrapePage(currentUrl, context);
      const summary = (await getServiceSummary(scrapeResult.content)) ?? "";
      const keywords =
        (await getKeywords(scrapeResult.content))?.filter(
          (keyword) => keyword.length
        ) ?? [];

      const webPageSummary: WebPageSummary = {
        ...scrapeResult,
        summary,
        keywords,
      };

      console.log(`-- scraped ${currentUrl}`);
      console.log(webPageSummary);
      results.push(webPageSummary);

      urlsTodo = Array.from(
        new Set(
          [...urlsTodo, ...scrapeResult.links].filter(
            (url) => !urlsDone.includes(url)
          )
        )
      );
    } catch (e) {
      console.error(`error scraping ${currentUrl}`);
      urlsTodo = Array.from(
        new Set([...urlsTodo].filter((url) => !urlsDone.includes(url)))
      );
    }
    runCounter++; // Increases the counter after each run
  }

  await browser.close();
  return results;
};

(async () => {
  const results = await doScrape("https://www.medizin.uni-greifswald.de/");
  await upsertWebPageSummaries(results);
})();
