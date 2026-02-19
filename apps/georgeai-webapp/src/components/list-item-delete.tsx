import { ReactNode, useCallback, useId, useRef, useState } from 'react'

import { useTranslation } from '../i18n/use-translation-hook'
import { useAutomationActions } from './automations/use-automation-actions'
import { DialogForm } from './dialog-form'
import { useLibraryActions } from './library/use-library-actions'
import { useListActions } from './lists/use-list-actions'

interface ListItemWithDeleteProps {
  item: { id: string; name: string }
  renderItemLink: (item: { id: string; name: string }) => ReactNode
  groupName: 'libraries' | 'lists' | 'automations'
}

export const ListItemWithDelete = ({ item, renderItemLink, groupName }: ListItemWithDeleteProps) => {
  const { t } = useTranslation()
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const libraryActions = useLibraryActions(item.id)
  const listActions = useListActions(item.id)
  const automationActions = useAutomationActions()
  const isPending = libraryActions.isPending || listActions.isPending || automationActions.isPending

  const popoverId = useId()

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

  return (
    <>
      <div className="group/item relative">
        {renderItemLink(item)}
        <div className="absolute top-0.5 right-0.5">
          <button
            popoverTarget={popoverId}
            tabIndex={0}
            type="button"
            className="btn btn-circle scale-80 border-none btn-ghost btn-sm hover:bg-error/70"
          >
            <span className="size-4">…</span>
          </button>
          <div className="dropdown rounded-box bg-base-300 p-1 shadow-sm" popover="auto" id={popoverId}>
            <button
              type="button"
              onClick={() => {
                deleteDialogRef.current?.showModal()
                setIsOpen(!isOpen)
              }}
              disabled={isPending}
              className="cursor-pointer rounded-lg px-2 py-1 text-error hover:bg-error/10"
            >
              {t('lists.delete')}
            </button>
          </div>
        </div>
      </div>

      <DialogForm
        ref={deleteDialogRef}
        title={t(`${groupName}.deleteDialogTitle`, { name: item.name })}
        onSubmit={() => deleteItem()}
      >
        {t(`${groupName}.deleteDialogConfirmation`, { name: item.name })}
      </DialogForm>
    </>
  )
}
