# Code Patterns

Code conventions and best practices used throughout the George AI codebase.

## Table of Contents

- [Frontend Patterns](#frontend-patterns)
  - [React Component Structure](#react-component-structure)
  - [Data Fetching](#data-fetching-with-tanstack-router--query)
  - [Dialog Modals](#dialog-modals)
  - [Toast Notifications](#toast-notifications)
  - [Styling with twMerge](#conditional-styling-with-twmerge)
  - [Icon Components](#icon-components)
  - [LocalStorage Hook](#uselocalstorage-hook)
- [Backend Patterns](#backend-patterns)
  - [GraphQL Module Structure](#graphql-module-structure)
  - [Type Definitions](#custom-type-definitions)
  - [Prisma Objects](#prisma-object-definitions)
- [Full-Stack Patterns](#full-stack-patterns)
  - [Form Validation](#form-validation-pattern)

---

## Frontend Patterns

### React Component Structure

Component folders use two subfolders for backend access (both contain only `.ts` files, no `.tsx`):

```
components/
├── library/
│   ├── queries/           # Read operations (GET) - returns data
│   │   └── get-api-keys.ts
│   ├── server-functions/  # Write operations (POST) - mutations
│   │   ├── generate-api-key.ts
│   │   └── revoke-api-key.ts
│   └── library-form.tsx   # React components
```

**Query Pattern** - Never export GraphQL query documents, only `queryOptions`:

```typescript
// ✅ CORRECT: queries/get-api-keys.ts

import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

// Internal - NOT exported
const apiKeysQueryDocument = graphql(`
  query GetApiKeys($libraryId: ID!) {
    apiKeys(libraryId: $libraryId) { id name }
  }
`)

const getApiKeys = createServerFn({ method: 'GET' })
  .inputValidator(/* ... */)
  .handler(async (ctx) => {
    const { apiKeys } = await backendRequest(apiKeysQueryDocument, { ... })
    return apiKeys
  })

// ONLY export the queryOptions
export const getApiKeysQueryOptions = (libraryId: string) =>
  queryOptions({
    queryKey: ['apiKeys', libraryId],
    queryFn: () => getApiKeys({ data: { libraryId } }),
  })
```

**Server Function Pattern** - One operation per file in `server-functions/`:

```typescript
// ✅ CORRECT: server-functions/generate-api-key.ts
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

// Internal - NOT exported
const generateApiKeyMutationDocument = graphql(`
  mutation GenerateApiKey($libraryId: ID!, $name: String!) {
    generateApiKey(libraryId: $libraryId, name: $name) {
      id
      name
      key
    }
  }
`)

// ONLY export the server function
export const generateApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(({ libraryId, name }) => ({
    /* validation */
  }))
  .handler(async (ctx) => {
    const result = await backendRequest(generateApiKeyMutationDocument, ctx.data)
    return result.generateApiKey
  })
```

**Why?**

- GraphQL queries/mutations are implementation details (internal)
- Consumers use `queryOptions` for queries, server functions for mutations
- Keeps public API small, makes refactoring easier

---

### Data Fetching with TanStack Router + Query

Use this pattern for server-side data pre-fetching with client-side suspense:

```typescript
// Route definition with loader
export const Route = createFileRoute('/my-route')({
  component: MyComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(10),
  }),
  loaderDeps: ({ search: { skip, take } }) => ({ skip, take }),
  loader: async ({ context, deps }) => {
    // Pre-fetch data server-side
    await context.queryClient.ensureQueryData(getMyDataQueryOptions(deps.skip, deps.take))
  },
})

function MyComponent() {
  const { skip, take } = Route.useSearch()
  const { data } = useSuspenseQuery(getMyDataQueryOptions(skip, take))

  return <div>{data.items.map(...)}</div>
}
```

**Benefits:**

- Server-side pre-fetching (faster initial load)
- Client-side suspense (no loading states needed)
- URL-based state management
- Automatic invalidation

---

### Dialog Modals

**Rule:** Always use native `<dialog>` element with refs - NEVER use state-based visibility.

**Why?**

- Prevents re-render issues with `useSuspenseQuery`
- Native browser behavior (focus trap, ESC, backdrop)
- Cleaner code (no `isOpen` props)

**Pattern 1: Simple Forms** (use `DialogForm` component)

```typescript
import { useRef } from 'react'
import { DialogForm } from '../../components/dialog-form'

export const MyComponent = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleSubmit = (formData: FormData) => {
    // Handle submission
    dialogRef.current?.close()
  }

  return (
    <>
      <button onClick={() => dialogRef.current?.showModal()}>Open</button>

      <DialogForm
        ref={dialogRef}
        title="Dialog Title"
        onSubmit={handleSubmit}
        submitButtonText="Confirm"
      >
        <input name="field1" />
      </DialogForm>
    </>
  )
}
```

**Pattern 2: Custom Dialogs** (for complex multi-state modals)

```typescript
interface MyModalProps {
  ref: RefObject<HTMLDialogElement | null>
  libraryId: string
}

export const MyModal = ({ ref, libraryId }: MyModalProps) => {
  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box">
        <h3>Title</h3>
        <button onClick={() => ref.current?.close()}>Close</button>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  )
}
```

```typescript
// ✅ CORRECT: Using ref
const dialogRef = useRef<HTMLDialogElement>(null)
<MyModal ref={dialogRef} libraryId={id} />

// ❌ WRONG: Using state
const [isOpen, setIsOpen] = useState(false)
<MyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

---

### Toast Notifications

Use the George toast system (`apps/chat-web/app/components/georgeToaster.tsx`):

```typescript
import { toastError, toastSuccess, toastWarning } from '../georgeToaster'

toastSuccess('Operation completed') // Green with check
toastError('Something went wrong') // Red with error icon
toastWarning('Please review') // Yellow with check
```

---

### Conditional Styling with twMerge

Always use `twMerge` from `tailwind-merge` to properly merge Tailwind classes:

```typescript
import { twMerge } from 'tailwind-merge'

// ❌ Wrong: String concatenation causes conflicts
const className = `base-class ${condition ? 'conditional-class' : ''}`

// ✅ Correct: Use twMerge
const className = twMerge('base-class', condition && 'conditional-class')
```

---

### Icon Components

Use icon components from `apps/chat-web/app/icons/` instead of inline SVG:

```typescript
import { PlusIcon } from '../../icons/plus-icon'
import { EditIcon } from '../../icons/edit-icon'

// ✅ Use icon components
<PlusIcon className="h-4 w-4" />
<EditIcon className="mr-2" />
```

---

### useLocalStorage Hook

For state that persists in localStorage:

```typescript
import { useLocalstorage } from '../../hooks/use-local-storage'

const [state, setState] = useLocalstorage('key', defaultValue)

setState(newValue)                      // Direct value
setState((prev) => ({ ...prev, new }))  // Function updater
```

---

### Utility Functions

Common string operations from `@george-ai/web-utils`:

```typescript
import { formatFileSize, jsonArrayToString, parseCommaList } from '@george-ai/web-utils'

formatFileSize(5242880) // "5" (MB)
jsonArrayToString(['*.pdf', '*.docx']) // "*.pdf, *.docx"
parseCommaList('*.pdf, *.docx') // ['*.pdf', '*.docx']
```

---

### Avoiding ESLint useEffect Warnings

Use setTimeout pattern when ESLint warns about `setState` in `useEffect`:

```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setState((prev) => {
      /* update */
    })
  }, 0)

  return () => clearTimeout(timeoutId)
}, [dependency])
```

---

## Backend Patterns

### GraphQL Module Structure

Consistent structure in `packages/pothos-graphql/src/graphql/`:

```
graphql/
├── my-module/
│   ├── index.ts       # Prisma object definitions only
│   ├── queries.ts     # Query fields + custom types used by queries
│   ├── mutations.ts   # Mutation fields + custom types used by mutations
│   └── types.ts       # (Optional) Shared custom types
```

**Import Order** - Always imports at top:

```typescript
// ✅ CORRECT
import { builder } from '../builder'
import { prisma } from '../../prisma'

import './mutations'
import './queries'

console.log('Setting up: MyModule')
builder.prismaObject('MyModel', { ... })
```

```typescript
// ❌ WRONG: prettier/lint will reject
import { builder } from '../builder'
builder.prismaObject('MyModel', { ... })

import './mutations'  // ❌ Must be at top
```

---

### Custom Type Definitions

**Rule:** Define `simpleObject` types in the file where they're used, not in `index.ts`.

```typescript
// ✅ CORRECT: Define in mutations.ts (where used)
// graphql/api-key/mutations.ts

const ApiKeyWithSecret = builder.simpleObject('ApiKeyWithSecret', {
  fields: (t) => ({
    id: t.id({ nullable: false }),
    name: t.string({ nullable: false }),
    key: t.string({ nullable: false }),
  }),
})

builder.mutationField('generateApiKey', (t) =>
  t.field({
    type: ApiKeyWithSecret, // Use constant, not string
    // ...
  }),
)
```

```typescript
// ❌ WRONG: Don't define in index.ts
// graphql/api-key/index.ts
const ApiKeyWithSecret = builder.simpleObject(...)  // ❌
```

**When to use `types.ts`:**

- Type used by both `queries.ts` and `mutations.ts`
- Multiple related types form a logical group

```typescript
// graphql/queue-management/types.ts

export const QueueOperationResult = builder.simpleObject('QueueOperationResult', {
  fields: (t) => ({
    success: t.boolean({ nullable: false }),
    message: t.string({ nullable: false }),
  }),
})

export const QueueStatus = builder.simpleObject('QueueStatus', {
  fields: (t) => ({
    isRunning: t.boolean({ nullable: false }),
    pendingTasks: t.int({ nullable: false }),
  }),
})
```

**Type References:** Use constants, not strings:

```typescript
// ✅ CORRECT
const MyType = builder.simpleObject('MyType', { ... })
builder.mutationField('doSomething', (t) => t.field({ type: MyType }))

// ❌ WRONG
builder.mutationField('doSomething', (t) => t.field({ type: 'MyType' }))  // TypeScript error!
```

---

### Prisma Object Definitions

`index.ts` should only contain:

1. Imports (at top)
2. Console log for module setup
3. `builder.prismaObject()` definitions

```typescript
// graphql/api-key/index.ts
import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: ApiKey')

builder.prismaObject('ApiKey', {
  name: 'ApiKey',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    library: t.relation('library', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
  }),
})
```

---

## Full-Stack Patterns

### Form Validation Pattern

Consistent validation using Zod for type safety, i18n, and client+server validation.

**Core Principles:**

1. **Shared Schema:** One Zod schema for client + server
2. **Internationalized:** All messages use translation system
3. **FormData Handling:** Use `validateForm` and `validateFormData` utilities
4. **Client Validation:** Immediate feedback
5. **Server Validation:** Security (always validate)

**Step 1: Define Shared Schema**

```typescript
import { z } from 'zod'

import { Language, translate } from '../../i18n'

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
    // Multiple checkboxes (comma-separated)
    context: z
      .string()
      .optional()
      .transform((csv) => csv && csv.split(','))
      .pipe(z.array(z.string()).optional()),
    // Checkbox to boolean
    useVectorStore: z
      .string()
      .optional()
      .transform((val) => val === 'on'),
  })
```

**Step 2: Server Function with Validation**

```typescript
import { createServerFn } from '@tanstack/react-start'
import { validateFormData } from '@george-ai/web-utils'
import { getLanguage } from '../../i18n'
import { getListFieldFormSchema } from './field-modal'

export const addListField = createServerFn({ method: 'POST' })
  .inputValidator(async (formData: FormData) => {
    const language = await getLanguage()
    const schema = getListFieldFormSchema('create', language)
    const { data, errors } = validateFormData(formData, schema)

    if (errors) throw new Error(errors.join(', '))
    return data
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(/* GraphQL mutation */, data)
  })
```

**Step 3: Client-Side Form Handling**

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

    const { formData, errors } = validateForm(e.currentTarget, schema)

    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }

    // Submit to server
    if (isEditMode) {
      updateFieldMutation.mutate(formData)
    } else {
      addFieldMutation.mutate(formData)
    }
  }
}
```

**Key Benefits:**

- Single source of truth (one schema)
- Full TypeScript type safety
- Internationalized error messages
- Client validation for UX
- Server validation for security
- Handles multiple checkboxes automatically

**Important Notes:**

- Always use `validateForm` (client) or `validateFormData` (server)
- Add validation messages to both `en.ts` and `de.ts`
- Show all errors at once for better UX

---

## Additional Resources

- [Developer Setup](./developer-setup.md) - Development environment
- [Architecture](./architecture.md) - System design and workflows
- [Self-Hosting Guide](./self-hosting.md) - Production deployment
