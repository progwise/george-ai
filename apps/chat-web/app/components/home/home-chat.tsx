import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'
import { toastError, toastSuccess, toastWarning } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  message: z.string().min(1, 'Message is required'),
  emailOrPhone: z.string().min(2, 'Email or phone is required'),
})

const sendContactRequest = createServerFn({
  method: 'POST',
})
  .validator((data: FormData) => {
    const entries = Object.fromEntries(data)
    console.log('Form data:', entries)
    return formSchema.parse(entries)
  })
  .handler(
    ({ data }) =>
      backendRequest(
        graphql(`
          mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {
            createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)
          }
        `),
        {
          ...data,
        },
      ),
    // Simulate sending a contact request
  )

export const HomeChat = () => {
  const { t } = useTranslation()
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (formData: FormData) => sendContactRequest({ data: formData }),
    onSettled: (data, error) => {
      if (data) {
        toastSuccess('Vielen Dank für Ihre Nachricht! Wir werden uns in Kürze bei Ihnen melden.')
      }
      if (error) {
        toastError('Fehler beim Senden der Anfrage. Bitte versuchen Sie es später erneut.')
      }
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log('Form submitted')
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const { errors } = validateForm({ formData, formSchema })
    if (errors.length > 0) {
      toastWarning(
        <div className="flex flex-col">
          <span>Bitte füllen Sie alle erforderlichen Felder aus.</span>
          <ul>
            {errors.map((error) => (
              <li key={error} className="text-error">
                {error.split(':').pop()}
              </li>
            ))}
          </ul>
        </div>,
      )
    } else {
      mutate(formData)
    }
  }

  if (isPending) {
    return <LoadingSpinner />
  }
  return (
    <div className="">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="bg-blue-50 p-5">
          <div className="mb-4 flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <i data-feather="cpu" className="h-5 w-5"></i>
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800">George-AI</h3>
              <p className="text-sm text-gray-600">Online & bereit zu helfen</p>
            </div>
          </div>
          <div className="mb-4 rounded-lg bg-gray-100">
            <p className="p-1 text-gray-700">Hallo! Ich bin George, Ihre persönliche KI-Assistenz.</p>
            <p className="p-1 text-gray-700">
              Wenn Sie uns Ihre Email Adresse oder Telefonnummer hinterlassen melden wir uns bei Ihnen persönlich.
            </p>
          </div>
        </div>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="relative flex flex-col gap-2" method="DIALOG">
            <Input placeholder={t('contactForm.namePlaceholder')} name={'name'} schema={formSchema} />
            <Input
              placeholder={t('contactForm.messagePlaceholder')}
              name="message"
              type="textarea"
              className="min-h-14"
              schema={formSchema}
            />
            <Input
              placeholder={t('contactForm.emailOrPhonePlaceholder')}
              name="emailOrPhone"
              type="text"
              schema={formSchema}
            />
            <button type="submit" className="absolute bottom-1 right-3 z-50 text-sm text-primary">
              {t('actions.sendMessage')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
