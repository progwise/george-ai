import { ZodRawShape, z } from 'zod'

export interface validateFormParams<T extends ZodRawShape> {
  formData: FormData
  formSchema: z.ZodObject<T>
}
export const validateForm = <T extends ZodRawShape>({ formData, formSchema }: validateFormParams<T>) => {
  const entries = Object.fromEntries(formData)
  const parseResult = formSchema.safeParse(entries)
  if (!parseResult.success) {
    const errors = parseResult.error.errors.map((error) => {
      const path = error.path.join('.')
      return `${path}: ${error.message}`
    })
    return { parsedObject: parseResult.data, errors }
  }
  return { parsedObject: parseResult.data!, errors: [] }
}

export const getDataFromForm = (form: HTMLFormElement) => {
  const originalFormData = new FormData(form)
  const newFormData = new FormData()
  for (const [key, value] of originalFormData.entries()) {
    if (originalFormData.getAll(key).length > 1) {
      newFormData.append(key, originalFormData.getAll(key).join(','))
    } else {
      newFormData.append(key, value)
    }
  }
  return newFormData
}
