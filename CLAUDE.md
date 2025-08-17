# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

```bash
# Install dependencies (from root)
pnpm install

# Start all services (from root) - Note: backend may crash on file changes
pnpm dev

# Alternative: Run frontend and backend separately for stability
cd apps/georgeai-server && pnpm dev  # Backend on port 3003
cd apps/chat-web && pnpm dev         # Frontend on port 3001
```

### Code Quality

```bash
# Run all linting (from root)
pnpm lint

# Run TypeScript type checking (from root)
pnpm typecheck

# Format code with Prettier (from root)
pnpm format

# Run tests
pnpm test

# Generate GraphQL types (MUST run from /workspaces/george-ai/apps/chat-web ONLY)
cd /workspaces/george-ai/apps/chat-web && pnpm codegen
```

**Code Formatting**: The project uses Prettier for consistent code formatting. Configuration is defined in `.prettierrc`.

**CRITICAL**:

- **NO semicolons** at the end of statements
- **Always include trailing commas** in arrays and objects
- **Always run `pnpm format`** before committing code changes

### Database Management

```bash
# Navigate to Prisma package first
cd packages/pothos-graphql

# Run database migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Open Prisma Studio
pnpm prisma studio
```

### Testing

```bash
# Run unit tests (from package directories)
pnpm test

# Run E2E tests
cd e2e-tests && pnpm test

# Run specific test file
pnpm test path/to/test.spec.ts
```

## Architecture Overview

George AI is a monorepo using pnpm workspaces with the following structure:

### Frontend (apps/chat-web)

- React 19 with TanStack Router and TanStack Server (file-based routing at `app/routes/`)
- Vinxi build system (Vite-based)
- GraphQL client using graphql-request with generated types
- Authentication via Keycloak integration
- Tailwind CSS with twMerge for conditional classNames
- Port 3001

### Backend (apps/georgeai-server)

- Express server with GraphQL Yoga
- Pothos for code-first GraphQL schema generation
- JWT authentication with Keycloak integration
- Port 3003

### Core Packages

- **pothos-graphql**: GraphQL schema, resolvers, and Prisma database layer
- **langchain-chat**: AI integration with LangChain, supports Ollama and Typesense
- **ai-act**: EU AI Act compliance features
- **web-utils**: Shared utilities

### Services (via Docker Compose)

- PostgreSQL (5432): Main database
- Typesense (8108): Vector search for document embeddings
- Keycloak (8180): Authentication service
- Crawl4AI (11235): Python-based web crawler
- Ollama (11434): Local LLM support (optional)

## Form Validation Pattern

The codebase uses a consistent pattern for form validation that provides type safety, internationalization, and reusability across client and server.

### Core Principles

1. **Shared Schema Definition**: Define Zod schemas that can be used both client-side and server-side
2. **Internationalized Validation**: All validation messages use the translation system
3. **FormData Handling**: Use `validateForm` and `validateFormData` utilities for handling multiple checkbox values
4. **Client-Side Validation**: Validate before submission to provide immediate feedback
5. **Server-Side Validation**: Always validate on server for security

### Complete Example

#### 1. Define Shared Schema

```typescript
import { z } from 'zod'

import { Language, translate } from '../../i18n'

// Export schema function for reuse in both client and server
export const getListFieldFormSchema = (editMode: 'update' | 'create', language: Language) =>
  z.object({
    name: z
      .string()
      .min(2, translate('lists.fields.nameTooShort', language))
      .max(100, translate('lists.fields.nameTooLong', language)),
    prompt: z
      .string()
      .min(10, translate('lists.fields.promptTooShort', language))
      .max(2000, translate('lists.fields.promptTooLong', language)),
    // Handle comma-separated values for multiple checkboxes
    context: z
      .string()
      .optional()
      .transform((commaSeparatedList) => commaSeparatedList && commaSeparatedList.split(','))
      .pipe(z.array(z.string()).optional()),
    // Transform checkbox value to boolean
    useVectorStore: z
      .string()
      .optional()
      .transform((val) => val === 'on'),
  })
```

