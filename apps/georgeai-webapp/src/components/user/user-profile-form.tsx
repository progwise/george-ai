import { createServerFn } from '@tanstack/react-start'
import { ReactElement, RefObject } from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth'
import { graphql } from '../../gql'
import { UserProfileForm_UserProfileFragment } from '../../gql/graphql'
import { Language, getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { AvatarUpload } from '../avatar-upload'
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
  user?: { id: string; name?: string | null; avatarUrl?: string | null } | null
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  isAdmin?: boolean
  saveButton?: ReactElement | null
  formRef?: RefObject<HTMLFormElement | null>
}

export const UserProfileForm = ({
  isAdmin,
  userProfile,
  user,
  onSubmit,
  formRef,
  saveButton,
}: UserProfileFormProps) => {
  const { t, language } = useTranslation()
  const { logout } = useAuth()

  if (!language) {
    return <LoadingSpinner isLoading={true} message={t('actions.loading')} />
  }

  const formSchema = getFormSchema(language)

  const isConfirmed = !!userProfile.confirmationDate
  const isActivated = !!userProfile.activationDate

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mx-auto w-full max-w-4xl space-y-6">
      <input type="hidden" name="profileId" value={userProfile.id} />

      {/* Profile Header with Avatar */}
      <div className="relative overflow-hidden rounded-lg border border-base-300 bg-linear-to-br from-primary/5 to-secondary/5 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="shrink-0">{user && <AvatarUpload user={user} className="size-24" />}</div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            <p className="mt-1 text-sm text-base-content/70">{userProfile.email}</p>
            {userProfile.position && userProfile.business && (
              <p className="mt-2 text-sm">
                {userProfile.position} at {userProfile.business}
              </p>
            )}

            {/* Status Badges */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {isConfirmed ? (
                <span className="badge badge-sm badge-success">Email Confirmed</span>
              ) : (
                <span className="badge badge-sm badge-warning">{t('labels.awaitingConfirmation')}</span>
              )}
              {isActivated ? (
                <span className="badge badge-sm badge-success">Account Active</span>
              ) : (
                <span className="badge badge-sm badge-warning">{t('labels.awaitingActivation')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Status Section */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Account Status</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-medium tracking-wide text-base-content/60 uppercase">
              {t('labels.createdAt')}
            </div>
            <ClientDate date={userProfile.createdAt} format="dateTime" className="text-sm" />
          </div>

          <div>
            <div className="mb-1 text-xs font-medium tracking-wide text-base-content/60 uppercase">
              {t('labels.updatedAt')}
            </div>
            <ClientDate date={userProfile.updatedAt} format="dateTime" className="text-sm" />
          </div>

          <div>
            <div className="mb-1 text-xs font-medium tracking-wide text-base-content/60 uppercase">
              {t('labels.confirmedAt')}
            </div>
            {isConfirmed ? (
              <ClientDate date={userProfile.confirmationDate} format="dateTime" className="text-sm" />
            ) : (
              <span className="badge badge-sm badge-warning">{t('labels.awaitingConfirmation')}</span>
            )}
          </div>

          <div>
            <div className="mb-1 text-xs font-medium tracking-wide text-base-content/60 uppercase">
              {t('labels.activatedAt')}
            </div>
            {isActivated ? (
              <ClientDate date={userProfile.activationDate} format="dateTime" className="text-sm" />
            ) : (
              <span className="badge badge-sm badge-warning">{t('labels.awaitingActivation')}</span>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="mb-1 text-xs font-medium tracking-wide text-base-content/60 uppercase">
              {t('labels.expiresAt')}
            </div>
            <ClientDate
              date={userProfile.expiresAt}
              format="dateTime"
              fallback={t('labels.never')}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input schema={formSchema} name="email" label="Email*" value={userProfile.email} />
          </div>
          <Input schema={formSchema} name="firstName" label={t('labels.firstName')} value={userProfile.firstName} />
          <Input schema={formSchema} name="lastName" label={t('labels.lastName')} value={userProfile.lastName} />
        </div>
      </div>

      {/* Company Information Section */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Company Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input schema={formSchema} name="business" label={t('labels.business')} value={userProfile.business} />
          <Input schema={formSchema} name="position" label={t('labels.position')} value={userProfile.position} />
        </div>
      </div>

      {/* Usage & Limits Section */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Usage & Limits</h2>
          <a
            className="btn btn-sm btn-primary"
            href={`mailto:info@george-ai.net?subject=Request higher limits for ${userProfile.email}`}
          >
            {t('actions.increaseLimits')}
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Storage */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-base-content/80">Storage</h3>
            <div className="space-y-3">
              <Input
                name="freeStorage"
                label={t('labels.freeStorage')}
                value={userProfile.freeStorage}
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
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-base-content/80">Messages</h3>
            <div className="space-y-3">
              <Input
                name="freeMessages"
                label={t('labels.freeMessages')}
                value={userProfile.freeMessages}
                type="number"
                disabled={!isAdmin}
              />
              <Input
                name="usedMessages"
                label={t('labels.usedMessages')}
                value={userProfile.usedMessages}
                type="number"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            logout()
          }}
          className="btn btn-outline btn-secondary"
        >
          {t('actions.signOut')}
        </button>
        {saveButton && <div>{saveButton}</div>}
      </div>
    </form>
  )
}
