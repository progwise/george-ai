import json
from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from crawl4ai.content_filter_strategy import PruningContentFilter


md_generator = DefaultMarkdownGenerator(
    content_filter=PruningContentFilter(threshold=0.4, threshold_type="fixed")
)


async def deepCrawlSingleUrl(url: str, max_depth: int, max_pages: int):
    # Configure a 2-level deep crawl
    config = CrawlerRunConfig(
        stream=True,
        markdown_generator=md_generator,
        deep_crawl_strategy=BFSDeepCrawlStrategy(
            max_depth=max_depth,
            max_pages=max_pages, 
            include_external=False
        ),
        scraping_strategy=LXMLWebScrapingStrategy(),
        verbose=True
    )

    async with AsyncWebCrawler() as crawler:
        # Access individual results
        async for result in await crawler.arun(url, config=config):  # Show first 3 results
            yield "\n---BEGIN CRAWLER RESULT---\n"
            yield json.dumps({"url": result.url, "title": result.metadata.get("title")})
            yield "\n---BEGIN MARKDOWN---\n"
            yield result.markdown
            yield "\n---END CRAWLER RESULT---\n"
            