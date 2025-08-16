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

**Code Formatting**: The project uses Prettier for consistent code formatting. Configuration is defined in `.prettierrc` with settings for:

- **NO semicolons** (`semi: false`)
- Single quotes (`singleQuote: true`)
- Trailing commas everywhere (`trailingComma: "all"`)
- Print width of 120 characters
- Auto-sorted imports with separation
- Tailwind class sorting

**CRITICAL**:

- The codebase uses NO SEMICOLONS at the end of statements
- Always include trailing commas in arrays and objects
- Always run `pnpm format` before committing code changes to ensure consistent formatting across the codebase

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

## Toast Notifications

Toast notifications are handled by the custom George toast system located in `apps/chat-web/app/components/georgeToaster.tsx`.

### Available Toast Functions

```typescript
import { toastError, toastSuccess, toastWarning } from '../georgeToaster'

// Success toast (green with check icon)
toastSuccess('Operation completed successfully')

// Error toast (red with error icon)
toastError('Something went wrong')

// Warning toast (yellow with check icon)
toastWarning('Please review this action')
```

### Typical Usage in useMutation

```typescript
import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'

const { t } = useTranslation()

const mutation = useMutation({
  mutationFn: async (data) => {
    return await serverFunction({ data })
  },
  onSuccess: (data) => {
    // Show success toast with returned data
    toastSuccess(t('lists.fields.addSuccess', { name: data.addListField.name }))

    // Other success logic...
    queryClient.invalidateQueries({ queryKey: ['SomeKey'] })
  },
  onError: (error) => {
    // Show error toast
    toastError(error.message || t('errors.unexpectedError'))
  },
})
```

### Toast with Translation Parameters

Many toasts use dynamic content with translation parameters:

```typescript
// Translation key: "Field \"{name}\" added successfully"
toastSuccess(t('lists.fields.addSuccess', { name: data.addListField.name }))

// Translation key: "Field \"{name}\" deleted successfully"
toastSuccess(t('lists.fields.removeSuccess', { name: field.name }))
```

### Hidden Form Fields vs Manual FormData

Instead of manually appending to FormData, use hidden input fields for cleaner code:

```typescript
// ❌ Manual FormData manipulation
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  formData.append('listId', listId)
  formData.append('sourceType', 'llm_computed')
  // ... more manual appends
}

// ✅ Use hidden fields in JSX
<form onSubmit={handleSubmit}>
  <input type="hidden" name="listId" value={listId} />
  <input type="hidden" name="sourceType" value="llm_computed" />
  <input type="hidden" name="order" value={editField?.order?.toString() || (maxOrder + 1).toString()} />
  {/* visible form fields */}
</form>
```

## React Patterns

### Avoiding ESLint useEffect Warnings

When ESLint warns about calling `setState` directly in `useEffect`, use the setTimeout pattern to defer the state update:

```typescript
// ❌ This triggers ESLint warning
useEffect(() => {
  setFieldVisibility((prev) => {
    // state update logic
  })
}, [dependency])

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

This pattern is commonly used throughout the codebase for state updates that need to happen in response to dependency changes.

### useLocalStorage Hook

For state that should persist in localStorage, use the `useLocalstorage` hook instead of manual localStorage calls:

```typescript
import { useLocalstorage } from '../../hooks/use-local-storage'

// ❌ Manual localStorage handling
const [state, setState] = useState(defaultValue)
useEffect(() => {
  const saved = localStorage.getItem(key)
  if (saved) {
    setState(JSON.parse(saved))
  }
}, [])

// Save manually
const updateState = (newValue) => {
  setState(newValue)
  localStorage.setItem(key, JSON.stringify(newValue))
}

// ✅ Use useLocalStorage hook
const [state, setState] = useLocalstorage('key', defaultValue)

// Supports both direct values and function updaters
setState(newValue)                    // Direct value
setState(prev => ({ ...prev, new })) // Function updater

// Supports function as initial value
const [state, setState] = useLocalstorage('key', () => computeInitialValue())
```

**SSR Considerations**: The hook uses useEffect to load localStorage values after hydration to prevent server/client mismatches. This means there may be a brief flash of default values before localStorage values load.

## Conditional Styling with twMerge

For conditional classNames, always use `twMerge` from `tailwind-merge` to properly merge Tailwind classes and avoid conflicts:

### Basic Usage

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

### Common Patterns

```typescript
// Conditional styling based on state
<span
  className={twMerge(
    'flex-1 overflow-hidden text-nowrap',
    !value && 'text-base-content/40 text-xs italic'
  )}
>
  {content}
</span>

// Multiple conditions
<button
  className={twMerge(
    'btn btn-ghost btn-xs',
    isActive && 'btn-primary',
    isDisabled && 'btn-disabled opacity-50',
    size === 'small' && 'btn-sm'
  )}
