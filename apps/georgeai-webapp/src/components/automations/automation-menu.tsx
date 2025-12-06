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
      <ul className="menu menu-horizontal rounded-box w-full">
        <li>
          <span className="text-primary/50 menu-title text-nowrap text-xl font-semibold">{t('automations.title')}</span>
        </li>
        <li>
          <details title={t('automations.title')} ref={automationSelectorDetailsRef} className="z-50">
            <summary
              role="button"
              aria-label={t('automations.selectAutomation')}
              className="text-primary min-w-68 border-base-content/30 text-nowrap rounded-2xl border text-xl font-semibold"
            >
              {automation.name}
            </summary>
            <ul className="rounded-box bg-base-200 min-w-68 p-2 shadow-lg">
              {selectableAutomations.map((a) => (
                <li key={a.id}>
                  <Link
                    to={'.'}
                    className="text-nowrap"
                    params={{ automationId: a.id }}
                    activeProps={{ className: 'font-bold' }}
                  >
                    {a.name}
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
            onClick={() => newAutomationDialogRef.current?.showModal()}
            className="btn btn-sm btn-ghost btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
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
            className="btn btn-sm btn-ghost btn-error max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
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
        onSubmit={() => deleteAutomation(automation.id)}
      >
        {t('automations.deleteDialogConfirmation', { name: automation.name })}
      </DialogForm>
    </div>
  )
}
