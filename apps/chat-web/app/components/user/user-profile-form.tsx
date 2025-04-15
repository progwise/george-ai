import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { z } from 'zod'

import { dateTimeString, validateForm } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { getLanguage, translate } from '../../i18n/get-language'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
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
    expiresAt
    business
    position
  }
`)

const getFormSchema = (language: 'en' | 'de') =>
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
  })

const updateProfile = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }

    const o = Object.fromEntries(data)
    const language = await getLanguage()
    const schema = getFormSchema(language)
    return schema.parse(o)
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
        },
      },
    )
  })

interface UserProfileFormProps {
  userProfile: FragmentType<typeof UserProfileForm_UserProfileFragment>
  handleSendConfirmationMail: () => void
  onSubmit?: (data: FormData) => void
  isEditable?: boolean
}

export const UserProfileForm = (props: UserProfileFormProps) => {
  const { t, language } = useTranslation()
  const userProfile = useFragment(UserProfileForm_UserProfileFragment, props.userProfile)
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => updateProfile({ data }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.CurrentUserProfile, userProfile.userId],
      })
    },
  })

  const handleSendConfirmationMail = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    props.handleSendConfirmationMail()
  }

  if (!language) {
    return <LoadingSpinner isLoading={true} message={t('actions.loading')} />
  }
  const formSchema = getFormSchema(language)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const formValidation = validateForm({ formData, formSchema })
        if (formValidation.errors.length < 1) {
          const allowedFields = [
            'userId',
            'email',
            'firstName',
            'lastName',
            'business',
            'position',
            'freeMessages',
            'freeStorage',
          ]
          const newFormData = new FormData()

          Array.from(formData.entries())
            .filter(([key]) => allowedFields.includes(key))
            .forEach(([key, value]) =>
              newFormData.append(key, key.match(/free/) ? String(parseInt(value as string, 10) || 0) : String(value)),
            )

          if (props.onSubmit) {
            props.onSubmit(newFormData)
          } else {
            mutate(newFormData)
          }
        } else {
          console.error('Form validation errors:', formValidation.errors)
          alert(formValidation.errors.join('\n'))
        }
      }}
      className="flex w-full flex-col items-center gap-2 sm:grid sm:w-auto sm:grid-cols-2"
    >
      <LoadingSpinner isLoading={isPending} message={t('actions.saving')} />
      <input type="hidden" name="id" value={userProfile.id} />
      <input type="hidden" name="userId" value={userProfile.userId} />

      <Input
        name="createdAt"
        type="date"
        label={t('labels.createdAt')}
        value={dateTimeString(userProfile.createdAt, language)}
        className="col-span-1"
        readOnly
      />
      <Input
        name="updatedAt"
        type="date"
        label={t('labels.updatedAt')}
        value={dateTimeString(userProfile.updatedAt, language)}
        className="col-span-1"
        readOnly
      />
      {userProfile.confirmationDate ? (
        <Input
          name="confirmationDate"
          type="date"
          label={t('labels.confirmedAt')}
          value={dateTimeString(userProfile.confirmationDate, language)}
          className="col-span-1"
          readOnly
        />
      ) : (
        <label className="col-span-1 flex w-full flex-col">
          <span className="text-sm text-slate-400">{t('labels.notConfirmed')}</span>
          <button type="button" className="btn btn-sm col-span-1" onClick={handleSendConfirmationMail}>
            {t('actions.sendConfirmationMail')}
          </button>
        </label>
      )}

      <Input
        name="expiresAt"
        type="date"
        label={t('labels.expiresAt')}
        value={dateTimeString(userProfile.expiresAt, language)}
        valueNotSet={t('labels.never')}
        className="col-span-1"
        readOnly
      />
      <hr className="col-span-2 my-2" />
      <Input schema={formSchema} name={'email'} label="Email*" value={userProfile.email} className="col-span-2" />
      <Input
        schema={formSchema}
        name="firstName"
        label={t('labels.firstName')}
        value={userProfile.firstName}
        className="col-span-1"
      />
      <Input
        schema={formSchema}
        name="lastName"
        label={t('labels.lastName')}
        value={userProfile.lastName}
        className="col-span-1"
      />
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
        className="col-span-1"
        type="number"
        readOnly={!props.isEditable}
      />

      <Input
        name="freeMessages"
        label={t('labels.freeMessages')}
        value={userProfile.freeMessages}
        className="col-span-1"
        type="number"
        readOnly={!props.isEditable}
      />
      <Input
        name="usedStorage"
        label={t('labels.usedStorage')}
        value={userProfile.usedStorage}
        className="col-span-1"
        type="number"
        readOnly={!props.isEditable}
      />

      <Input
        name="usedMessages"
        label={t('labels.usedMessages')}
        value={userProfile.usedMessages}
        className="col-span-1"
        type="number"
        readOnly={!props.isEditable}
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
      <div className="col-span-2 flex justify-end">
        <input type="submit" value={t('actions.save')} className="btn btn-primary btn-sm" />
      </div>
    </form>
  )
}
