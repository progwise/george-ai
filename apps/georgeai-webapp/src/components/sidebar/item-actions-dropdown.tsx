import { useCallback, useId, useRef, useState } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { ClipboardIcon } from '../../icons/clipboard-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { useAutomationActions } from '../automations/use-automation-actions'
import { DialogForm } from '../dialog-form'
import { toastSuccess } from '../georgeToaster'
import { useLibraryActions } from '../library/use-library-actions'
import { useListActions } from '../lists/use-list-actions'

interface ItemActionsDropdownProps {
  item: { id: string; name: string }
  groupName: 'libraries' | 'lists' | 'automations'
}

export const ItemActionsDropdown = ({ item, groupName }: ItemActionsDropdownProps) => {
  const { t } = useTranslation()
  const popoverId = useId()
  const anchorId = useId()
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const libraryActions = useLibraryActions(item.id)
  const listActions = useListActions(item.id)
  const automationActions = useAutomationActions()
  const isPending = libraryActions.isPending || listActions.isPending || automationActions.isPending

  const deleteItem = useCallback(() => {
    switch (groupName) {
      case 'libraries':
        return libraryActions.deleteLibrary()
      case 'lists':
        return listActions.deleteList()
      case 'automations':
        return automationActions.deleteAutomation(item.id)
      default:
        throw new Error(`Not implemented: ${groupName}`)
    }
  }, [groupName, libraryActions, listActions, automationActions, item.id])

  const copyItemLink = useCallback(async () => {
    const path = `/${groupName}/${item.id}`
    const fullUrl = `${window.location.origin}${path}`

    try {
      await navigator.clipboard.writeText(fullUrl)
      const popoverElement = document.getElementById(popoverId)
      if (popoverElement) {
        popoverElement.hidePopover()
      }

      toastSuccess(t('sidebar.copyItemLinkSuccess'))
    } catch (err) {
      console.error('Failed to copy the link:', err)
    }
  }, [groupName, item.id, popoverId, t])

  return (
    <>
      <button
        popoverTarget={popoverId}
        tabIndex={0}
        type="button"
        className={`btn btn-circle scale-80 border-none btn-ghost btn-sm group-hover:opacity-100 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ anchorName: anchorId } as React.CSSProperties}
      >
        <span className="size-4">…</span>
      </button>

      <ul
        className="dropdown rounded-xl bg-base-300 p-1.5 shadow-sm"
        popover="auto"
        id={popoverId}
        style={
          {
            positionAnchor: anchorId,
            transition: 'none',
            top: 'calc(anchor(bottom) + 3px)',
            left: 'calc(anchor(left) - 12px)',
          } as React.CSSProperties
        }
        onToggle={(e) => setIsOpen(e.newState === 'open')}
      >
        <li>
          <button
            type="button"
            onClick={copyItemLink}
            className="btn w-full justify-start rounded-lg px-3 py-1.5 font-medium btn-ghost hover:bg-base-200"
          >
            <ClipboardIcon />
            {t('sidebar.copyItemLink')}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              deleteDialogRef.current?.showModal()
              setIsOpen(!isOpen)
            }}
            disabled={isPending}
            className="btn w-full justify-start rounded-lg px-3 py-1.5 font-medium text-error btn-ghost hover:bg-error/20"
          >
            <TrashIcon />
            {t('sidebar.deleteItem')}
          </button>
        </li>
      </ul>

      <DialogForm
        ref={deleteDialogRef}
        title={t(`${groupName}.deleteDialogTitle`, { name: item.name })}
        onSubmit={() => deleteItem()}
        className="transition-none"
      >
        {t(`${groupName}.deleteDialogConfirmation`, { name: item.name })}
      </DialogForm>
    </>
  )
}
