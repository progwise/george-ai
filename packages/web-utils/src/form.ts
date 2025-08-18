import { ZodRawShape, z } from 'zod'

// Helper function to format Zod validation errors
const formatZodErrors = (zodError: z.ZodError): string[] => {
  return zodError.errors.map((error) => {
    const path = error.path.join('.')
    return `${path}: ${error.message}`
  })
}

const getAllFormData = (originalFormData: FormData): FormData => {
  const newFormData = new FormData()

  for (const [key, value] of originalFormData.entries()) {
    const allValues = originalFormData.getAll(key)
    if (allValues.length > 1) {
      newFormData.append(key, allValues.join(','))
    } else {
      newFormData.append(key, value)
    }
  }

  return newFormData
}

const getDataFromForm = (form: HTMLFormElement): FormData => {
  const originalFormData = new FormData(form)
  return getAllFormData(originalFormData)
}

// Validates HTML form and returns processed FormData with errors
// Use this in client-side form handling
export const validateForm = <T extends ZodRawShape>(form: HTMLFormElement, schema: z.ZodObject<T>) => {
  const formData = getDataFromForm(form)
  const parseResult = schema.safeParse(Object.fromEntries(formData))

  if (!parseResult.success) {
    const errors = formatZodErrors(parseResult.error)
    return { formData, errors }
  }

  return { formData, errors: null }
}

// Validates FormData directly using a Zod schema
// Use this in server functions for validation
export const validateFormData = <T extends ZodRawShape>(formData: FormData, schema: z.ZodObject<T>) => {
  const allFormData = getAllFormData(formData)
  const parseResult = schema.safeParse(Object.fromEntries(allFormData))

  if (!parseResult.success) {
    const errors = formatZodErrors(parseResult.error)
    return { data: null, errors }
  }

  return { data: parseResult.data, errors: null }
}
