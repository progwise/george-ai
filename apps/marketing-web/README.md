# George AI Marketing Website

The public-facing marketing website for George AI, built with Astro and deployed to production at [george-ai.net](https://george-ai.net).

## Overview

This is a static marketing site showcasing George AI's features, use cases, and pricing. It uses Astro for fast static site generation and DaisyUI with Tailwind CSS v4 for styling.

**Production Site:** https://george-ai.net

## Tech Stack

- **Astro 5** - Static site generator with file-based routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS component library
- **TypeScript** - Type safety
- **Nginx** - Production web server (Docker)

## Project Structure

```text
/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable Astro components (icons, logos, etc.)
│   ├── layouts/      # Layout components (Layout.astro)
│   ├── pages/        # File-based routing
│   │   ├── index.astro      # Homepage
│   │   ├── features.astro   # Features page
│   │   ├── use-cases.astro  # Use cases page
│   │   ├── pricing.astro    # Pricing page
│   │   ├── docs.astro       # Documentation page
│   │   └── contact.astro    # Contact page
│   ├── styles/       # Global CSS
│   └── utils/        # Utility functions (cn.ts for class merging)
├── Dockerfile        # Production Docker build
├── nginx.conf        # Nginx configuration
└── astro.config.mjs  # Astro configuration
```

## Development

### Prerequisites

This app is part of the George AI monorepo. From the repository root:

```bash
pnpm install
```

### Running Locally

From the repository root or the `apps/marketing-web` directory:

```bash
# Start dev server (with host binding for devcontainer)
pnpm dev

# The site runs on http://localhost:4321 by default
```

### Other Commands

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run TypeScript type checking
pnpm typecheck

# Run linting
pnpm lint

# Run Astro CLI commands
pnpm astro --help
```

## Docker Deployment

The marketing site is deployed as a static site served by Nginx.

### Building the Docker Image

**Important:** Build from the repository root to include monorepo dependencies:

```bash
docker build -f apps/marketing-web/Dockerfile -t george-ai-marketing:local .
```

### Running the Docker Container

```bash
docker run -p 8080:8080 george-ai-marketing:local
```

The site will be available at http://localhost:8080

### Security Features

- **Non-root user**: Runs as user `nginx-user` (uid 1001)
- **Non-privileged port**: Listens on port 8080 instead of 80
- **Health checks**: Built-in health check endpoint
- **Minimal image**: Uses nginx:alpine for small footprint

## Configuration

### Site URL

The site URL is configured in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://george-ai.net',
  output: 'static',
  integrations: [sitemap()],
})
```

### Environment-Aware App URLs

Pages dynamically adjust the app URL based on the environment:

- **Development**: `http://localhost:3001`
- **Production**: `https://app.george-ai.net`

This is handled via `import.meta.env.DEV` in page components.

## Styling

The project uses:

- **Tailwind CSS v4** with the `@tailwindcss/vite` plugin
- **DaisyUI** for pre-built components (cards, buttons, badges, etc.)
- **tailwind-merge** for conditional class merging

Example usage:

```typescript
import { cn } from '../utils/cn'

<div class={cn('btn', isActive && 'btn-primary')} />
```

## License

This marketing website is proprietary content. See the [root LICENSE](../../LICENSE) for details.

**Contact:** info@george-ai.net
