from typing import Union

from fastapi import FastAPI

from crawl import deepCrawlSingleUrl
from fastapi.responses import StreamingResponse



app = FastAPI()


@app.get("/healthcheck/")
def healthcheck():
    return 'Health - OK'

@app.get("/crawl")
async def crawl(url: str, max_depth: Union[int, None] = 2, max_pages: Union[int, None] = 10):
    """
    This endpoint will trigger the web crawling process.
    :param url: The URL to crawl.
    :return: A message indicating the result of the crawl.
    """
    # Here you would call your crawling function
    # For example:
    # results = await main(url)
    
    async def crawledFiles():
        print(f"Starting crawl for URL: {url} with max_depth={max_depth} and max_pages={max_pages}")
        async for result in deepCrawlSingleUrl(url, max_depth, max_pages):
            print(result)
            yield result
        print(f"Finished crawling URL: {url}")

    return StreamingResponse((crawledFiles()), media_type="application/jsonl")
    # You can also return the results if needed 