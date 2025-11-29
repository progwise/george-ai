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
import { crawlApiStream, shopwareTemplate } from '@george-ai/api-crawler'

const config = {
  ...shopwareTemplate,
  baseUrl: 'https://shop.example.com',
  authConfig: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    tokenUrl: 'https://shop.example.com/api/oauth/token',
  },
}

// Stream items as they are fetched
for await (const item of crawlApiStream(config)) {
  console.log(`Fetched: ${item.title} from ${item.originUri}`)
}
```

## API

### `crawlApiStream(config: ApiCrawlerConfig): AsyncGenerator<CrawlItem>`

Stream items from an API endpoint. Each item includes:

- `title` - Auto-extracted from common field names (name, title, label, etc.)
- `content` - JSON string representation of the item
- `raw` - Complete raw item data
- `originUri` - The URI that was fetched to retrieve this item

### Templates

- `shopwareTemplate` - Shopware e-commerce API
- `weclappTemplate` - Weclapp ERP API
- `genericRestTemplate` - Generic REST API

## License

SEE LICENSE IN LICENSE
