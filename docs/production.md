# How to maintain production

## Login

```bash
ssh swarm@82.165.141.156 -i ~/.ssh/swarm_id_rsa
```

The ssh key is stored on bitwarden.

## List stacks

```bash
docker stack ls
```

## List all services

```bash
docker service ls
```

## Logs of services

```bash
docker service logs george-ai_gai-backend -t
docker service logs george-ai_gai-chatweb -t
docker service logs george-ai_gai-typesense -t
docker service logs george-ai_gai-keycloak -t
docker service logs george-ai_gai-keycloak-db -t
```
