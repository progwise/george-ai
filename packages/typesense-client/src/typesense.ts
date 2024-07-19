import { Client } from 'typesense'
import dotenv from 'dotenv'
dotenv.config()
export const typesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_API_HOST ?? '',
      port: Number.parseInt(process.env.TYPESENSE_API_PORT ?? '0'),
      protocol: process.env.TYPESENSE_API_PROTOCOL ?? '',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? '',
})
