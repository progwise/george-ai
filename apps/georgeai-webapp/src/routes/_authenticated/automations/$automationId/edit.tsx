import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getAutomationQueryOptions } from '../../../../components/automations/queries'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/automations/$automationId/edit')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getAutomationQueryOptions(params.automationId))
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { automationId } = Route.useParams()

  const {
    data: { automation },
  } = useSuspenseQuery(getAutomationQueryOptions(automationId))

  if (!automation) {
    return <div className="text-error">{t('automations.notFound')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="prose">
        <h3>{t('automations.editSettings')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('automations.labelName')}</label>
          <div className="text-base-content">{automation.name}</div>
        </div>
        <div>
          <label className="label">{t('automations.labelList')}</label>
          <div className="text-base-content">{automation.list.name}</div>
        </div>
        <div>
          <label className="label">{t('automations.labelConnector')}</label>
          <div className="text-base-content">{automation.connector.name}</div>
        </div>
        <div>
          <label className="label">{t('automations.labelAction')}</label>
          <div className="text-base-content">{automation.connectorAction}</div>
        </div>
        <div>
          <label className="label">{t('automations.labelExecuteOnEnrichment')}</label>
          <div className="text-base-content">{automation.executeOnEnrichment ? t('actions.yes') : t('actions.no')}</div>
        </div>
        {automation.schedule && (
          <div>
            <label className="label">{t('automations.labelSchedule')}</label>
            <div className="text-base-content">{automation.schedule}</div>
          </div>
        )}
      </div>

      <div className="text-base-content/50 text-sm">{t('automations.editComingSoon')}</div>
    </div>
  )
}
