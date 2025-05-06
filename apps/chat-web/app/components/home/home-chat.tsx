import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { FormEvent } from 'react'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { User } from '../../gql/graphql'
import { getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'
import { toastError, toastSuccess, toastWarning } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'

const getFormSchema = (language: 'en' | 'de') =>
  z.object({
    name: z.string().min(1, translate('contactForm.nameRequired', language)),
    message: z.string().min(1, translate('contactForm.messageRequired', language)),
    emailOrPhone: z.string().min(2, translate('contactForm.emailOrPhoneRequired', language)),
  })

const sendContactRequest = createServerFn({
  method: 'POST',
})
  .validator(async (data: unknown) => {
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
  user: Pick<User, 'email' | 'id' | 'name'> | null
}
export const HomeChat = ({ user }: HomeChatProps) => {
  const { t, language } = useTranslation()
  const formSchema = getFormSchema(language)
  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => sendContactRequest({ data }),
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
    const formData = new FormData(event.currentTarget)
    const { errors, parsedObject } = validateForm({ formSchema, formData })
    if (!parsedObject) {
      toastWarning(<ul>{errors?.map((error) => <li key={error}>{error.split(':').pop()}</li>)}</ul>)
      return
    }
    mutate(parsedObject)
  }

  return (
    <div className="rounded-box bg-base-100 w-full max-w-md overflow-hidden shadow-2xl" data-theme="light">
      <div className="bg-base-200 p-5">
        <div className="mb-4 flex items-center">
          <div className="bg-primary text-primary-content size-10 rounded-full" />
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">George-AI</h3>
            <p className="text-sm text-gray-600">{t('hero.chatStatus')}</p>
          </div>
        </div>
        <div className="chat chat-start">
          <div className="chat-bubble space-y-2">
            <p>{t('hero.chatGreeting')}</p>
            <p>{t('hero.chatMessage')}</p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
          <LoadingSpinner isLoading={isPending} />
          <Input
            placeholder={t('contactForm.namePlaceholder')}
            name={'name'}
            schema={formSchema}
            value={user?.name || ''}
          />
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
            value={user?.email || ''}
            schema={formSchema}
          />
          <button type="submit" className="btn btn-sm absolute bottom-2 right-1 z-50">
            {' '}
            {t('actions.sendMessage')}
          </button>
        </form>
      </div>
    </div>
  )
}
