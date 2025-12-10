import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRef } from 'react'

import { NewAutomationDialog } from '../../../components/automations/new-automation-dialog'
import { getAutomationsQueryOptions } from '../../../components/automations/queries'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlusIcon } from '../../../icons/plus-icon'

export const Route = createFileRoute('/_authenticated/automations/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { automations } = await context.queryClient.ensureQueryData(getAutomationsQueryOptions())
    const latestAutomation = automations.at(0)

    if (latestAutomation) {
      throw redirect({
        to: '/automations/$automationId',
        params: { automationId: latestAutomation.id },
      })
    }
  },
})

function RouteComponent() {
  const newAutomationDialogRef = useRef<HTMLDialogElement | null>(null)
  const { t } = useTranslation()

  return (
    <div className="absolute flex h-screen w-full">
      <div className="prose mx-auto mt-8">
        <p>{t('automations.firstAutomation')}</p>
        <button
          type="button"
          onClick={() => newAutomationDialogRef.current?.showModal()}
          className="btn btn-sm"
          title={t('automations.newAutomation')}
        >
          <PlusIcon className="size-6" />
          <span>{t('automations.newAutomation')}</span>
        </button>
        <NewAutomationDialog ref={newAutomationDialogRef} />
      </div>
    </div>
  )
}
