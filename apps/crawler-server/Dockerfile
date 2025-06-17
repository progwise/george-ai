FROM python:3.11-slim
# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git openssh-client \
    && rm -rf /var/lib/apt/lists/*

    RUN pip install --upgrade pip

RUN groupadd  --system --gid 1001 george && useradd --system --uid 1001 --gid 1001 george
USER george:george
WORKDIR /home/george
ENV PATH="/home/george/.local/bin:${PATH}"

COPY --chown=george:george requirements.txt .
COPY --chown=george:george src ./src
COPY --chown=george:george start-prod.sh .

RUN python3 -m venv .venv && \
  . .venv/bin/activate && \
  pip install -r requirements.txt && \
  crawl4ai-setup
  
# Make sure start-prod.sh is executable
RUN chmod +x ./start-prod.sh

# Expose the default FastAPI port
EXPOSE 11245

CMD ["./start-prod.sh"]