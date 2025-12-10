import { createServerFn } from '@tanstack/react-start'
import { ReactElement, RefObject } from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth'
import { graphql } from '../../gql'
import { UserProfileForm_UserProfileFragment } from '../../gql/graphql'
import { Language, getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { ClientDate } from '../client-date'
import { Input } from '../form/input'
import { LoadingSpinner } from '../loading-spinner'

graphql(`
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

export const getFormSchema = (language: Language) =>
  z.object({
    profileId: z.string().min(1, translate('errors.requiredField', language)),
    email: z
      .string()
      .email({ message: translate('errors.invalidEmail', language) })
      .min(1, translate('errors.requiredField', language)),
    firstName: z.string().min(1, translate('errors.requiredField', language)),
    lastName: z.string().min(1, translate('errors.requiredField', language)),
    business: z.string().min(1, translate('errors.requiredField', language)),
    position: z.string().min(1, translate('errors.requiredField', language)),
    freeMessages: z.coerce.number().optional(),
    freeStorage: z.coerce.number().optional(),
  })

// Infer TypeScript type from schema
export type UserProfileFormInput = z.infer<ReturnType<typeof getFormSchema>>

export const updateProfile = createServerFn({ method: 'POST' })
  .inputValidator(async (data: UserProfileFormInput) => {
    const language = await getLanguage()
    const schema = getFormSchema(language)
    return schema.parse(data)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation saveUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {
          updateUserProfile(profileId: $profileId, input: $userProfileInput) {
            id
          }
        }
      `),
      {
        profileId: data.profileId,
        userProfileInput: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          business: data.business,
          position: data.position,
          freeMessages: data.freeMessages,
          freeStorage: data.freeStorage,
        },
      },
    )
  })

interface UserProfileFormProps {
  userProfile: UserProfileForm_UserProfileFragment
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  isAdmin?: boolean
  saveButton?: ReactElement | null
  formRef?: RefObject<HTMLFormElement | null>
}

export const UserProfileForm = ({ isAdmin, userProfile, onSubmit, formRef, saveButton }: UserProfileFormProps) => {
  const { t, language } = useTranslation()
  const { logout } = useAuth()

  if (!language) {
    return <LoadingSpinner isLoading={true} message={t('actions.loading')} />
  }

  const formSchema = getFormSchema(language)

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex w-full flex-col items-center gap-x-2 sm:grid sm:w-auto sm:grid-cols-2"
    >
      <input type="hidden" name="profileId" value={userProfile.id} />

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t('labels.createdAt')}</span>
        </label>
        <ClientDate
          date={userProfile.createdAt}
          format="dateTime"
          className="input input-bordered input-disabled w-full"
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t('labels.updatedAt')}</span>
        </label>
        <ClientDate
          date={userProfile.updatedAt}
          format="dateTime"
          className="input input-bordered input-disabled w-full"
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t('labels.confirmedAt')}</span>
        </label>
        {userProfile.confirmationDate ? (
          <ClientDate
            date={userProfile.confirmationDate}
            format="dateTime"
            className="input input-bordered input-disabled w-full"
          />
        ) : (
          <span className="input input-bordered input-disabled w-full">{t('labels.awaitingConfirmation')}</span>
        )}
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">{t('labels.expiresAt')}</span>
        </label>
        <ClientDate
          date={userProfile.expiresAt}
          format="dateTime"
          fallback={t('labels.never')}
          className="input input-bordered input-disabled w-full"
        />
      </div>
      <div className="form-control col-span-2 w-full">
        <label className="label">
          <span className="label-text">{t('labels.activatedAt')}</span>
        </label>
        {userProfile.activationDate ? (
          <ClientDate
            date={userProfile.activationDate}
            format="dateTime"
            className="input input-bordered input-disabled w-full"
          />
        ) : (
          <span className="input input-bordered input-disabled w-full">{t('labels.awaitingActivation')}</span>
        )}
      </div>
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
        disabled={!isAdmin}
      />

      <Input
        name="freeMessages"
        label={t('labels.freeMessages')}
        value={userProfile.freeMessages}
        type="number"
        disabled={!isAdmin}
      />
      <Input
        name="usedStorage"
        label={t('labels.usedStorage')}
        value={userProfile.usedStorage}
        type="number"
        disabled
      />

      <Input
        name="usedMessages"
        label={t('labels.usedMessages')}
        value={userProfile.usedMessages}
        type="number"
        disabled
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
      <div className="col-span-2 flex justify-between gap-2">
        {saveButton && <div className="col-span-2 flex justify-end">{saveButton}</div>}

        <button
          type="button"
          onClick={() => {
            logout()
          }}
          className="btn btn-outline btn-secondary btn-sm"
        >
          {t('actions.signOut')}
        </button>
      </div>
    </form>
  )
}
