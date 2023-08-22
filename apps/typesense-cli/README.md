# typesense-cli

## Typesense CLI Tool

This tool is designed to interface with Typesense and help manage its collections, specifically scraped web pages summaries.

### Overview of files

- **build.collection.ts**: The main script responsible for querying data from a Strapi GraphQL endpoint and using the result to rebuild the `scraped_web_pages_summaries` collection in Typesense.
- **typesense.ts**: This file sets up the Typesense client to communicate with a Typesense server.
- **package.json**: Contains the meta information and scripts related to this CLI tool.

### Prerequisites

Ensure you have the following environment variables set:

- `STRAPI_API_KEY`: Your API key to access the Strapi GraphQL endpoint.
- `TYPESENSE_API_HOST`: Host of your Typesense server.
- `TYPESENSE_API_PORT`: Port of your Typesense server.
- `TYPESENSE_API_PROTOCOL`: Protocol (http or https) of your Typesense server.
- `TYPESENSE_API_KEY`: Your API key to access the Typesense server.

You can set these using a `.env` file at the root or manually exporting them in your terminal session.

### Dependencies

- `dotenv-cli`: To load environment variables.
- `eslint`: For linting TypeScript code.
- `ts-node`: To run TypeScript scripts directly.
- `typesense`: The official Typesense client for JavaScript/TypeScript.

### How to use

1. **Setup**: Ensure you have `yarn` installed. Install the required dependencies:

   ```bash
   yarn install
   ```

2. **Rebuild Collection**:

   To rebuild the `scraped_web_pages_summaries` collection in Typesense with scraped webpage summaries from the Strapi GraphQL endpoint:

   ```bash
   yarn rebuildcollection
   ```

3. **TypeScript Compilation**: To compile TypeScript files:

   ```bash
   yarn tsc
   ```

4. **Linting**: To check the code for linting errors:

   ```bash
   yarn lint
   ```

### Important Note

The script `build.collection.ts` will delete the `scraped_web_pages_summaries` collection in Typesense if it exists and then recreate it. Please use with caution.
