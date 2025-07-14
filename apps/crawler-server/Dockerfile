FROM python:3.11-slim
# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git openssh-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/george

COPY /apps/crawler-server/requirements.txt .
COPY /apps/crawler-server/src ./src
COPY /apps/crawler-server/start-prod.sh .

RUN python3 -m venv .venv && \
    . .venv/bin/activate && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    crawl4ai-setup && \
    playwright install --with-deps

RUN mkdir -p /home/george/.cache/ms-playwright \
    && cp -r /root/.cache/ms-playwright/chromium-* /home/george/.cache/ms-playwright/

# Expose the default FastAPI port
EXPOSE 11245

CMD ["./start-prod.sh"]