>
  Button
</button>

// Complex conditional logic
<div
  className={twMerge(
    'border rounded p-4',
    variant === 'success' && 'border-green-500 bg-green-50',
    variant === 'error' && 'border-red-500 bg-red-50',
    variant === 'warning' && 'border-yellow-500 bg-yellow-50',
    isCompact && 'p-2',
    fullWidth && 'w-full'
  )}
>
  Content
</div>
```

### Benefits of twMerge

- **Conflict Resolution**: Later classes override earlier conflicting ones
- **Deduplication**: Removes duplicate classes
- **Tailwind-Aware**: Understands Tailwind's class structure and variants
- **Performance**: Optimizes the final className string
- **Type Safety**: Works well with TypeScript

### When to Use twMerge

- Any time you have conditional classes
- When combining base classes with dynamic classes
- When building reusable components with variant props
- When you need to ensure proper Tailwind class precedence

## Icon Components

The project has a standardized set of icon components in `apps/chat-web/app/icons/`. Always use these icon components instead of inline SVG code.

### Available Icons

Common icons include:

- `PlusIcon` - For add/create actions
- `EditIcon` - For edit actions
- `TrashIcon` - For delete actions
- `MenuEllipsisIcon` - For dropdown menus (three dots)
- `CrossIcon` - For close/cancel actions
- `CheckIcon` - For success/confirm actions

### Usage Pattern

```typescript
import { PlusIcon } from '../../icons/plus-icon'
import { EditIcon } from '../../icons/edit-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { MenuEllipsisIcon } from '../../icons/menu-ellipsis-icon'

// ❌ Don't use inline SVG
<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
</svg>

// ✅ Use icon components
<PlusIcon className="h-4 w-4" />
<EditIcon className="mr-2" />
<TrashIcon className="mr-2" />
<MenuEllipsisIcon className="h-3 w-3" />
```

### Benefits

- **Consistency**: Same icons across the application
- **Maintainability**: Update icons in one place
- **Reusability**: Icons can be reused anywhere
- **Type Safety**: TypeScript support with proper props
- **Performance**: Optimized SVG components

### When to Create New Icons

If you need an icon that doesn't exist:

1. Check if a similar existing icon can be used
2. Create a new icon component following the same pattern as existing icons
3. Use the `IconProps` interface from `icon-props.ts`
4. Follow the naming convention: `[Name]Icon` (e.g., `SettingsIcon`)

## Important Patterns

### Server Functions vs Direct Backend Calls

**CRITICAL**: Never call `backendRequest` directly from frontend components. Always use `createServerFn` to create server functions that handle GraphQL operations.

#### ❌ Wrong Way (Direct Backend Call)

```typescript
// DON'T DO THIS in components
import { backendRequest } from '../../server-functions/backend'

const mutation = useMutation({
  mutationFn: async (data) => {
    return backendRequest(graphqlMutation, { data }) // Wrong!
  },
})
```

#### ✅ Correct Way (Server Function with Translatable Validation)

##### Example: Server Function with Exported Schema (update-list.ts pattern)

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { Language, getLanguage, translate } from '../../i18n'
import { backendRequest } from '../../server-functions/backend'

// Export schema function for form validation
export const getUpdateListSchema = (language: Language) =>
  z.object({
    id: z.string().nonempty(translate('lists.idRequired', language)),
    name: z.string().nonempty(translate('lists.nameRequired', language)),
  })

// Server function using FormData
export const updateList = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getUpdateListSchema(language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation updateList($id: String!, $data: AiListInput!) {
          updateList(id: $id, data: $data) {
            id
          }
        }
      `),
      { id: data.id, data: { name: data.name } },
    )
  })
```

##### Using the Schema in Forms

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { getUpdateListSchema } from './update-list'

const EditForm = () => {
  const { language } = useTranslation()
  const schema = getUpdateListSchema(language)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { id: '', name: '' },
  })

  const handleSubmit = async (values) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value)
    })
    await updateList({ data: formData })
  }
}
```

##### Server Function with Direct Data (not FormData)

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { AiListFieldInputSchema } from '../../gql/validation'
import { Language, getLanguage, translate } from '../../i18n'

// Export schema for reuse in forms
export const getAddListFieldSchema = (language: Language) =>
  z.object({
    listId: z.string().nonempty(translate('lists.fields.listIdRequired', language)),
    data: AiListFieldInputSchema(), // Reuse generated GraphQL schema
  })

export const addListField = createServerFn({ method: 'POST' })
  .validator(async (data: { listId: string; data: any }) => {
    const language = await getLanguage()
    return getAddListFieldSchema(language).parse(data)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(graphql(`mutation { ... }`), { listId: data.listId, data: data.data })
  })

