import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { LibraryMenu_AiLibrariesFragment, LibraryMenu_AiLibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ListPlusIcon } from '../../icons/list-plus-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { UserPlusIcon } from '../../icons/user-plus-icon'
import { getUsersQueryOptions } from '../../server-functions/users'
import { DialogForm } from '../dialog-form'
import { EntityParticipants } from '../participant/entity-participants'
import { EntityParticipantsDialog } from '../participant/entity-participants-dialog'
import { NewLibraryDialog } from './new-library-dialog'
import { useLibraryActions } from './use-library-actions'

graphql(`
  fragment LibraryMenu_AiLibrary on AiLibrary {
    id
    name
    ownerId
    owner {
      ...User_EntityParticipantsDialog
    }
    participants {
      id
      user {
        ...User_EntityParticipantsDialog
      }
    }
  }
`)

graphql(`
  fragment LibraryMenu_AiLibraries on AiLibrary {
    id
    name
  }
`)

interface LibraryMenuProps {
  library: LibraryMenu_AiLibraryFragment
  selectableLibraries: LibraryMenu_AiLibrariesFragment[]
}

export const LibraryMenu = ({ library, selectableLibraries }: LibraryMenuProps) => {
  const newLibraryDialogRef = useRef<HTMLDialogElement | null>(null)
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const librarySelectorDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const entityParticipantsDialogRef = useRef<HTMLDialogElement | null>(null)
  const { t } = useTranslation()
  const { user } = useRouteContext({ strict: false })

  const { data: usersData } = useSuspenseQuery(getUsersQueryOptions())

  const { deleteLibrary, updateParticipants, removeParticipant, isPending } = useLibraryActions(library.id)

  useEffect(() => {
    if (!librarySelectorDetailsRef.current) return
    librarySelectorDetailsRef.current.open = false
  }, [library.id])

  useEffect(() => {
    if (!deleteDialogRef.current) return
    const handleMouseDown = (e: MouseEvent) => {
      if (librarySelectorDetailsRef.current && !librarySelectorDetailsRef.current.contains(e.target as Node)) {
        librarySelectorDetailsRef.current.open = false
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  if (!user) return null
  return (
    <div>
      <ul className="menu menu-horizontal rounded-box w-full">
        <li>
          <span className="text-primary/50 menu-title text-nowrap text-xl font-semibold">{t('libraries.title')}</span>
        </li>
        <li>
          <details ref={librarySelectorDetailsRef} className="z-50">
            <summary className="text-primary min-w-68 border-base-content/30 text-nowrap rounded-2xl border text-xl font-semibold">
              {library.name}
            </summary>
            <ul className="rounded-box bg-base-200 min-w-68 p-2 shadow-lg">
              {selectableLibraries.map((library) => (
                <li key={library.id}>
                  <Link
                    to={'.'}
                    className="text-nowrap"
                    params={{ libraryId: library.id }}
                    activeProps={{ className: 'font-bold' }}
                  >
                    {library.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li className="grow-1 items-end">
          <button
            type="button"
            onClick={() => newLibraryDialogRef.current?.showModal()}
            className="btn btn-sm btn-ghost btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            title={t('libraries.newList')}
            data-tip={t('libraries.newList')}
          >
            <ListPlusIcon className="size-5" />
            <span className="max-lg:hidden">{t('libraries.newLibrary')}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-error max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            onClick={() => deleteDialogRef.current?.showModal()}
            disabled={isPending}
            title={t('lists.delete')}
            data-tip={t('lists.delete')}
          >
            <TrashIcon className="size-4" />
            <span className="max-lg:hidden">{t('lists.delete')}</span>
          </button>
        </li>
        <li>
          <EntityParticipants
            entityName={library.name}
            disabled={isPending}
            owner={library.owner}
            participants={library.participants}
            onRemoveParticipant={(participantId) => participantId && removeParticipant({ participantId })}
          />
        </li>
        {library.ownerId === user.id && (
          <>
            <li>
              <button
                type="button"
                className="btn btn-circle border-base-content/20 btn-sm tooltip tooltip-bottom tooltip-info hover:animate-pulse"
                onClick={() => entityParticipantsDialogRef.current?.showModal()}
                title={t('libraries.manageParticipants')}
                data-tip={t('libraries.manageParticipants')}
              >
                <UserPlusIcon className="size-5" />
              </button>
            </li>
          </>
        )}
      </ul>
      <EntityParticipantsDialog
        ref={entityParticipantsDialogRef}
        users={usersData.users}
        participants={library.participants}
        onUpdateParticipants={({ userIds }) => userIds && updateParticipants({ userIds })}
      />
      <NewLibraryDialog ref={newLibraryDialogRef} />
      <DialogForm ref={deleteDialogRef} title={t('libraries.deleteDialogTitle')} onSubmit={() => deleteLibrary()}>
        {t('libraries.deleteDialogConfirmation', { name: library.name })}
      </DialogForm>
    </div>
  )
}
