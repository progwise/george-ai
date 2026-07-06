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

## Enable stripe

To enable stripe you need a stripe account with an working api-key. You can goto stripe.com and create a test account first and an api key which usually starts with "sk*test*....".

Plus you need to enable the webhook by:

```bash

curl https://api.stripe.com/v1/webhook_endpoints \
  -u "sk_test_...:" \
  -d "enabled_events[]=charge.succeeded" \
  -d "enabled_events[]=charge.failed" \
  -d "enabled_events[]=invoice.paid" \
  --data-urlencode "url=https://BACKEND_PUBLIC_URL/stripe/webhook"

```

where you need to replace the BACKEND_PUBLIC_URL to your target url where the webhook should be called by stripe.

The response to this curl call should be like

```json
{
  "id": "we_1T...",
  "object": "webhook_endpoint",
  "api_version": null,
  "application": null,
  "created": 1783371770,
  "description": null,
  "enabled_events": [
    "charge.succeeded",
    "charge.failed",
    "invoice.paid"
  ],
  "livemode": false,
  "metadata": {},
  "secret": "whsec_9wq...",
  "status": "enabled",
  "url": "https://BACKEND_PUBLIC_URL/stripe/webhook
}%
```

You need to add both: The api key and the webhook secret to your environment of the backend.
