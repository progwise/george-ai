import json

from fastapi import FastAPI, Query

from crawl import deepCrawlSingleUrl
from fastapi.responses import StreamingResponse



app = FastAPI()


@app.get("/healthcheck/")
def healthcheck():
    return 'Health - OK'

@app.get("/crawl")
async def crawl(
    url: str,
    max_depth: int = Query(2, alias="maxDepth"),
    max_pages: int = Query(10, alias="maxPages"),
):
    """
    This endpoint will trigger the web crawling process.
    :param url: The URL to crawl.
    :return: A message indicating the result of the crawl.
    """
    print(f"Received request to crawl URL: {url} with max_depth={max_depth} and max_pages={max_pages}")
    async def safeCrawledFiles():
        print(f"Starting safe crawl for URL: {url} with max_depth={max_depth} and max_pages={max_pages}")
        try:
            async for chunk in deepCrawlSingleUrl(url, max_depth, max_pages):
                yield chunk
            else:
                print("Crawl completed successfully.")
        except Exception as e:
            print(f"Unhandled error during streaming crawl: {e}")
            yield json.dumps({"error": "Crawl failed: " + str(e)})

    return StreamingResponse(safeCrawledFiles())
    # You can also return the results if needed