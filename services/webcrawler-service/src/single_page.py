from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy

from config import md_generator, browser_config


async def fetch_single_page(url: str) -> dict:
    """
    Fetch a single page and return its markdown content as a dict.
    Uses stealth mode to bypass basic bot detection.

    Returns:
        dict with keys: url, title, markdown, success, error (if failed)
    """
    try:
        config = CrawlerRunConfig(
            markdown_generator=md_generator,
            scraping_strategy=LXMLWebScrapingStrategy(),
            verbose=True,
        )

        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url, config=config)

            if result.success:
                # In Crawl4AI v0.7+, result.markdown is a MarkdownGenerationResult object
                # Prefer fit_markdown (filtered content) over raw_markdown (includes nav/menus)
                # fit_markdown removes boilerplate, keeping main content
                markdown_content = ""
                if result.markdown:
                    markdown_content = result.markdown.fit_markdown or result.markdown.raw_markdown or ""

                print(f"Successfully crawled: {result.url} ({len(markdown_content)} chars)")

                return {
                    "success": True,
                    "url": result.url,
                    "title": result.metadata.get("title") if result.metadata else None,
                    "markdown": markdown_content,
                }
            else:
                print(f"Crawl failed for {url}: {result.error_message}")
                return {
                    "success": False,
                    "error": result.error_message or "Crawl failed",
                }

    except Exception as e:
        print(f"Error in fetch_single_page: {str(e)}")
        return {
            "success": False,
            "error": str(e),
        }
