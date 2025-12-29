FROM python:3.11-slim-bookworm

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git openssh-client \
    && rm -rf /var/lib/apt/lists/*

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/services/webcrawler-service

WORKDIR /home/george

# Copy requirements first (changes rarely) to leverage Docker cache
COPY /services/webcrawler-service/requirements.txt .

# Install dependencies (cached unless requirements.txt changes)
RUN python3 -m venv .venv && \
    . .venv/bin/activate && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    crawl4ai-setup && \
    playwright install --with-deps

RUN mkdir -p /home/george/.cache/ms-playwright \
    && cp -r /root/.cache/ms-playwright/chromium-* /home/george/.cache/ms-playwright/

# Copy source code last (changes frequently)
COPY /services/webcrawler-service/src ./src
COPY /services/webcrawler-service/start-prod.sh .

# Expose the default FastAPI port
EXPOSE 11245

CMD ["./start-prod.sh"]