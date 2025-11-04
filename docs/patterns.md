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

**Pattern 3: DialogForm with Async Operations** (mutations, API calls)

**CRITICAL:** When using `DialogForm` with async operations, the dialog MUST NOT be closable during the operation to prevent crashes and data inconsistency.

**Problem:** By default, users can close DialogForm via:

- Clicking backdrop (outside modal)
- Clicking "Cancel" button
- Pressing ESC key

This causes issues when async operations are in progress (deletions, updates, etc.).

**Solution:** The `DialogForm` component automatically prevents closure when `disabledSubmit={true}`:

```typescript
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { DialogForm } from '../../components/dialog-form'

export const MyComponent = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const deleteMutation = useMutation({
    mutationFn: () => deleteLibraryFn({ data: libraryId }),
    onSuccess: () => {
      toastSuccess('Deleted successfully')
      dialogRef.current?.close() // Close after success
    },
    onError: (error) => {
      toastError(error.message)
      // Dialog stays open so user sees error
    },
  })

  return (
    <>
      <button onClick={() => dialogRef.current?.showModal()}>Delete</button>

      <DialogForm
        ref={dialogRef}
        title="Delete Library?"
        description="This action cannot be undone."
        onSubmit={() => deleteMutation.mutate()}
        submitButtonText="Delete"
        disabledSubmit={deleteMutation.isPending} // ✅ Prevents ALL closure methods
      />
    </>
  )
}
```

**Key Points:**

- ✅ **Set `disabledSubmit={isPending}`** - This disables submit button AND prevents backdrop/cancel/ESC closure
- ✅ **Close dialog in `onSuccess`** - Only close after operation completes successfully
- ✅ **Keep dialog open on error** - User can see error and retry or cancel
- ❌ **NEVER close dialog before async operation completes** - Causes crashes and data inconsistency

**Why This Matters:**

Without proper async handling, users can:

- Navigate away during deletions → app crashes
- Close dialog during mutations → incomplete operations
- Miss error messages → confusion about operation status

See issue #652 for real-world example of this bug.

---

### Toast Notifications

Use the George toast system (`apps/georgeai-webapp/app/components/georgeToaster.tsx`):

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

Use icon components from `apps/georgeai-webapp/app/icons/` instead of inline SVG:

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

Consistent validation using **TypeScript types + Zod schemas** for type safety, i18n, and client+server validation.

**Core Principles:**

1. **Shared Schema:** One Zod schema for client + server
2. **Inferred Types:** TypeScript types derived from Zod schemas (single source of truth)
3. **Internationalized:** All messages use translation system
4. **Client Validation:** Immediate feedback
5. **Server Validation:** Security (always validate)

> **Note**: This pattern represents the target state for all form validation in the codebase. Some existing components still use the legacy FormData pattern - these are being migrated (see issue #815). **All new code should follow this typed object pattern.**

**Step 1: Define Shared Schema with Inferred Type**

```typescript
import { z } from 'zod'

import { Language, translate } from '../../i18n'

// Define Zod schema
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
    // Multiple checkboxes (comma-separated) - transformed to string[]
    context: z
      .string()
      .optional()
      .transform((csv) => csv && csv.split(','))
      .pipe(z.array(z.string()).optional()),
    // Checkbox to boolean - transformed from 'on' | undefined
    useVectorStore: z
      .string()
      .optional()
      .transform((val) => val === 'on'),
  })

// Infer TypeScript type from schema
export type ListFieldFormInput = z.infer<ReturnType<typeof getListFieldFormSchema>>
```

**Step 2: Server Function with TypeScript + Zod Validation**

```typescript
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'
import { getLanguage } from '../../i18n'
import { ListFieldFormInput, getListFieldFormSchema } from './field-modal'

export const addListFieldFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: ListFieldFormInput) => {
    // ✅ Typed input - client already validated, server re-validates for security
    const language = await getLanguage()
    const schema = getListFieldFormSchema('create', language)

    // Zod validates AND transforms the data
    return schema.parse(data)
  })
  .handler(async (ctx) => {
    const data = await ctx.data // ✅ Fully typed with transforms applied!

    return await backendRequest(
      graphql(`
        mutation addListField($listId: String!, $data: AiListFieldInput!) {
          addListField(listId: $listId, data: $data) {
            id
            name
          }
        }
      `),
      {
        listId: data.listId,
        data: {
          name: data.name,
          prompt: data.prompt,
          useVectorStore: data.useVectorStore, // Already boolean (transformed)
          context: data.context, // Already string[] (transformed)
        },
      },
    )
  })
```

**Step 3: Client-Side Form Handling**

```typescript
import { useMutation } from '@tanstack/react-query'
import { validateForm } from '@george-ai/web-utils'
import { toastError, toastSuccess } from '../georgeToaster'
import { ListFieldFormInput, getListFieldFormSchema } from './field-modal'
import { addListFieldFn } from './server-functions'

const FieldModal = () => {
  const { t, language } = useTranslation()
  const schema = useMemo(
    () => getListFieldFormSchema(isEditMode ? 'update' : 'create', language),
    [isEditMode, language],
  )

  const addFieldMutation = useMutation({
    mutationFn: async (data: ListFieldFormInput) => { // ✅ Typed parameter
      return await addListFieldFn({ data })
    },
    onSuccess: () => {
      toastSuccess(t('lists.fields.addSuccess'))
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // validateForm returns typed data (inferred from schema)
    const { data, errors } = validateForm(e.currentTarget, schema)

    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }

    // data is already typed as ListFieldFormInput - no 'as' needed!
    if (isEditMode) {
      updateFieldMutation.mutate(data)
    } else {
      addFieldMutation.mutate(data)  // ✅ Type-safe all the way
    }
  }
}
```

**Key Benefits:**

- **Single source of truth**: Schema defines both types and validation
- **TypeScript + Zod**: Compile-time safety + runtime validation
- **Fully typed**: No `FormData` or `as` type assertions needed
- **Transformations**: Zod handles conversions (checkboxes → boolean, CSV → array)
- **Internationalized error messages**: All validation messages translated
- **Client validation**: Immediate feedback before submission
- **Server validation**: Security (always validate on server)
- **Full autocomplete**: IntelliSense works everywhere

**Important Notes:**

- Always export both the schema function AND the inferred type
- Use `z.infer<ReturnType<typeof getSchemaFunction>>` for function-based schemas
- `validateForm` returns typed data automatically - no manual conversion needed
- Both client and server use typed objects, not FormData
- Add validation messages to both `en.ts` and `de.ts`
- Show all errors at once for better UX
- Zod transformations happen after validation passes

---

## Additional Resources

- [Developer Setup](./developer-setup.md) - Development environment
- [Architecture](./architecture.md) - System design and workflows
- [Self-Hosting Guide](./self-hosting.md) - Production deployment
