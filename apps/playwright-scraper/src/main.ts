import playwright from "playwright-chromium";
import { getKeywords, getServiceSummary } from "./chatGPT.js";
import { upsertWebPageSummaries } from "./strapi.js";
import { ScrapeResult, scrapePage } from "./scrape.js";

const MAX_RUNS = 3; // Maximum number of runs

export interface WebPageSummary extends ScrapeResult {
  summary: string;
  keywords: string[];
}

const processPage = async (url: string): Promise<void> => {
  const browser = await playwright["chromium"].launch({ headless: true });
  const context = await browser.newContext();

  const urlsDone: Array<string> = [];
  let urlsTodo = [url];

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

      await upsertWebPageSummaries(webPageSummary);

      urlsTodo = Array.from(
        new Set(
          [...urlsTodo.slice(1), ...scrapeResult.links].filter(
            (url) => !urlsDone.includes(url)
          )
        )
      );
    } catch (e) {
      console.error(`error scraping ${currentUrl}`);
      urlsTodo = urlsTodo.slice(1);
    }
    runCounter++; // Increases the counter after each run
  }

  await browser.close();
};

await processPage("https://www.medizin.uni-greifswald.de/");
