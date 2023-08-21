import { Client } from 'typesense'

export const client = new Client({
  nodes: [
    {
      host: process.env.FGE_TYPESENSE_API_HOST ?? '',
      port: Number.parseInt(process.env.FGE_TYPESENSE_API_PORT ?? '0'),
      protocol: process.env.FGE_TYPESENSE_API_PROTOCOL ?? '',
    },
  ],
  apiKey: process.env.FGE_TYPESENSE_API_KEY ?? '',
})