// Usage in component
const mutation = useMutation({
  mutationFn: async (fieldData: AiListFieldInput) => {
    return await addListField({ data: { listId, data: fieldData } })
  },
})
```

### Key Requirements for Server Functions

1. **Export Schema Function**: Always export `getXxxSchema(language)` function for form validation
2. **Translated Error Messages**: Use `translate()` for validation error messages
3. **Language Detection**: Use `await getLanguage()` in validator
4. **Await Context Data**: Use `await ctx.data` in handler
5. **FormData Support**: Accept FormData for forms, use `Object.fromEntries(formData)`
6. **Type Safety**: Reuse generated GraphQL schemas from `gql/validation.ts`

## Form Validation Pattern

The codebase uses a consistent pattern for form validation that provides type safety, internationalization, and reusability across client and server.

### Pattern Overview

1. **Shared Schema Definition**: Define Zod schemas that can be used both client-side and server-side
2. **Internationalized Validation**: All validation messages use the translation system
3. **FormData Handling**: Use `getDataFromForm` utility for handling multiple checkbox values
4. **Client-Side Validation**: Validate before submission to provide immediate feedback
5. **Server-Side Validation**: Always validate on server for security

### Complete Example: Field Modal Pattern

#### 1. Define Shared Schema (field-modal.tsx)

```typescript
import { z } from 'zod'
import { Language, translate } from '../../i18n'

// Export schema function for reuse in both client and server
export const getListFieldFormSchema = (editMode: 'update' | 'create', language: Language) =>
  z.object({
    id:
      editMode === 'update'
        ? z.string().nonempty(translate('lists.fields.fieldIdRequired', language))
        : z.string().optional(),
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
    useMarkdown: z
      .string()
      .optional()
      .transform((val) => val === 'on'),
  })
```

#### 2. Server Function with Validation (add-list-field.ts)

```typescript
import { createServerFn } from '@tanstack/react-start'
import { getLanguage } from '../../i18n'
import { getListFieldFormSchema } from './field-modal'

export const addListField = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getListFieldFormSchema('create', language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(/* GraphQL mutation */, data)
  })
```

#### 3. Client-Side Form Handling (field-modal.tsx)

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

#### 4. FormData Utilities (web-utils/form.ts)

```typescript
// Validates form and returns processed FormData with errors
export const validateForm = <T extends ZodRawShape>(
  form: HTMLFormElement, 
  schema: z.ZodObject<T>
) => {
  const formData = getDataFromForm(form)
  const formObject = Object.fromEntries(formData)
  const parseResult = schema.safeParse(formObject)
  
  if (!parseResult.success) {
    const errors = parseResult.error.errors.map((error) => {
      const path = error.path.join('.')
      return `${path}: ${error.message}`
    })
    return { formData, errors }
  }
  
  return { formData, errors: null }
}

// Handles multiple checkbox values by joining them with commas
export const getDataFromForm = (form: HTMLFormElement) => {
  const originalFormData = new FormData(form)
  const newFormData = new FormData()
  
  for (const [key, value] of originalFormData.entries()) {
    if (originalFormData.getAll(key).length > 1) {
      // Join multiple values (e.g., checkboxes) with commas
      newFormData.append(key, originalFormData.getAll(key).join(','))
    } else {
      newFormData.append(key, value)
    }
  }
  
  return newFormData
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

- **Zod cannot parse FormData directly**: Always use `Object.fromEntries(formData)` before parsing
- **Multiple checkbox handling**: Use `getDataFromForm` utility to handle multiple values
- **Translation keys**: Add validation messages to both `en.ts` and `de.ts` files
- **Error display**: Show all validation errors at once for better UX (not just the first one)

#### FormData Processing Pattern

For TanStack createServerFn with FormData, always use this pattern:

```typescript
export const serverFunction = createServerFn({ method: 'POST' })
  .validator((formData: FormData) => {
    const data = Object.fromEntries(formData) // Convert FormData to object
    return schema.parse(data) // Validate with Zod
  })
  .handler(async ({ data }) => {
    // Use validated data here
    const result = await backendRequest(GraphQLDocument, data)
    return result.someField
  })
```

**Important**:

- Use `Object.fromEntries(formData)`, NOT `Object.fromEntries(formData.getAll)`
- The `getAll` method is for getting multiple values for the same field name
- For simple form data, `Object.fromEntries(formData)` is the correct pattern

### Benefits of This Pattern

- **Reusable Validation**: Same schema in forms and server functions
- **i18n Support**: Error messages in user's language
- **Type Safety**: Full TypeScript support with Zod
- **Form Integration**: Works seamlessly with react-hook-form
- **Server-Side Security**: Validation happens on server
- **Consistent Errors**: Same validation logic everywhere

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
