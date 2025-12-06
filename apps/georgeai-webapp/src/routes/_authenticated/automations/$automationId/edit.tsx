import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'

import { getConnectorTypesQueryOptions } from '../../../../components/admin/connectors/queries/get-connector-types'
import { getAutomationQueryOptions } from '../../../../components/automations/queries'
import { useAutomationActions } from '../../../../components/automations/use-automation-actions'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { PlusIcon } from '../../../../icons/plus-icon'
import { TrashIcon } from '../../../../icons/trash-icon'

interface FieldMapping {
  id: string
  sourceFieldId: string
  targetField: string
  transform: string
}

export const Route = createFileRoute('/_authenticated/automations/$automationId/edit')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getAutomationQueryOptions(params.automationId)),
      context.queryClient.ensureQueryData(getConnectorTypesQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { automationId } = Route.useParams()
  const { updateAutomation, isPending } = useAutomationActions()

  const {
    data: { automation },
  } = useSuspenseQuery(getAutomationQueryOptions(automationId))

  const {
    data: { connectorTypes },
  } = useSuspenseQuery(getConnectorTypesQueryOptions())

  // Parse the current action config
  const initialConfig = useMemo(() => {
    try {
      return JSON.parse(automation?.connectorActionConfigJson || '{}') as Record<string, unknown>
    } catch {
      return {}
    }
  }, [automation?.connectorActionConfigJson])

  // Form state
  const [name, setName] = useState(automation?.name || '')
  const [connectorAction, setConnectorAction] = useState(automation?.connectorAction || '')
  const [actionConfig, setActionConfig] = useState<Record<string, unknown>>(initialConfig)
  const [executeOnEnrichment, setExecuteOnEnrichment] = useState(automation?.executeOnEnrichment || false)

  // Get connector type and its actions
  const connectorType = connectorTypes.find((ct) => ct.id === automation?.connector.connectorType)
  const availableActions = connectorType?.actions || []
  const selectedAction = availableActions.find((a) => a.id === connectorAction)

  // Get list fields for mapping
  const listFields = automation?.list.fields || []

  // Helper to update a config field
  const updateConfigField = useCallback((fieldId: string, value: unknown) => {
    setActionConfig((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  // Field mappings helpers
  const fieldMappings = (actionConfig.fieldMappings as FieldMapping[]) || []

  const addFieldMapping = useCallback(() => {
    setActionConfig((prev) => ({
      ...prev,
      fieldMappings: [
        ...((prev.fieldMappings as FieldMapping[]) || []),
        { id: crypto.randomUUID(), sourceFieldId: '', targetField: '', transform: 'raw' },
      ],
    }))
  }, [])

  const removeFieldMapping = useCallback((index: number) => {
    setActionConfig((prev) => ({
      ...prev,
      fieldMappings: ((prev.fieldMappings as FieldMapping[]) || []).filter((_, i) => i !== index),
    }))
  }, [])

  const updateFieldMapping = useCallback((index: number, updates: Partial<FieldMapping>) => {
    setActionConfig((prev) => ({
      ...prev,
      fieldMappings: ((prev.fieldMappings as FieldMapping[]) || []).map((mapping, i) =>
        i === index ? { ...mapping, ...updates } : mapping,
      ),
    }))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!automation) return

    updateAutomation({
      id: automationId,
      name,
      listId: automation.listId,
      connectorId: automation.connectorId,
      connectorAction,
      actionConfig: JSON.stringify(actionConfig),
      executeOnEnrichment,
    })
  }

  if (!automation) {
    return <div className="text-error">{t('automations.notFound')}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="prose">
        <h3>{t('automations.editSettings')}</h3>
      </div>

      {/* Basic Settings */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h4 className="card-title text-base">{t('automations.settings')}</h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">{t('automations.labelName')}</legend>
              <input
                type="text"
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </fieldset>

            {/* Connector (read-only) */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">{t('automations.labelConnector')}</legend>
              <input type="text" className="input w-full" value={automation.connector.name || ''} disabled />
            </fieldset>

            {/* List (read-only) */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">{t('automations.labelList')}</legend>
              <input type="text" className="input w-full" value={automation.list.name} disabled />
            </fieldset>

            {/* Action */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">{t('automations.labelAction')}</legend>
              <select
                className="select w-full"
                value={connectorAction}
                onChange={(e) => setConnectorAction(e.target.value)}
                required
              >
                <option value="" disabled>
                  {t('automations.selectAction')}
                </option>
                {availableActions.map((action) => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Execute on Enrichment */}
            <fieldset className="fieldset col-span-full">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={executeOnEnrichment}
                  onChange={(e) => setExecuteOnEnrichment(e.target.checked)}
                />
                <span>{t('automations.labelExecuteOnEnrichment')}</span>
              </label>
            </fieldset>
          </div>
        </div>
      </div>

      {/* Dynamic Action Configuration */}
      {selectedAction && selectedAction.configFields.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h4 className="card-title text-base">{t('automations.fieldMappings')}</h4>

            {selectedAction.configFields.map((field) => {
              // List field select (e.g., productIdField)
              if (field.type === 'listFieldSelect') {
                return (
                  <fieldset key={field.id} className="fieldset">
                    <legend className="fieldset-legend">
                      {field.name}
                      {field.required && <span className="text-error"> *</span>}
                    </legend>
                    {field.description && <p className="text-base-content/60 mb-2 text-sm">{field.description}</p>}
                    <select
                      className="select w-full max-w-md"
                      value={(actionConfig[field.id] as string) || ''}
                      onChange={(e) => updateConfigField(field.id, e.target.value)}
                      required={field.required}
                    >
                      <option value="" disabled>
                        Select a field...
                      </option>
                      {listFields.map((lf) => (
                        <option key={lf.id} value={lf.id}>
                          {lf.name}
                        </option>
                      ))}
                    </select>
                  </fieldset>
                )
              }

              // Field mappings
              if (field.type === 'fieldMappings') {
                return (
                  <div key={field.id} className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{field.name}</span>
                        {field.description && <p className="text-base-content/60 text-sm">{field.description}</p>}
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addFieldMapping}>
                        <PlusIcon className="size-4" />
                        {t('automations.addMapping')}
                      </button>
                    </div>

                    {fieldMappings.length === 0 ? (
                      <div className="text-base-content/50 text-sm">{t('automations.addMapping')}</div>
                    ) : (
                      <div className="space-y-2">
                        {fieldMappings.map((mapping, index) => (
                          <div
                            key={mapping.id || `mapping-${index}`}
                            className="bg-base-100 flex items-center gap-2 rounded-lg p-3"
                          >
                            {/* Source Field */}
                            <select
                              className="select select-sm flex-1"
                              value={mapping.sourceFieldId}
                              onChange={(e) => updateFieldMapping(index, { sourceFieldId: e.target.value })}
                              aria-label={t('automations.sourceField')}
                            >
                              <option value="">{t('automations.sourceField')}</option>
                              {listFields.map((lf) => (
                                <option key={lf.id} value={lf.id}>
                                  {lf.name}
                                </option>
                              ))}
                            </select>

                            <span className="text-base-content/50">→</span>

                            {/* Target Field */}
                            <select
                              className="select select-sm flex-1"
                              value={mapping.targetField}
                              onChange={(e) => updateFieldMapping(index, { targetField: e.target.value })}
                              aria-label={t('automations.targetField')}
                            >
                              <option value="">{t('automations.targetField')}</option>
                              {field.targetFields?.map((tf) => (
                                <option key={tf.id} value={tf.id}>
                                  {tf.name}
                                </option>
                              ))}
                            </select>

                            {/* Transform */}
                            <select
                              className="select select-sm w-40"
                              value={mapping.transform}
                              onChange={(e) => updateFieldMapping(index, { transform: e.target.value })}
                              aria-label={t('automations.transform')}
                            >
                              {field.transforms?.map((tr) => (
                                <option key={tr.id} value={tr.id}>
                                  {tr.name}
                                </option>
                              ))}
                            </select>

                            {/* Remove */}
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm text-error"
                              onClick={() => removeFieldMapping(index)}
                              aria-label={`Remove mapping ${index + 1}`}
                            >
                              <TrashIcon className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // String input
              if (field.type === 'string') {
                return (
                  <fieldset key={field.id} className="fieldset">
                    <legend className="fieldset-legend">
                      {field.name}
                      {field.required && <span className="text-error"> *</span>}
                    </legend>
                    {field.description && <p className="text-base-content/60 mb-2 text-sm">{field.description}</p>}
                    <input
                      type="text"
                      className="input w-full max-w-md"
                      value={(actionConfig[field.id] as string) || ''}
                      onChange={(e) => updateConfigField(field.id, e.target.value)}
                      required={field.required}
                    />
                  </fieldset>
                )
              }

              // Select
              if (field.type === 'select' && field.options) {
                return (
                  <fieldset key={field.id} className="fieldset">
                    <legend className="fieldset-legend">
                      {field.name}
                      {field.required && <span className="text-error"> *</span>}
                    </legend>
                    {field.description && <p className="text-base-content/60 mb-2 text-sm">{field.description}</p>}
                    <select
                      className="select w-full max-w-md"
                      value={(actionConfig[field.id] as string) || ''}
                      onChange={(e) => updateConfigField(field.id, e.target.value)}
                      required={field.required}
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      {field.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </fieldset>
                )
              }

              return null
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? t('actions.saving') : t('actions.save')}
        </button>
      </div>
    </form>
  )
}
