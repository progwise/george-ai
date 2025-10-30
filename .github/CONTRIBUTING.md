# Contributing to George AI

Thank you for your interest in contributing to George AI! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Project Structure](#project-structure)
- [Common Patterns](#common-patterns)
- [License](#license)

---

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to providing a welcoming and inclusive environment for all contributors.

---

## Getting Started

For complete development environment setup, see the **[Developer Setup Guide](../docs/developer-setup.md)**.

**Quick start:**

1. Fork and clone the repository
2. Open in DevContainer (VS Code)
3. Run `pnpm install`
4. Configure `.env` file
5. Set up Keycloak
6. Run database migrations
7. Start with `pnpm dev`

The Developer Setup Guide contains detailed instructions for all steps.

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# Or for bug fixes:
git checkout -b fix/bug-description
```

**Branch Naming Convention:**

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

Follow these guidelines:

- Write clean, readable code
- Follow the established code patterns (see [Common Patterns](#common-patterns))
- Add comments for complex logic
- Update documentation if needed
- Write tests for new features

### 3. Run Quality Checks

Before committing, always run:

```bash
# Format code with Prettier (from root)
pnpm format

# TypeScript type checking (from root)
pnpm typecheck

# Linting (from root)
pnpm lint

# Tests (from root)
pnpm test
```

**CRITICAL:** All checks must pass before submitting a pull request. The CI/CD pipeline will fail if code is not properly formatted.

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Message Guidelines](#commit-message-guidelines) for details.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to the [George AI repository](https://github.com/progwise/george-ai)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template
5. Submit the PR

---

## Code Style and Standards

### Prettier Formatting

The project uses Prettier for automatic code formatting. Configuration is in `.prettierrc`.

**IMPORTANT:** Always run `pnpm format` before committing. The CI pipeline will fail if code is not formatted correctly.

```bash
# Format all files
pnpm format

# Check formatting without modifying files
pnpm format:check
```

### TypeScript/JavaScript Style

**Formatting Rules (enforced by Prettier):**

```typescript
// ✅ NO semicolons
const foo = 'bar'

// ✅ ALWAYS use trailing commas
const obj = {
  foo: 'bar',
  baz: 'qux',
}

const arr = ['item1', 'item2']

// ✅ Use single quotes
const message = 'Hello world'

// ✅ Use template literals for string interpolation
const greeting = `Hello ${name}`
```

### Import Organization

Always place imports at the top of files:

```typescript
// ✅ Correct
import { prisma } from '../../prisma'
import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: MyModule')

// ❌ Wrong - imports at bottom
console.log('Setting up: MyModule')
// Linter will reject this
```

### File Naming

- **React Components** (chat-web): kebab-case with `.tsx` extension
  - `user-avatar.tsx`, `assistant-card.tsx`
- **Astro Components** (marketing-web): PascalCase with `.astro` extension
  - `BowlerLogo.astro`, `ContactFormModal.astro`
- **TypeScript Files**: kebab-case with `.ts` extension
  - `format-date.ts`, `get-user-data.ts`, `enrichment-queue-worker.ts`
- **Directories**: kebab-case
  - `user-profile/`, `file-upload/`

### Code Organization

#### Frontend Structure

```
apps/chat-web/app/
├── components/
│   ├── library/                    # Feature modules
│   │   ├── queries/                # GET operations (read data)
│   │   │   └── get-libraries.ts
│   │   ├── server-functions/       # POST operations (write data)
│   │   │   └── create-library.ts
│   │   └── library-form.tsx        # React components
│   ├── ui/                         # Reusable UI components
│   └── layout/                     # Layout components
├── routes/                         # File-based routing
├── i18n/                          # Translations
└── icons/                         # Icon components
```

#### Backend Structure

```
packages/pothos-graphql/src/graphql/
├── my-feature/
│   ├── index.ts        # Prisma object definitions
│   ├── queries.ts      # Query fields + custom types
│   ├── mutations.ts    # Mutation fields + custom types
│   └── types.ts        # (Optional) Shared custom types
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

**Unit Tests:**

```typescript
import { describe, expect, it } from 'vitest'

describe('formatFileSize', () => {
  it('should convert bytes to MB', () => {
    expect(formatFileSize(5242880)).toBe('5')
  })

  it('should handle zero bytes', () => {
    expect(formatFileSize(0)).toBe('0')
  })
})
```

**Integration Tests:**

```typescript
import { expect, test } from '@playwright/test'

test('user can create a library', async ({ page }) => {
  await page.goto('http://localhost:3001/libraries')
  await page.click('text=Create Library')
  await page.fill('input[name="name"]', 'Test Library')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Test Library')).toBeVisible()
})
```

### Test Coverage

We aim for:

- **Unit tests**: 80%+ coverage for utility functions
- **Integration tests**: Critical user flows
- **E2E tests**: Main application features

---

## Pull Request Process

### Before Submitting

1. **Run all quality checks**

   ```bash
   pnpm format
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

2. **Update documentation** if needed
3. **Add tests** for new features
4. **Test manually** in the browser

### PR Requirements

Your PR must:

- ✅ Pass all CI checks (format, type check, lint, tests)
- ✅ Have a clear description
- ✅ Reference related issues (e.g., "Closes #123")
- ✅ Include screenshots for UI changes
- ✅ Be based on the latest `main` branch
- ✅ Have meaningful commit messages
- ✅ Not include unrelated changes

### Review Process

1. **Automated checks** run on every PR
2. **Maintainer review** - At least one approval required
3. **Address feedback** - Make requested changes
4. **Approval and merge** - Maintainer will merge when ready

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `style`: Code style changes (formatting, etc.)
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(library): add API key generation"

# Bug fix
git commit -m "fix(auth): resolve token refresh issue"

# Documentation
git commit -m "docs: update self-hosting guide"

# Multiple lines
git commit -m "feat(search): add advanced search filters

- Added filter by date range
- Added filter by file type
- Updated UI with new filter controls

Closes #123"
```

### Scope

The scope should be the affected module or feature:

- `library` - Library management
- `auth` - Authentication
- `search` - Search functionality
- `ui` - User interface
- `api` - API/GraphQL
- `db` - Database/Prisma

---

## Project Structure

### Monorepo Layout

```
george-ai/
├── apps/
│   ├── chat-web/              # Frontend (React, Vite, TanStack)
│   ├── georgeai-server/       # Backend (Express, GraphQL Yoga)
│   └── marketing-web/         # Marketing website (Astro)
├── packages/
│   ├── pothos-graphql/        # GraphQL schema + Prisma
│   ├── langchain-chat/        # AI integration
│   ├── ai-act/                # EU AI Act compliance
│   └── web-utils/             # Shared utilities
├── docs/                      # Documentation
├── .devcontainer/             # DevContainer configuration
└── .github/                   # GitHub workflows
```

### Tech Stack

**Frontend:**

- React 19 with TypeScript
- TanStack Router (file-based routing)
- TanStack Query (data fetching)
- Vite (build tool)
- Tailwind CSS (styling)
- DaisyUI (component library)

**Backend:**

- Node.js with Express
- GraphQL Yoga
- Pothos (code-first GraphQL)
- Prisma (ORM)
- Keycloak (authentication)

**Services:**

- PostgreSQL (database)
- Typesense (vector search)
- Keycloak (auth)
- Ollama (optional local LLM)

---

## Common Patterns

For detailed code patterns and examples, see [Code Patterns Guide](../docs/patterns.md) and [Architecture Documentation](../docs/architecture.md).

### Key Patterns Summary

- **GraphQL Queries**: Only export `queryOptions`, not query documents
- **GraphQL Mutations**: Export server functions, not mutation documents
- **Form Validation**: Shared Zod schemas with i18n support
- **Dialog Modals**: Use ref-based dialogs, not state-based
- **Toast Notifications**: Use `toastError()`, `toastSuccess()`, `toastWarning()`
- **Conditional Styling**: Always use `twMerge()` from `tailwind-merge`

---

## License

George AI is licensed under the **Business Source License 1.1 (BSL 1.1)**.

### What This Means for Contributors

By contributing to George AI, you agree that:

1. **Your Contributions**: Your contributions will be licensed under the same BSL 1.1 license
2. **Copyright**: Copyright remains with the original licensor (Michael H. Vogt Software Development)
3. **Non-Commercial Use**: The software can be used for internal, non-commercial purposes
4. **Commercial Use**: Commercial hosting or SaaS offerings require a separate commercial license
5. **Change Date**: On 2029-01-01, the license will change to Apache License 2.0
6. **Enterprise Modules**: Some modules and marketing materials remain proprietary

### Contributor License Agreement (CLA)

By submitting a pull request, you certify that:

- You have the right to submit the contribution
- You grant the project maintainers a perpetual, worldwide, non-exclusive license to use your contribution
- Your contribution is provided "as-is" without warranties

For full license details, see the [LICENSE](../LICENSE) file.

---

## Getting Help

### Resources

- **Documentation**: https://george-ai.net/docs
- **Developer Setup**: [../docs/developer-setup.md](../docs/developer-setup.md)
- **Self-Hosting Guide**: [../docs/self-hosting.md](../docs/self-hosting.md)
- **Architecture**: [../docs/architecture.md](../docs/architecture.md)
- **Security Policy**: [SECURITY.md](SECURITY.md)

### Community

- **Discord**: https://discord.gg/5XP8f2Qe
- **GitHub Issues**: https://github.com/progwise/george-ai/issues
- **GitHub Discussions**: https://github.com/progwise/george-ai/discussions

### Asking Questions

When asking for help:

1. **Search first** - Check if your question has been answered
2. **Be specific** - Provide details about your issue
3. **Include context** - OS, browser, error messages, steps to reproduce
4. **Share code** - Use code blocks for better readability

### Reporting Bugs

Use the bug report template when creating an issue. Include:

- **Description**: What happened vs. what you expected
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Environment**: OS, browser, George AI version
- **Logs**: Relevant error messages or console output
- **Screenshots**: If applicable

### Security Issues

**DO NOT** open a public issue for security vulnerabilities. Instead, please see our [Security Policy](SECURITY.md) for how to report security issues responsibly.

---

## Thank You!

Thank you for contributing to George AI! Every contribution, whether it's code, documentation, bug reports, or feedback, helps make the project better.

We appreciate your time and effort! 🎉
