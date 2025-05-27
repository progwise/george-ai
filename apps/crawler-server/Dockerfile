FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY . .
RUN pip install --upgrade pip && \
  pip install --no-cache-dir -r ./requirements.txt && \
  crawl4ai-setup

# Make sure start-dev.sh is executable
RUN chmod +x ./start-prod.sh

# Expose the default FastAPI port
EXPOSE 11245

CMD ["./start-prod.sh"]