#### 2. Server Function with Validation

```typescript
import { createServerFn } from '@tanstack/react-start'
import { validateFormData } from '@george-ai/web-utils'
import { getLanguage } from '../../i18n'
import { getListFieldFormSchema } from './field-modal'

export const addListField = createServerFn({ method: 'POST' })
  .validator(async (formData: FormData) => {
    const language = await getLanguage()
    const schema = getListFieldFormSchema('create', language)
    const { data, errors } = validateFormData(formData, schema)

    if (errors) {
      throw new Error(errors.join(', '))
    }

    return data
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(/* GraphQL mutation */, data)
  })
```

#### 3. Client-Side Form Handling

```typescript
import { validateForm } from '@george-ai/web-utils'
import { toastError, toastSuccess } from '../georgeToaster'

const FieldModal = () => {
  const { t, language } = useTranslation()
  const schema = useMemo(
    () => getListFieldFormSchema(isEditMode ? 'update' : 'create', language),
    [isEditMode, language],
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate form and get processed FormData
    const { formData, errors } = validateForm(e.currentTarget, schema)

    if (errors) {
      // Show all validation errors as separate lines
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }

    // If validation passes, submit to server
    if (isEditMode) {
      updateFieldMutation.mutate(formData)
    } else {
      addFieldMutation.mutate(formData)
    }
  }
}
```

### Key Benefits

1. **Single Source of Truth**: One schema definition used everywhere
2. **Type Safety**: Full TypeScript support through Zod
3. **I18n Support**: All error messages in user's language
4. **Immediate Feedback**: Client-side validation for better UX
5. **Security**: Server-side validation ensures data integrity
6. **Reusability**: Schemas can be imported and reused across components
7. **Consistency**: Same validation logic on client and server

### Important Notes

- **Use validation utilities**: Always use `validateForm` (client) or `validateFormData` (server) instead of manual parsing
- **Multiple checkbox handling**: The validation utilities automatically handle multiple values by joining them with commas
- **Translation keys**: Add validation messages to both `en.ts` and `de.ts` files
- **Error display**: Show all validation errors at once for better UX (not just the first one)

## UI Patterns

### Toast Notifications

Toast notifications are handled by the custom George toast system located in `apps/chat-web/app/components/georgeToaster.tsx`.

```typescript
import { toastError, toastSuccess, toastWarning } from '../georgeToaster'

// Success toast (green with check icon)
toastSuccess('Operation completed successfully')

// Error toast (red with error icon)
toastError('Something went wrong')

// Warning toast (yellow with check icon)
toastWarning('Please review this action')
```

### Conditional Styling with twMerge

For conditional classNames, always use `twMerge` from `tailwind-merge` to properly merge Tailwind classes and avoid conflicts:

```typescript
import { twMerge } from 'tailwind-merge'

// ❌ String concatenation can cause conflicts
const className = `base-class ${condition ? 'conditional-class' : ''}`

// ✅ Use twMerge for proper class merging
const className = twMerge(
  'base-class',
  condition && 'conditional-class'
)
```

### Icon Components

The project has a standardized set of icon components in `apps/chat-web/app/icons/`. Always use these icon components instead of inline SVG code.

```typescript
import { PlusIcon } from '../../icons/plus-icon'
import { EditIcon } from '../../icons/edit-icon'

// ✅ Use icon components
<PlusIcon className="h-4 w-4" />
<EditIcon className="mr-2" />
```

### Utility Functions

#### String Helper Functions

The project includes several utility functions in `@george-ai/web-utils` for handling common string operations:

```typescript
import { formatFileSize, jsonArrayToString, parseCommaList } from '@george-ai/web-utils'

// formatFileSize: Converts bytes to MB for display
formatFileSize(5242880) // Returns: "5" (MB)

// jsonArrayToString: Converts array to comma-separated string for form fields
jsonArrayToString(['*.pdf', '*.docx']) // Returns: "*.pdf, *.docx"

// parseCommaList: Converts comma-separated string to array
parseCommaList('*.pdf, *.docx') // Returns: ['*.pdf', '*.docx']
```

