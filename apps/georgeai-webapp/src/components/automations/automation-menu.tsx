import { useRouteContext } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { AutomationMenu_AutomationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ClipboardIcon } from '../../icons/clipboard-icon'
import { PlayIcon } from '../../icons/play-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { toastSuccess } from '../georgeToaster'
import { useAutomationActions } from './use-automation-actions'

graphql(`
  fragment AutomationMenu_Automation on Automation {
    id
    name
  }
`)

interface AutomationMenuProps {
  automation: AutomationMenu_AutomationFragment
}

export const AutomationMenu = ({ automation }: AutomationMenuProps) => {
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const automationSelectorDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const { t } = useTranslation()
  const { user } = useRouteContext({ strict: false })

  const { deleteAutomation, triggerAutomation, isPending } = useAutomationActions()

  useEffect(() => {
    if (!automationSelectorDetailsRef.current) return
    automationSelectorDetailsRef.current.open = false
  }, [automation.id])

  useEffect(() => {
    if (!automationSelectorDetailsRef.current) return
    const handleMouseDown = (e: MouseEvent) => {
      if (automationSelectorDetailsRef.current && !automationSelectorDetailsRef.current.contains(e.target as Node)) {
        automationSelectorDetailsRef.current.open = false
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const copyAutomationLink = useCallback(async () => {
    const path = `/automations/${automation.id}`
    const fullUrl = `${window.location.origin}${path}`

    try {
      await navigator.clipboard.writeText(fullUrl)
      const popoverElement = document.getElementById('popoverAutomationMenu')
      if (popoverElement) {
        popoverElement.hidePopover()
      }

      toastSuccess(t('sidebar.copyItemLinkSuccess'))
    } catch (err) {
      console.error('Failed to copy the link:', err)
    }
  }, [automation.id, t])

  if (!user) return null
  return (
    <>
      <button
        popoverTarget="popoverAutomationMenu"
        tabIndex={0}
        type="button"
        className={'btn btn-circle bg-base-300 btn-xs'}
        style={{ anchorName: 'anchorAutomationMenu' } as React.CSSProperties}
      >
        <span className="size-3">…</span>
      </button>
      <ul
        title={t('automations.menuTitle')}
        className="dropdown rounded-xl bg-base-200 p-1.5 shadow-sm"
        popover="auto"
        id="popoverAutomationMenu"
        style={
          {
            positionAnchor: 'anchorAutomationMenu',
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
            onClick={() => triggerAutomation(automation.id)}
            disabled={isPending}
            title={t('automations.runAll')}
            data-tip={t('automations.runAll')}
          >
            <PlayIcon className="size-5" />
            <span className="max-lg:hidden">{t('automations.runAll')}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={copyAutomationLink}
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
            onClick={() => deleteDialogRef.current?.showModal()}
            disabled={isPending}
            title={t('automations.delete')}
            data-tip={t('automations.delete')}
          >
            <TrashIcon className="size-4" />
            <span>{t('automations.delete')}</span>
          </button>
        </li>
      </ul>
      <DialogForm
        ref={deleteDialogRef}
        title={t('automations.deleteDialogTitle')}
        description={t('automations.deleteDialogConfirmation', { name: automation.name })}
        onSubmit={() =>
          deleteAutomation(automation.id, {
            onSuccess: () => {
              deleteDialogRef.current?.close()
            },
          })
        }
        disabledSubmit={isPending}
      />
    </>
  )
}
