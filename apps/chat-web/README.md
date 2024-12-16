# chat-web

a tanStack Serve example UI for george-ai

You need to create and edit the .env file.

Enjoy.

# building the docker image for deployment

```
source .env
docker build -f Dockerfile.chat-web . --progress=plain --secret id=TAVILY_API_KEY,env=TAVILY_API_KEY --secret id=OPENAI_API_KEY,env=OPENAI_API_KEY -t first-george-chatweb
```
