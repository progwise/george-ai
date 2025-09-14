import { useCallback, useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import { Assistant_EntityParticipantsDialogFragment, User_EntityParticipantsDialogFragment } from '../../gql/graphql'
import EmailIcon from '../../icons/email-icon'
import { AssistantIcon } from '../assistant/assistant-icon'
import { UserAvatar } from '../user-avatar'
import { EntityParticipant } from './entity-participant.types'

graphql(`
  fragment User_EntityParticipantsDialog on User {
    id
    name
    username
    given_name
    family_name
    email
    avatarUrl
    profile {
      position
      business
    }
  }

  fragment Assistant_EntityParticipantsDialog on AiAssistant {
    id
    name
    description
    iconUrl
    ownerId
  }
`)

interface EntityParticipantsDialogProps {
  ref: React.RefObject<HTMLDialogElement | null>
  participants: EntityParticipant[]
  users?: User_EntityParticipantsDialogFragment[] | null
  assistants?: Assistant_EntityParticipantsDialogFragment[] | null
  invitedEmails?: string[] | null
  onUpdateParticipants: ({
    userIds,
    assistantIds,
    invitedEmails,
  }: {
    userIds?: string[]
    assistantIds?: string[]
    invitedEmails?: string[]
  }) => void
}

export const EntityParticipantsDialog = (props: EntityParticipantsDialogProps) => {
  const { ref, users, assistants, invitedEmails, onUpdateParticipants, participants } = props
  const [filterTerm, setFilterTerm] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([])
  const [selectedInvitedEmails, setSelectedInvitedEmails] = useState<string[]>([])

  const filteredCandidates = useMemo(() => {
    const filter = filterTerm.toLowerCase().trim()
    return {
      users: users?.filter(
        (user) =>
          user.name?.toLowerCase().includes(filter) ||
          user.username?.toLowerCase().includes(filter) ||
          user.email?.toLowerCase().includes(filter) ||
          user.profile?.position?.toLowerCase().includes(filter) ||
          user.profile?.business?.toLowerCase().includes(filter),
      ),
      assistants: assistants?.filter((assistant) => assistant.name.toLowerCase().includes(filter)),
      invitedEmails: invitedEmails?.filter((email) => email.toLowerCase().includes(filter)),
    }
  }, [users, assistants, invitedEmails, filterTerm])

  const participantsUnchanged = useMemo(() => {
    const currentUserIds = participants.filter((p) => p.user).map((p) => p.user!.id)
    const currentAssistantIds = participants.filter((p) => p.assistant).map((p) => p.assistant!.id)
    const currentInvitedEmails = participants.filter((p) => p.invitedEmail).map((p) => p.invitedEmail!)

    // Check if selected lists are the same as current lists
    const usersUnchanged =
      selectedUserIds.length === currentUserIds.length && selectedUserIds.every((id) => currentUserIds.includes(id))
    const assistantsUnchanged =
      selectedAssistantIds.length === currentAssistantIds.length &&
      selectedAssistantIds.every((id) => currentAssistantIds.includes(id))
    const emailsUnchanged =
      selectedInvitedEmails.length === currentInvitedEmails.length &&
      selectedInvitedEmails.every((email) => currentInvitedEmails.includes(email))

    return usersUnchanged && assistantsUnchanged && emailsUnchanged
  }, [participants, selectedUserIds, selectedAssistantIds, selectedInvitedEmails])

  const resetParticipants = useCallback(() => {
    setSelectedUserIds(participants.filter((p) => p.user).map((p) => p.user!.id))
    setSelectedAssistantIds(participants.filter((p) => p.assistant).map((p) => p.assistant!.id))
    setSelectedInvitedEmails(participants.filter((p) => p.invitedEmail).map((p) => p.invitedEmail!))
  }, [participants])

  useEffect(() => {
    const timeout = setTimeout(() => {
      resetParticipants()
    }, 100)
    return () => clearTimeout(timeout)
  }, [resetParticipants])

  const handleUpdateParticipantsClick = () => {
    onUpdateParticipants({
      userIds: selectedUserIds,
      assistantIds: selectedAssistantIds,
      invitedEmails: selectedInvitedEmails,
    })
    ref.current?.close()
  }

  const handleResetClick = () => {
    resetParticipants()
  }

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box m-0 flex h-[550px] w-11/12 max-w-3xl flex-col gap-2 p-2">
        <div className="modal-start">
          <ul className="menu menu-horizontal bg-base-300 m-0 flex w-full justify-between rounded-xl p-2">
            <li>
              <h3 className="font-semibold">Manage Participants</h3>
            </li>
            <li className="self-end">
              <label className="input input-sm">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
                <input type="search" required placeholder="Filter" onChange={(e) => setFilterTerm(e.target.value)} />
              </label>
            </li>
          </ul>
        </div>
        <div className="modal-middle grow-1">
          <div className="tabs tabs-lift w-full">
            {!!filteredCandidates.users && (
              <>
                <input type="radio" name="participant_type" className="tab" aria-label="Users" defaultChecked />
                <div className="tab-content bg-base-100 border-base-300 px-0 py-2">
                  <div className="h-[350px] w-full overflow-scroll px-4">
                    <ul className="list bg-base-100 rounded-box shadow-md">
                      {filteredCandidates.users.map((user) => (
                        <li
                          key={user.id}
                          className={twMerge('list-row', selectedUserIds.includes(user.id) ? 'bg-base-200' : '')}
                        >
                          <div>
                            <UserAvatar user={user} className="size-16" />
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            <div className="text-xs font-semibold uppercase opacity-90">{user.username}</div>
                            <div className="flex w-full items-center gap-6 text-xs">
                              <div>
                                <span className="text-base-content/60">Name:</span>
                                {user.given_name} {user.family_name}
                              </div>
                              <div>
                                <span className="text-base-content/60">Company:</span>
                                {user.profile?.position} {user.profile?.business}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label>
                              <input
                                type="checkbox"
                                className="checkbox"
                                name="userIds"
                                checked={selectedUserIds.includes(user.id)}
                                onChange={() => {
                                  setSelectedUserIds((prev) =>
                                    prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id],
                                  )
                                }}
                              />
                            </label>
                          </div>
                          <div className="text-base-content/40 grow-1 absolute bottom-4 right-2 text-xs">
                            ID: {user.id}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
            {!!filteredCandidates.assistants && (
              <>
                <input type="radio" name="participant_type" className="tab" aria-label="Assistants" />
                <div className="tab-content bg-base-100 border-base-300 p-6">
                  <div className="w-full px-4">
                    <ul className="list bg-base-100 rounded-box shadow-md">
                      {filteredCandidates.assistants.map((assistant) => (
                        <li
                          key={assistant.id}
                          className={twMerge(
                            'list-row',
                            selectedAssistantIds.includes(assistant.id) ? 'bg-base-200' : '',
                          )}
                        >
                          <div>
                            <AssistantIcon assistant={assistant} className="size-16" />
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            <div className="text-xs font-semibold uppercase opacity-90">{assistant.name}</div>
                            <div className="text-xs font-semibold opacity-60">
                              <span>{assistant.description}</span>
                              <span>{assistant.id}</span>
                            </div>
                          </div>
                          <div>
                            <label>
                              <input
                                type="checkbox"
                                defaultChecked
                                className="checkbox"
                                name="userIds"
                                checked={selectedAssistantIds.includes(assistant.id)}
                                onChange={() => {
                                  setSelectedAssistantIds((prev) =>
                                    prev.includes(assistant.id)
                                      ? prev.filter((id) => id !== assistant.id)
                                      : [...prev, assistant.id],
                                  )
                                }}
                              />
                            </label>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
            {!!filteredCandidates.invitedEmails && (
              <>
                <input type="radio" name="participant_type" className="tab" aria-label="Invitations" />
                <div className="tab-content bg-base-100 border-base-300 p-6">
                  {' '}
                  <div className="w-full px-4">
                    <ul className="list bg-base-100 rounded-box shadow-md">
                      {filteredCandidates.invitedEmails.map((email) => (
                        <li
                          key={email}
                          className={twMerge('list-row', selectedAssistantIds.includes(email) ? 'bg-base-200' : '')}
                        >
                          <div>
                            <EmailIcon className="size-16" />
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            <div className="text-xs font-semibold uppercase opacity-90">{email}</div>
                          </div>
                          <div>
                            <label>
                              <input
                                type="checkbox"
                                defaultChecked
                                className="checkbox"
                                name="userIds"
                                checked={selectedAssistantIds.includes(email)}
                                onChange={() => {
                                  setSelectedInvitedEmails((prev) =>
                                    prev.includes(email) ? prev.filter((id) => id !== email) : [...prev, email],
                                  )
                                }}
                              />
                            </label>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-action justify-between">
          <div className="flex items-center gap-2">
            {filteredCandidates.users && <div className="badge badge-info">{`${selectedUserIds.length}`} Users</div>}
            {filteredCandidates.assistants && (
              <div className="badge badge-info">{`${selectedAssistantIds.length}`} Assistants</div>
            )}
            {filteredCandidates.invitedEmails && (
              <div className="badge badge-info">{`${selectedInvitedEmails.length}`} Invitations</div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-neutral btn-sm" onClick={() => ref.current?.close()}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={participantsUnchanged}
              onClick={handleResetClick}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={participantsUnchanged}
              onClick={handleUpdateParticipantsClick}
            >
              Update
            </button>
          </div>
        </div>
      </div>
      {/* clicking outside the modal will close it */}
      <form method="dialog" className="modal-backdrop">
        {/* if there is a button in form, it will close the modal */}
        <button type="submit">Close</button>
      </form>
    </dialog>
  )
}
