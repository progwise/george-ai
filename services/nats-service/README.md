# NATS Service for George AI

This Docker image provides a NATS server with JetStream enabled for use in CI/CD pipelines and testing environments.

## Features

- NATS 2.12 Alpine-based image
- JetStream enabled with 1GB memory and 10GB file storage limits
- Pre-configured for George AI workspace events

## Building

```bash
docker build -t george-ai-nats:latest services/nats-service
```

## Running

```bash
docker run -p 4222:4222 -p 8222:8222 george-ai-nats:latest
```

## Ports

- `4222`: Client connections
- `8222`: HTTP monitoring endpoint

## Usage in GitHub Actions

This image is automatically built and used in CI/CD workflows as a service container.
