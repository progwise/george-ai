import { useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { ListMenu_AiListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DownloadIcon } from '../../icons/download-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { ListExportDialog } from './list-export-dialog'
import { useListActions } from './use-list-actions'

graphql(`
  fragment ListMenu_AiList on AiList {
    id
    name
    ownerId
  }
`)

interface ListMenuProps {
  list: ListMenu_AiListFragment
}

export const ListMenu = ({ list }: ListMenuProps) => {
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const listSelectorDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const exportListDialogRef = useRef<HTMLDialogElement | null>(null)
  const { t } = useTranslation()
  const { user } = useRouteContext({ strict: false })

  const { deleteList, isPending } = useListActions(list.id)

  useEffect(() => {
    if (!listSelectorDetailsRef.current) return
    listSelectorDetailsRef.current.open = false
  }, [list.id])

  useEffect(() => {
    if (!listSelectorDetailsRef.current) return
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
      <ul className="menu menu-horizontal w-full rounded-box">
        <li className="grow items-end">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
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
            className="btn btn-ghost btn-sm btn-error max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            onClick={() => deleteDialogRef.current?.showModal()}
            disabled={isPending}
            title={t('lists.delete')}
            data-tip={t('lists.delete')}
          >
            <TrashIcon className="size-4" />
            <span className="max-lg:hidden">{t('lists.delete')}</span>
          </button>
        </li>
      </ul>
      <DialogForm ref={deleteDialogRef} title={t('lists.deleteDialogTitle')} onSubmit={() => deleteList()}>
        {t('lists.deleteDialogConfirmation', { name: list.name })}
      </DialogForm>
      <ListExportDialog listId={list.id} ref={exportListDialogRef} />
    </div>
  )
}
