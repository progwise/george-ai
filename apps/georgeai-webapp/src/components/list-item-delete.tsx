import { ReactNode, useCallback, useRef } from 'react'

import { useTranslation } from '../i18n/use-translation-hook'
import { TrashIcon } from '../icons/trash-icon'
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

  return (
    <>
      <li>{renderItemLink(item)}</li>
      <li>
        <button
          type="button"
          className="btn absolute right-1 bottom-0.5 btn-ghost btn-sm max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
          onClick={() => deleteDialogRef.current?.showModal()}
          disabled={isPending}
          title={t('lists.delete')}
          data-tip={t('lists.delete')}
        >
          <TrashIcon className="size-4" />
        </button>
      </li>

      <DialogForm ref={deleteDialogRef} title={t(`${groupName}.deleteDialogTitle`)} onSubmit={() => deleteItem()}>
        {t(`${groupName}.deleteDialogConfirmation`, { name: item.name })}
      </DialogForm>
    </>
  )
}
