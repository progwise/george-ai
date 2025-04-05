# Problems when building dockers

Dockers are sometimes evil: You need to start the application using local dockers becaus
some issues only come up if the app is running in docker containers

## Build docker images

Building is tested from the project root.

```bash
docker build -t gai-web-test -f ./apps/chat-web/Dockerfile .
docker build -t gai-server-test -f ./apps/georgeai-server/Dockerfile .
```

## Run docker images

To run the images you need to take into account network issues, so make sure all containers
can interact and the browser can interact with both as well.

Do not run the containers from inside devcontainers because this may cause ambiguous network situations.

```bash
docker run --env-file=.env  gai-web-test:latest
docker run --env-file=.env  gai-server-test:latest
```
