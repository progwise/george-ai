# george-ai stand alone GraphQL server

This project starts the graphql backend package.

## prerequisites

- install packages
- build the root project
- You need to provide a .env file

## start

```
pnpm start
```

## provided schema

[george GraphQL schema](../../packages/pothos-graphql)

## Docker build

```bash
docker build -f apps/georgeai-backend/Dockerfile -t gai-backend:local .
```

## Docker run

```bash
docker run --rm -p 3003:3003 gai-backend:local
```
