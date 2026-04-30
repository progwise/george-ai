import { useRouteContext } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { ListMenu_AiListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ClipboardIcon } from '../../icons/clipboard-icon'
import { DownloadIcon } from '../../icons/download-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { toastSuccess } from '../georgeToaster'
import { ListExportDialog } from './list-export-dialog'
import { useListActions } from './use-list-actions'

graphql(`
  fragment ListMenu_AiList on AiList {
    id
    name
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

  const copyListLink = useCallback(async () => {
    const path = `/lists/${list.id}`
    const fullUrl = `${window.location.origin}${path}`

    try {
      await navigator.clipboard.writeText(fullUrl)
      const popoverElement = document.getElementById('popoverListMenu')
      if (popoverElement) {
        popoverElement.hidePopover()
      }

      toastSuccess(t('sidebar.copyItemLinkSuccess'))
    } catch (err) {
      console.error('Failed to copy the link:', err)
    }
  }, [list.id, t])

  if (!user) return null
  return (
    <>
      <button
        popoverTarget="popoverListMenu"
        tabIndex={0}
        type="button"
        className={'btn btn-circle bg-base-300 btn-xs'}
        style={{ anchorName: 'anchorListMenu' } as React.CSSProperties}
      >
        <span className="size-3">…</span>
      </button>

      <ul
        className="dropdown rounded-xl bg-base-200 p-1.5 shadow-sm"
        popover="auto"
        id="popoverListMenu"
        style={
          {
            positionAnchor: 'anchorListMenu',
            transition: 'none',
            top: 'calc(anchor(bottom) + 3px)',
            left: 'calc(anchor(left) - 12px)',
          } as React.CSSProperties
        }
      >
        <li>
          <button
            type="button"
            className="btn w-full justify-start rounded-lg border-none px-3 py-1.5 font-medium btn-ghost btn-success"
            onClick={() => exportListDialogRef.current?.showModal()}
            title={t('lists.export.button')}
          >
            <DownloadIcon />
            {t('lists.export.button')}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={copyListLink}
            className="btn w-full justify-start rounded-lg border-none px-3 py-1.5 font-medium btn-ghost hover:bg-base-100"
          >
            <ClipboardIcon />
            {t('sidebar.copyItemLink')}
          </button>
        </li>
        <li>
          <button
            type="button"
            className="btn w-full justify-start rounded-lg px-3 py-1.5 font-medium text-error btn-ghost hover:bg-error/20"
            onClick={() => {
              deleteDialogRef.current?.showModal()
            }}
            disabled={isPending}
            title={t('lists.delete')}
            data-tip={t('lists.delete')}
          >
            <TrashIcon />
            {t('lists.delete')}
          </button>
        </li>
      </ul>

      <DialogForm ref={deleteDialogRef} title={t('lists.deleteDialogTitle')} onSubmit={() => deleteList()}>
        {t('lists.deleteDialogConfirmation', { name: list.name })}
      </DialogForm>
      <ListExportDialog listId={list.id} ref={exportListDialogRef} />
    </>
  )
}
