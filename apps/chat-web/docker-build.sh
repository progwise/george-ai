source .env
docker build ../.. -f ./Dockerfile --progress=plain --secret id=TAVILY_API_KEY,env=TAVILY_API_KEY --secret id=OPENAI_API_KEY,env=OPENAI_API_KEY -t first-george-chatweb