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
}

export const UserProfileForm = (props: UserProfileFormProps) => {
  const userProfile = useFragment(UserProfileForm_UserProfileFragment, props.userProfile)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    props.handleSubmit(event)
  }
  return (
    <form onSubmit={handleSubmit} className="grid w-auto grid-cols-2 gap-2">
      <input type="hidden" name="id" value={userProfile.id} />
      <input type="hidden" name="userId" value={userProfile.userId} />

      <Input
        name="createdAt"
        label="Created"
        value={dateTimeString(userProfile.createdAt)}
        className="col-span-1"
        readOnly
      />
      <Input
        name="updatedAt"
        label="Last update"
        value={dateTimeString(userProfile.updatedAt)}
        className="col-span-1"
        readOnly
      />
      <Input
        name="confirmationDate"
        label="Confirmed since"
        value={dateTimeString(userProfile.confirmationDate)}
        className="col-span-1"
        readOnly
      />
      <Input name="expiresAt" label="Expires" value={dateTimeString(userProfile.expiresAt)} className="col-span-1" />
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
      <div className="col-span-2 flex justify-end">
        <input type="submit" value="Save" className="btn btn-primary" />
      </div>
    </form>
  )
}
