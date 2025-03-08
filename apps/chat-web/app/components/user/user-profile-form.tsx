import React from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { Input } from '../form/input'

const UserProfileForm_UserProfileFragment = graphql(`
  fragment UserProfileForm_userProfile on UserProfile {
    id
    userId
    email
    given_name
    family_name
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
interface UserProfileFormProps {
  userProfile: FragmentType<typeof UserProfileForm_UserProfileFragment>
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  handleSendConfirmationMail: () => void
}

export const UserProfileForm = (props: UserProfileFormProps) => {
  const userProfile = useFragment(UserProfileForm_UserProfileFragment, props.userProfile)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    props.handleSubmit(event)
  }
  const handleSendConfirmationMail = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    props.handleSendConfirmationMail()
  }
  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-2 sm:grid sm:w-auto sm:grid-cols-2">
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
      <Input name="email" label="Email" value={userProfile.email} className="col-span-2" />
      <Input name="given_name" label="First Name" value={userProfile.given_name} className="col-span-1" />
      <Input name="family_name" label="Family Name" value={userProfile.family_name} className="col-span-1" />
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
