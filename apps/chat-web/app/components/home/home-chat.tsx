import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { FormEvent } from 'react'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { UserFragment } from '../../gql/graphql'
import { Language, getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'
import { toastError, toastSuccess, toastWarning } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'

const getFormSchema = (language: Language) =>
  z.object({
    name: z.string().min(1, translate('contactForm.nameRequired', language)),
    message: z.string().min(1, translate('contactForm.messageRequired', language)),
    emailOrPhone: z.string().min(2, translate('contactForm.emailOrPhoneRequired', language)),
  })

const sendContactRequest = createServerFn({
  method: 'POST',
})
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const formSchema = getFormSchema(language)
    return formSchema.parse(data)
  })
  .handler(({ data }) =>
    backendRequest(
      graphql(`
        mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {
          createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)
        }
      `),
      data,
    ),
  )

interface HomeChatProps {
  user?: UserFragment
}
export const HomeChat = ({ user }: HomeChatProps) => {
  const { t, language } = useTranslation()
  const formSchema = getFormSchema(language)
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => sendContactRequest({ data }),
    onError: (error) => {
      console.error('Error sending contact request:', error)
      toastError(t('contactForm.errorSendingMessage'))
    },
    onSuccess: () => {
      toastSuccess(t('contactForm.messageSent'))
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { errors, formData } = validateForm(event.currentTarget, formSchema)
    if (errors) {
      toastWarning(<ul>{errors?.map((error) => <li key={error}>{error.split(':').pop()}</li>)}</ul>)
      return
    }
    mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
      <LoadingSpinner isLoading={isPending} />
      <Input
        placeholder={t('contactForm.namePlaceholder')}
        name={'name'}
        schema={formSchema}
        value={user?.name || ''}
        label={t('contactForm.nameLabel')}
      />
      <Input
        placeholder={t('contactForm.messagePlaceholder')}
        name="message"
        label={t('contactForm.messageLabel')}
        type="textarea"
        className="min-h-14"
        schema={formSchema}
      />
      <Input
        placeholder={t('contactForm.emailOrPhonePlaceholder')}
        name="emailOrPhone"
        type="text"
        label={t('contactForm.emailOrPhoneLabel')}
        value={user?.email || ''}
        schema={formSchema}
      />
      <button type="submit" className="btn btn-sm absolute bottom-2 right-1 z-50">
        {t('actions.sendMessage')}
      </button>
    </form>
  )
}
