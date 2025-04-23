import { createServerFn } from '@tanstack/react-start'
import { ReactElement, RefObject } from 'react'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { useAuth } from '../../auth/auth'
import { getProfileQueryOptions } from '../../auth/get-profile-query'
import { FragmentType, graphql, useFragment } from '../../gql'
import { getLanguage, translate } from '../../i18n/get-language'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'
import { LoadingSpinner } from '../loading-spinner'

export const UserProfileForm_UserProfileFragment = graphql(`
  fragment UserProfileForm_UserProfile on UserProfile {
    id
    userId
    email
    firstName
    lastName
    freeMessages
    usedMessages
    freeStorage
    usedStorage
    createdAt
    updatedAt
    confirmationDate
    activationDate
    expiresAt
    business
    position
  }
`)

export const getFormSchema = (language: 'en' | 'de') =>
  z.object({
    userId: z.string().min(1, translate('errors.requiredField', language)),
    email: z
      .string()
      .email({ message: translate('errors.invalidEmail', language) })
      .min(1, translate('errors.requiredField', language)),
    firstName: z.string().min(1, translate('errors.requiredField', language)),
    lastName: z.string().min(1, translate('errors.requiredField', language)),
    business: z.string().min(1, translate('errors.requiredField', language)),
    position: z.string().min(1, translate('errors.requiredField', language)),
    freeMessages: z.preprocess((value) => parseInt(String(value), 10), z.number().optional()),
    freeStorage: z.preprocess((value) => parseInt(String(value), 10), z.number().optional()),
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .validator(async (data: { formData: FormData; isAdmin: boolean }) => {
    if (!(data.formData instanceof FormData)) {
      throw new Error('Invalid form data')
    }

    const formDataObject = Object.fromEntries(data.formData)
    const language = await getLanguage()
    const schema = getFormSchema(language)

    return { ...schema.parse(formDataObject), isAdmin: data.isAdmin }
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {
          updateUserProfile(userId: $userId, input: $userProfileInput) {
            id
          }
        }
      `),
      {
        userId: data.userId,
        userProfileInput: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          business: data.business,
          position: data.position,
          ...(data.isAdmin && {
            freeMessages: data.freeMessages,
            freeStorage: data.freeStorage,
          }),
        },
      },
    )
  })

interface UserProfileFormProps {
  userProfile: FragmentType<typeof UserProfileForm_UserProfileFragment>
  handleSendConfirmationMail: (formData: FormData) => void
  onSubmit?: (data: FormData) => void
  isAdmin?: boolean
  saveButton?: ReactElement | null
  formRef?: RefObject<HTMLFormElement | null>
}

export const UserProfileForm = (props: UserProfileFormProps) => {
  const { t, language } = useTranslation()
  const userProfile = useFragment(UserProfileForm_UserProfileFragment, props.userProfile)
  const { logout } = useAuth()

  if (!language) {
    return <LoadingSpinner isLoading={true} message={t('actions.loading')} />
  }

  const formSchema = getFormSchema(language)

  return (
    <form
      ref={props.formRef}
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        props.onSubmit?.(formData)
      }}
      className="flex w-full flex-col items-center gap-2 sm:grid sm:w-auto sm:grid-cols-2"
    >
      <input type="hidden" name="id" value={userProfile.id} />
      <input type="hidden" name="userId" value={userProfile.userId} />

      <Input
        name="createdAt"
        type="text"
        label={t('labels.createdAt')}
        value={dateTimeString(userProfile.createdAt, language)}
        readOnly
      />
      <Input
        name="updatedAt"
        type="text"
        label={t('labels.updatedAt')}
        value={dateTimeString(userProfile.updatedAt, language)}
        readOnly
      />
      <Input
        name="confirmationDate"
        type="text"
        label={t('labels.confirmedAt')}
        value={
          userProfile.confirmationDate
            ? dateTimeString(userProfile.confirmationDate, language)
            : t('labels.awaitingConfirmation')
        }
        placeholder={!userProfile.confirmationDate ? t('labels.awaitingConfirmation') : undefined}
        readOnly
      />
      <Input
        name="expiresAt"
        type="text"
        label={t('labels.expiresAt')}
        value={dateTimeString(userProfile.expiresAt, language)}
        valueNotSet={t('labels.never')}
        readOnly
      />
      <Input
        name="activationDate"
        type="text"
        label={t('labels.activatedAt')}
        value={
          userProfile.activationDate
            ? dateTimeString(userProfile.activationDate, language)
            : t('labels.awaitingActivation')
        }
        placeholder={!userProfile.activationDate ? t('labels.awaitingActivation') : undefined}
        className="col-span-2"
        readOnly
      />
      <hr className="col-span-2 my-2" />
      <Input schema={formSchema} name={'email'} label="Email*" value={userProfile.email} className="col-span-2" />
      <Input schema={formSchema} name="firstName" label={t('labels.firstName')} value={userProfile.firstName} />
      <Input schema={formSchema} name="lastName" label={t('labels.lastName')} value={userProfile.lastName} />
      <hr className="col-span-2 my-2" />
      <Input
        schema={formSchema}
        name="business"
        label={t('labels.business')}
        value={userProfile.business}
        className="col-span-2"
      />
      <Input
        schema={formSchema}
        name="position"
        label={t('labels.position')}
        value={userProfile.position}
        className="col-span-2"
      />
      <hr className="col-span-2 my-2" />
      <Input
        name="freeStorage"
        label={t('labels.freeStorage')}
        value={userProfile.freeStorage}
        type="number"
        readOnly={!props.isAdmin}
      />

      <Input
        name="freeMessages"
        label={t('labels.freeMessages')}
        value={userProfile.freeMessages}
        type="number"
        readOnly={!props.isAdmin}
      />
      <Input
        name="usedStorage"
        label={t('labels.usedStorage')}
        value={userProfile.usedStorage}
        type="number"
        readOnly={!props.isAdmin}
      />

      <Input
        name="usedMessages"
        label={t('labels.usedMessages')}
        value={userProfile.usedMessages}
        type="number"
        readOnly={!props.isAdmin}
      />
      <div className="col-span-2 flex justify-end">
        <a
          className="btn btn-sm"
          href={`mailto:info@george-ai.net?subject=Request higher limits for ${userProfile.email}`}
        >
          {t('actions.increaseLimits')}
        </a>
      </div>
      <hr className="col-span-2 my-2" />
      <div className="col-span-2 flex justify-between">
        {props.saveButton && <div className="col-span-2 flex justify-end">{props.saveButton}</div>}

        <button
          type="button"
          onClick={() => {
            logout()
          }}
          className="btn btn-outline btn-neutral btn-sm"
        >
          {t('actions.signOut')}
        </button>
      </div>
    </form>
  )
}
