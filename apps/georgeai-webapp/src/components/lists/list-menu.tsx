import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { ListMenu_AiListFragment, ListMenu_AiListsFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DownloadIcon } from '../../icons/download-icon'
import { ListPlusIcon } from '../../icons/list-plus-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { UserPlusIcon } from '../../icons/user-plus-icon'
import { getUsersQueryOptions } from '../../server-functions/users'
import { DialogForm } from '../dialog-form'
import { EntityParticipants } from '../participant/entity-participants'
import { EntityParticipantsDialog } from '../participant/entity-participants-dialog'
import { ListExportDialog } from './list-export-dialog'
import { NewListDialog } from './new-list-dialog'
import { useListActions } from './use-list-actions'

graphql(`
  fragment ListMenu_AiList on AiList {
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
  fragment ListMenu_AiLists on AiList {
    id
    name
  }
`)

interface ListMenuProps {
  list: ListMenu_AiListFragment
  selectableLists: ListMenu_AiListsFragment[]
}

export const ListMenu = ({ list, selectableLists }: ListMenuProps) => {
  const newListDialogRef = useRef<HTMLDialogElement | null>(null)
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const listSelectorDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const entityParticipantsDialogRef = useRef<HTMLDialogElement | null>(null)
  const exportListDialogRef = useRef<HTMLDialogElement | null>(null)
  const { t } = useTranslation()
  const { user } = useRouteContext({ strict: false })

  const { data: usersData } = useSuspenseQuery(getUsersQueryOptions())

  const { deleteList, updateParticipants, removeParticipant, isPending } = useListActions(list.id)

  useEffect(() => {
    if (!listSelectorDetailsRef.current) return
    listSelectorDetailsRef.current.open = false
  }, [list.id])

  useEffect(() => {
    if (!deleteDialogRef.current) return
    const handleMouseDown = (e: MouseEvent) => {
      if (listSelectorDetailsRef.current && !listSelectorDetailsRef.current.contains(e.target as Node)) {
        listSelectorDetailsRef.current.open = false
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
          <span className="text-primary/50 menu-title text-nowrap text-xl font-semibold">{t('lists.title')}</span>
        </li>
        <li>
          <details title={t('lists.title')} ref={listSelectorDetailsRef} className="z-50">
            <summary
              role="button"
              aria-label={t('lists.selectList')}
              className="text-primary min-w-68 border-base-content/30 text-nowrap rounded-2xl border text-xl font-semibold"
            >
              {list.name}
            </summary>
            <ul className="rounded-box bg-base-200 min-w-68 p-2 shadow-lg">
              {selectableLists.map((list) => (
                <li key={list.id}>
                  <Link
                    to={'.'}
                    className="text-nowrap"
                    params={{ listId: list.id }}
                    activeProps={{ className: 'font-bold' }}
                  >
                    {list.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li className="grow-1 items-end">
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            onClick={() => exportListDialogRef.current?.showModal()}
            title={t('lists.export.button')}
            data-tip={t('lists.export.button')}
          >
            <DownloadIcon className="size-5" />
            <span className="max-lg:hidden">{t('lists.export.button')}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => newListDialogRef.current?.showModal()}
            className="btn btn-sm btn-ghost btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            title={t('lists.newList')}
            data-tip={t('lists.newList')}
          >
            <ListPlusIcon className="size-5" />
            <span className="max-lg:hidden">{t('lists.newList')}</span>
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
            entityName={list.name}
            disabled={isPending}
            owner={list.owner}
            participants={list.participants}
            onRemoveParticipant={(participantId) => participantId && removeParticipant({ participantId })}
          />
        </li>
        {list.ownerId === user.id && (
          <>
            <li>
              <button
                type="button"
                className="btn btn-circle border-base-content/20 btn-sm tooltip tooltip-bottom tooltip-info hover:animate-pulse"
                onClick={() => entityParticipantsDialogRef.current?.showModal()}
                title={t('lists.manageParticipants')}
                data-tip={t('lists.manageParticipants')}
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
        participants={list.participants}
        onUpdateParticipants={({ userIds }) => userIds && updateParticipants({ userIds })}
      />
      <NewListDialog ref={newListDialogRef} />
      <DialogForm ref={deleteDialogRef} title={t('lists.deleteDialogTitle')} onSubmit={() => deleteList()}>
        {t('lists.deleteDialogConfirmation', { name: list.name })}
      </DialogForm>
      <ListExportDialog listId={list.id} ref={exportListDialogRef} />
    </div>
  )
}
