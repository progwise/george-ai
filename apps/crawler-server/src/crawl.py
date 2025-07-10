import json
import asyncio
from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from crawl4ai.content_filter_strategy import PruningContentFilter


md_generator = DefaultMarkdownGenerator(
    content_filter=PruningContentFilter(threshold=0.4, threshold_type="fixed")
)


async def deepCrawlSingleUrl(url: str, max_depth: int, max_pages: int, stop_event: asyncio.Event = None):
    try:
        # Configure the crawl
        config = CrawlerRunConfig(
            stream=True,
            markdown_generator=md_generator,
            deep_crawl_strategy=BFSDeepCrawlStrategy(
                max_depth=max_depth,
                max_pages=max_pages, 
                include_external=False
            ),
            scraping_strategy=LXMLWebScrapingStrategy(),
            verbose=True,
        )

        async with AsyncWebCrawler() as crawler:
            # Access individual results
            arunIterator = await crawler.arun(url, config=config, magic=True)
            while True:
                # Check if we should stop
                if stop_event and stop_event.is_set():
                    print(f"Stop event detected, halting crawl of {url}")
                    break
                    
                try:
                    result = await arunIterator.__anext__()
                except StopAsyncIteration:
                    print("Crawl iterator completed")
                    break
                    
                try:
                    print(f"Start Processing crawler result")
                    yield "\n---BEGIN CRAWLER RESULT---\n"
                    print(f"Processing URL: {result.url}")
                    yield json.dumps({"url": result.url, "title": result.metadata.get("title")})
                    yield "\n---BEGIN MARKDOWN---\n"
                    print(f"Processing Markdown: {result.url}")
                    yield result.markdown
                except Exception as e:
                    # On any error, yield an error JSON to keep stream alive
                    print(f"Error processing URL {url}: {str(e)}")
                    yield "\n---ERROR---\n"
                    yield json.dumps({"error": str(e)})
                    yield "\n---END ERROR---\n"
                finally:
                    print(f"Finished processing URL")
                    yield "\n---END CRAWLER RESULT---\n"
        return
    except Exception as e:
        # On any error, yield an error JSON to keep stream alive
        print(f"Error in deepCrawlSingleUrl: {str(e)}")
        yield json.dumps({"error": str(e)})
