import { ZodRawShape, z } from 'zod'

export const validateForm = <T extends ZodRawShape>(form: HTMLFormElement, schema: z.ZodObject<T>) => {
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
