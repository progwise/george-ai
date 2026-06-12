# George AI Web Application

The main web application for George AI, built with TanStack Start and React.

## Tech Stack

- **TanStack Start** - Full-stack React framework (SSR)
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Server state management
- **React 19** - UI library
- **Tailwind CSS v4** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS component library
- **Keycloak** - Authentication
- **GraphQL** - API layer with graphql-codegen for type generation
- **Node.js** - Production web server (Docker)

## Development

### Prerequisites

This app is part of the George AI monorepo. From the repository root:

```bash
pnpm install
```

You need to create and edit the `.env` file before starting:

```bash
cp .env.example .env
# Edit .env and fill in the required values
```

### Running Locally

From the repository root or the `apps/georgeai-webapp` directory:

```bash
pnpm dev
# The app runs on http://localhost:3001
```

### Other Commands

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Run TypeScript type checking
pnpm typecheck

# Run linting
pnpm lint

# Regenerate GraphQL types (requires the GraphQL backend to be running via pnpm dev on the root level)
pnpm codegen
```

## Docker build

**Important:** Build from the repository root to include monorepo dependencies:

```bash
docker build -f apps/georgeai-webapp/Dockerfile -t georgeai-webapp:local .
```

## Docker run

```bash
docker run --rm -p 3000:3000 georgeai-webapp:local
```

The app will be available at http://localhost:3000
