import { Assistant_EntityParticipantsDialogFragment, User_EntityParticipantsDialogFragment } from '../../gql/graphql'

export interface EntityParticipant {
  id: string
  user?: User_EntityParticipantsDialogFragment | null
  assistant?: Assistant_EntityParticipantsDialogFragment | null
  invitedEmail?: string | null
}
