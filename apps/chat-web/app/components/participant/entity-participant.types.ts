export interface EntityParticipant {
  id: string
  user?: CandidateParticipantUser
  assistant?: CandidateParticipantAssistant
  invitedEmail?: string
}

export interface CandidateParticipantUser {
  id: string
  name?: string | null
  username: string
  avatarUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  business?: string | null
  position?: string | null
}

export interface CandidateParticipantAssistant {
  id: string
  name: string
  ownerId: string
  description?: string | null
  avatarUrl?: string
}
