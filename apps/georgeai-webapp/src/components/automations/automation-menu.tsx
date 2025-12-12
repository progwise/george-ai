import { Link, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { AutomationMenu_AutomationFragment, AutomationMenu_AutomationsFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlayIcon } from '../../icons/play-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { NewAutomationDialog } from './new-automation-dialog'
import { useAutomationActions } from './use-automation-actions'

graphql(`
  fragment AutomationMenu_Automation on AiAutomation {
    id
    name
  }
`)

graphql(`
  fragment AutomationMenu_Automations on AiAutomation {
    id
    name
  }
`)

interface AutomationMenuProps {
  automation: AutomationMenu_AutomationFragment
  selectableAutomations: AutomationMenu_AutomationsFragment[]
}

export const AutomationMenu = ({ automation, selectableAutomations }: AutomationMenuProps) => {
  const newAutomationDialogRef = useRef<HTMLDialogElement | null>(null)
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

  if (!user) return null
  return (
    <div>
      <ul title={t('automations.menuTitle')} className="menu menu-horizontal w-full rounded-box">
        <li>
          <span className="menu-title text-xl font-semibold text-nowrap text-primary/50">{t('automations.title')}</span>
        </li>
        <li>
          <details aria-label={t('automations.switcherTitle')} ref={automationSelectorDetailsRef} className="z-50">
            <summary className="min-w-68 rounded-2xl border border-base-content/30 text-xl font-semibold text-nowrap text-primary">
              {automation.name}
            </summary>
            <ul role="listbox" className="min-w-68 rounded-box bg-base-200 p-2 shadow-lg">
              {selectableAutomations.map((a) => (
                <li key={a.id} role="option" aria-selected={a.id === automation.id}>
                  <Link
                    to="."
                    className="text-nowrap"
                    params={{ automationId: a.id }}
                    activeProps={{ className: 'font-bold' }}
                    onClick={() => {
                      automationSelectorDetailsRef.current?.removeAttribute('open')
                    }}
                  >
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li className="grow items-end">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
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
            disabled={isPending}
            onClick={() => {
              newAutomationDialogRef.current?.showModal()
            }}
            className="btn btn-ghost btn-sm btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            title={t('automations.newAutomation')}
            data-tip={t('automations.newAutomation')}
          >
            <PlusIcon className="size-5" />
            <span className="max-lg:hidden">{t('automations.newAutomation')}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-error max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            onClick={() => deleteDialogRef.current?.showModal()}
            disabled={isPending}
            title={t('automations.delete')}
            data-tip={t('automations.delete')}
          >
            <TrashIcon className="size-4" />
            <span className="max-lg:hidden">{t('automations.delete')}</span>
          </button>
        </li>
      </ul>
      <NewAutomationDialog ref={newAutomationDialogRef} />
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
    </div>
  )
}
