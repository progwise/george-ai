import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { t } from 'i18next'
import React from 'react'
import { z } from 'zod'

import { dateTimeString, validateForm } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'
import { LoadingSpinner } from '../loading-spinner'

const UserProfileForm_UserProfileFragment = graphql(`
  fragment UserProfileForm_userProfile on UserProfile {
    id
    userId
    email
    firstName
    lastName
    freeConversations
    freeMessages
    freeStorage
    createdAt
    updatedAt
    confirmationDate
    expiresAt
    business
    position
  }
`)

const formSchema = z.object({
  userId: z.string().min(1, t('errors.requiredField')),
  email: z
    .string()
    .email({ message: t('errors.invalidEmail') })
    .min(1, t('errors.requiredField')),
  firstName: z.string().min(1, t('errors.requiredField')),
  lastName: z.string().min(1, t('errors.requiredField')),
  business: z.string().min(1, t('errors.requiredField')),
  position: z.string().min(1, t('errors.requiredField')),
})

const updateProfile = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }

    const o = Object.fromEntries(data)
    return formSchema.parse(o)
  })
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {
          updateUserProfile(userId: $userId, input: $userProfileInput) {
            id
          }
        }
      `),
      {
        userId: ctx.data.userId,
        userProfileInput: ctx.data,
      },
    )
  })

interface UserProfileFormProps {
  userProfile: FragmentType<typeof UserProfileForm_UserProfileFragment>
  handleSendConfirmationMail: () => void
}

export const UserProfileForm = (props: UserProfileFormProps) => {
  const userProfile = useFragment(UserProfileForm_UserProfileFragment, props.userProfile)
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => updateProfile({ data }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.UserProfile, userProfile.id] })
    },
  })

  const handleSendConfirmationMail = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    props.handleSendConfirmationMail()
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const formValidation = validateForm({ formData, formSchema })
        if (formValidation.errors.length < 0) {
          mutate(formData)
        } else {
          alert(formValidation.errors.join('\n'))
        }
      }}
      className="flex w-full flex-col items-center gap-2 sm:grid sm:w-auto sm:grid-cols-2"
    >
      <LoadingSpinner isLoading={isPending} message="Saving profile" />
      <input type="hidden" name="id" value={userProfile.id} />
      <input type="hidden" name="userId" value={userProfile.userId} />

      <Input
        name="createdAt"
        type="date"
        label="Created"
        value={dateTimeString(userProfile.createdAt)}
        className="col-span-1"
        readOnly
      />
      <Input
        name="updatedAt"
        type="date"
        label="Last update"
        value={dateTimeString(userProfile.updatedAt)}
        className="col-span-1"
        readOnly
      />
      {userProfile.confirmationDate ? (
        <Input
          name="confirmationDate"
          type="date"
          label="Confirmed since"
          value={dateTimeString(userProfile.confirmationDate)}
          className="col-span-1"
          readOnly
        />
      ) : (
        <label className="col-span-1 flex w-full flex-col">
          <span className="text-sm text-slate-400">Not confirmed</span>
          <button type="button" className="btn col-span-1 self-baseline" onClick={handleSendConfirmationMail}>
            Re-send confirmation mail
          </button>
        </label>
      )}

      <Input
        name="expiresAt"
        type="date"
        label="Expires"
        value={dateTimeString(userProfile.expiresAt)}
        valueNotSet="Never"
        className="col-span-1"
        readOnly
      />
      <hr className="col-span-2 my-2" />
      <Input schema={formSchema} name={'email'} label="Email" value={userProfile.email} className="col-span-2" />
      <Input name="firstName" label="First Name" value={userProfile.firstName} className="col-span-1" />
      <Input name="lastName" label="Family Name" value={userProfile.lastName} className="col-span-1" />
      <hr className="col-span-2 my-2" />
      <Input name="business" label="Business" value={userProfile.business} className="col-span-2" />
      <Input name="position" label="Position" value={userProfile.position} className="col-span-2" />
      <hr className="col-span-2 my-2" />
      <Input
        name="freeConversations"
        label="Free Conversations"
        value={userProfile.freeConversations}
        className="col-span-1"
        type="number"
        readOnly
      />
      <Input
        name="freeStorage"
        label="Free Storage"
        value={userProfile.freeStorage}
        className="col-span-1"
        type="number"
        readOnly
      />

      <Input
        name="freeMessages"
        label="Free messages"
        value={userProfile.freeMessages}
        className="col-span-1"
        type="number"
        readOnly
      />
      <div className="col-span-1 flex justify-end">
        <a
          className="btn"
          href={`mailto:info@george-ai.net?subject=Request for more free messages for ${userProfile.email}`}
        >
          Request more...
        </a>
      </div>
      <hr className="col-span-2 my-2" />
      <div className="col-span-2 flex justify-end">
        <input type="submit" value="Save" className="btn btn-primary" />
      </div>
    </form>
  )
}
