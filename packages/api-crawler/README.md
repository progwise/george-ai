# @george-ai/api-crawler

API crawler package for George AI - crawl REST/GraphQL APIs and extract structured data.

## Features

- **Authentication**: API Key, OAuth2, Basic Auth, Bearer Token
- **Pagination**: Offset-based, page-based, cursor-based, or none
- **Field Mapping**: Extract data using JSONPath expressions
- **Templates**: Pre-configured templates for Shopware, Weclapp, and generic REST APIs
- **Rate Limiting**: Control request frequency and concurrency
- **Functional Design**: Pure functions, no classes, easy to test

## Installation

```bash
pnpm add @george-ai/api-crawler
```

## Usage

```typescript
import { crawlApi, shopwareTemplate } from '@george-ai/api-crawler'

const config = {
  ...shopwareTemplate,
  baseUrl: 'https://shop.example.com',
  authConfig: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    tokenUrl: 'https://shop.example.com/api/oauth/token',
  },
}

const result = await crawlApi(config)
console.log(`Fetched ${result.totalFetched} items`)
```

## API

### `crawlApi(config: ApiCrawlerConfig): Promise<CrawlResult>`

Main function to crawl an API endpoint.

### `validateApiConnection(config: ApiCrawlerConfig): Promise<ValidationResult>`

Validate API connection before crawling.

### Templates

- `shopwareTemplate` - Shopware e-commerce API
- `weclappTemplate` - Weclapp ERP API
- `genericRestTemplate` - Generic REST API

## License

SEE LICENSE IN LICENSE
