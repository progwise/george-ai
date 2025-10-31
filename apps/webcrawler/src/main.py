import json
import asyncio

from fastapi import FastAPI, Query, Request
from fastapi.responses import StreamingResponse

from crawl import deepCrawlSingleUrl

app = FastAPI()


@app.get("/healthcheck/")
def healthcheck():
    return 'Health - OK'

@app.get("/crawl")
async def crawl(
    request: Request,
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
    
    # Create an event to signal when to stop crawling
    stop_event = asyncio.Event()
    
    async def safeCrawledFiles():
        print(f"Starting safe crawl for URL: {url} with max_depth={max_depth} and max_pages={max_pages}")
        try:
            async for chunk in deepCrawlSingleUrl(url, max_depth, max_pages, stop_event):
                # Check if client is still connected before yielding
                if await request.is_disconnected():
                    print(f"Client disconnected during crawl of {url}")
                    stop_event.set()
                    break
                    
                try:
                    yield chunk
                except Exception as write_error:
                    # Client disconnected while writing
                    print(f"Error writing to client during crawl of {url}: {write_error}")
                    stop_event.set()
                    break
            else:
                print("Crawl completed successfully.")
        except asyncio.CancelledError:
            print("Crawl cancelled")
            stop_event.set()
        except GeneratorExit:
            print("Generator exit - client disconnected")
            stop_event.set()
        except Exception as e:
            print(f"Unhandled error during streaming crawl: {e}")
            yield json.dumps({"error": "Crawl failed: " + str(e)})

    return StreamingResponse(safeCrawledFiles())
    # You can also return the results if needed