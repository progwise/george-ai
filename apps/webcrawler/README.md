# Crawler Server

> **⚠️ Note**: This crawler server implementation is subject to change. We are evaluating alternatives to replace or enhance this component in future versions. The architecture and dependencies described here may be replaced with a TypeScript-based solution.

## Dependencies

1. pip install "git+ssh://git@github.com/progwise/crawl4ai.git@fix/streaming-error-handling"
2. pip install fastApi

# Create Virtual Environment

Execute inside the apps/crawler-server folder execute.

This crawler server uses crawl4ai. GitHub https://github.com/unclecode/crawl4ai, Docs: https://docs.crawl4ai.com/

The crawler server uses fastApi: https://fastapi.tiangolo.com/

The crawler server uses python 3.11: https://www.python.org/doc/

# Start with devcontainer

The server builds and starts automatically on port 11245 when starting the dev container and also runs on this port on production environment. If you do not need to change the crawler server you can just use it.

# Start development environment

In the development environment the server listenes to port 8000. So you can leave the dev-container running while you develop on port 8000.

The following script prepares everything for developers and starts the crawler-server on port 8000 (default fastApi)

1. it creates an virtual environment in .venv
2. it activates it
3. it installs all dependencies
4. it makes sure that crawl4ai setup is completed incl. playwright headless browser
5. it starts the fastapi defined in src/main.py

```bash
./start-dev.sh
```

We recommend to stay in the virtual environment during work on the server.

# Run production server

There is a docker image you can build with

```bash
docker build -t crawler-server .
```

## You can run the image locally with

```bash
docker run -d crawler-server
```

The crawler server then runs on port 11245. You can reach the docs on

```
http://localhost:11245/docs
```

With the 2 endpoints:

1. Healthcheck
2. crawl

e.g.

```bash
curl -X 'GET' \
  'http://localhost:11245/healthcheck/' \
  -H 'accept: application/json'
```

## You can stop the container using

```bash
docker stop $(docker ps -q --filter ancestor=crawler-server )
```

## You can view the logs

```bash
docker logs $(docker ps -q --filter ancestor=crawler-server )
```