These functions are particularly useful for form handling where arrays need to be displayed as strings in input fields and parsed back to arrays for processing.

### React Patterns

#### useLocalStorage Hook

For state that should persist in localStorage, use the `useLocalstorage` hook:

```typescript
import { useLocalstorage } from '../../hooks/use-local-storage'

const [state, setState] = useLocalstorage('key', defaultValue)

// Supports both direct values and function updaters
setState(newValue)                    // Direct value
setState(prev => ({ ...prev, new })) // Function updater
```

#### Avoiding ESLint useEffect Warnings

When ESLint warns about calling `setState` directly in `useEffect`, use the setTimeout pattern:

```typescript
// ✅ Use setTimeout pattern to avoid warning
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setFieldVisibility((prev) => {
      // state update logic
    })
  }, 0)

  return () => clearTimeout(timeoutId)
}, [dependency])
```

## Key Concepts

### Document Processing Flow

1. User uploads documents (PDF, Excel, Word) via GraphQL mutation
2. Backend stores files and creates database records for AiLibraries
3. LangChain processes documents into embeddings
4. Embeddings stored in Typesense for semantic search
5. AI assistants use embeddings for context-aware responses
6. Lists are used to enrich Libraries with fields

### GraphQL Schema Generation

- Schema defined in `packages/pothos-graphql/src/schema/`
- Use Pothos builder pattern for type-safe schema
- Run `cd /workspaces/george-ai/apps/chat-web && pnpm codegen` after schema changes to update TypeScript types

### Authentication Flow

- Keycloak handles user authentication
- JWT tokens validated on backend
- User context available in GraphQL resolvers via `ctx.user`

### AI Assistant Architecture

- Assistants defined with custom instructions
- Conversations maintain context with message history
- Documents linked to assistants for retrieval
- Multiple AI providers supported (OpenAI, Gemini, Ollama)

## Environment Setup

Required `.env` files:

- Root directory (for running both apps)
- `apps/georgeai-server` (if running separately)
- `apps/chat-web` (if running separately)
- `packages/pothos-graphql` (for Prisma commands)

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection
- `KEYCLOAK_*`: Authentication configuration
- `OPENAI_API_KEY`: For OpenAI models
- `TYPESENSE_*`: Vector search configuration
- `BACKEND_URL`: GraphQL endpoint for frontend

## Translation Files

Translation files are located in:

- **English**: `apps/chat-web/app/i18n/en.ts`
- **German**: `apps/chat-web/app/i18n/de.ts`

When adding new translation keys (especially for form validation), ensure both files are updated with the corresponding translations.

## Development Workflow

1. **Feature Development**:

   - Create/modify GraphQL schema in `pothos-graphql`
   - Run `cd /workspaces/george-ai/apps/chat-web && pnpm codegen` to generate types
   - Implement resolvers and business logic
   - Update frontend components and queries

2. **Database Changes**:

   - Modify Prisma schema in `packages/pothos-graphql/prisma/schema.prisma`
   - Create migration: `pnpm prisma migrate dev`
   - Update GraphQL schema if needed

3. **Adding AI Features**:

   - Implement in `packages/langchain-chat`
   - Use existing document/embedding infrastructure
   - Test with different AI providers

4. **Frontend Routes**:
   - Add new routes in `apps/chat-web/app/routes/`
   - Use file-based routing conventions
   - Leverage existing authentication and GraphQL hooks

## Important Guidelines

- **ALWAYS prefer editing existing files** in the codebase over creating new ones
- **NEVER write new files** unless explicitly required
- **NEVER proactively create documentation files** (\*.md) or README files unless requested
- **Always run linting and typecheck** commands before committing
- **NEVER commit changes** unless the user explicitly asks you to
- **Use the established patterns** described in this document for consistency
