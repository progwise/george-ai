import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getConnectorTypesQueryOptions } from '../../../../components/admin/connectors/queries/get-connector-types'
import { getAutomationQueryOptions } from '../../../../components/automations/queries'
import { useAutomationActions } from '../../../../components/automations/use-automation-actions'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { LinkIcon } from '../../../../icons/link-icon'
import { PlusIcon } from '../../../../icons/plus-icon'
import { TrashIcon } from '../../../../icons/trash-icon'

interface FieldMapping {
  id: string
  sourceFieldId: string
  targetField: string
  transform: string
}

export const Route = createFileRoute('/_authenticated/automations/$automationId/settings')({
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
  const { user } = Route.useRouteContext()
  const { automationId } = Route.useParams()
  const { updateAutomation, isPending } = useAutomationActions()

  const {
    data: { automation },
  } = useSuspenseQuery(getAutomationQueryOptions(automationId))

  const {
    data: { connectorTypes },
  } = useSuspenseQuery(getConnectorTypesQueryOptions())

  // Convert structured config back to record format for form state
  const initialConfig = useMemo(() => {
    const config: Record<string, unknown> = {}

    // Convert values array back to key-value pairs
    for (const { key, value } of automation.connectorActionConfig.values) {
      config[key] = value
    }

    // Add fieldMappings if present
    if (automation.connectorActionConfig.fieldMappings.length > 0) {
      config.fieldMappings = automation.connectorActionConfig.fieldMappings.map((m) => ({
        id: crypto.randomUUID(),
        sourceFieldId: m.sourceFieldId,
        targetField: m.targetField,
        transform: m.transform,
      }))
    }

    return config
  }, [automation.connectorActionConfig])

  // Form state
  const [name, setName] = useState(automation.name)
  const [connectorAction, setConnectorAction] = useState(automation.connectorAction)
  const [actionConfig, setActionConfig] = useState<Record<string, unknown>>(initialConfig)
  const [executeOnEnrichment, setExecuteOnEnrichment] = useState(automation.executeOnEnrichment)

  // Reset form state when automation changes (e.g., when switching automations)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setName(automation.name)
      setConnectorAction(automation.connectorAction)
      setActionConfig(initialConfig)
      setExecuteOnEnrichment(automation.executeOnEnrichment)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [automation.id, automation.name, automation.connectorAction, automation.executeOnEnrichment, initialConfig])

  // Get connector type and its actions
  const connectorType = connectorTypes.find((ct) => ct.id === automation.connector.connectorType)
  const availableActions = connectorType?.actions || []
  const selectedAction = availableActions.find((a) => a.id === connectorAction)

  // Get list fields for mapping
  const listFields = automation.list.fields

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

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
      {/* Basic Settings */}
      <div className="card card-compact bg-base-200">
        <div className="card-body">
          <h4 className="card-title text-sm">{t('automations.settings')}</h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Name */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs">{t('automations.labelName')}</legend>
              <input
                type="text"
                className="input input-sm w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </fieldset>

            {/* Action */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs">{t('automations.labelAction')}</legend>
              <select
                className="select select-sm w-full"
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

            {/* Connector (read-only) */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs">{t('automations.labelConnector')}</legend>
              <label className="input input-sm w-full">
                <input type="text" value={automation.connector.name || ''} disabled />
                {user.isAdmin && (
                  <Link to="/admin/connectors" className="link link-sm">
                    <LinkIcon className="size-3" />
                  </Link>
                )}
              </label>
            </fieldset>

            {/* List (read-only) */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs">{t('automations.labelList')}</legend>
              <label className="input input-sm w-full">
                <input type="text" value={automation.list.name} disabled />
                <Link to="/lists/$listId" params={{ listId: automation.listId }} className="link link-sm">
                  <LinkIcon className="size-3" />
                </Link>
              </label>
            </fieldset>
          </div>

          {/* Execute on Enrichment */}
          <label className="label cursor-pointer justify-start gap-1.5 py-1">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={executeOnEnrichment}
              onChange={(e) => setExecuteOnEnrichment(e.target.checked)}
            />
            <span className="text-xs">{t('automations.labelExecuteOnEnrichment')}</span>
          </label>
        </div>
      </div>

      {/* Dynamic Action Configuration */}
      {selectedAction && selectedAction.configFields.length > 0 && (
        <div className="card card-compact bg-base-200">
          <div className="card-body">
            <h4 className="card-title text-sm">{t('automations.fieldMappings')}</h4>

            <div className="space-y-3">
              {selectedAction.configFields.map((field) => {
                // List field select (e.g., productIdField)
                if (field.type === 'listFieldSelect') {
                  return (
                    <fieldset key={field.id} className="fieldset">
                      <legend className="fieldset-legend text-xs">
                        {field.name}
                        {field.required && <span className="text-error"> *</span>}
                      </legend>
                      {field.description && <p className="text-base-content/60 mb-1 text-xs">{field.description}</p>}
                      <select
                        className="select select-sm w-full"
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
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium">{field.name}</span>
                          {field.description && <p className="text-base-content/60 text-xs">{field.description}</p>}
                        </div>
                        <button type="button" className="btn btn-ghost btn-xs" onClick={addFieldMapping}>
                          <PlusIcon className="size-3" />
                          {t('automations.addMapping')}
                        </button>
                      </div>

                      {fieldMappings.length === 0 ? (
                        <div className="text-base-content/50 text-xs">{t('automations.noMappings')}</div>
                      ) : (
                        <div className="space-y-1">
                          {fieldMappings.map((mapping, index) => (
                            <div
                              key={mapping.id || `mapping-${index}`}
                              className="bg-base-100 flex items-center gap-2 rounded p-2"
                            >
                              <select
                                className="select select-xs flex-1"
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

                              <span className="text-base-content/50 text-xs">→</span>

                              <select
                                className="select select-xs flex-1"
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

                              <select
                                className="select select-xs w-28"
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

                              <button
                                type="button"
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => removeFieldMapping(index)}
                                aria-label={`Remove mapping ${index + 1}`}
                              >
                                <TrashIcon className="size-3" />
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
                      <legend className="fieldset-legend text-xs">
                        {field.name}
                        {field.required && <span className="text-error"> *</span>}
                      </legend>
                      {field.description && <p className="text-base-content/60 mb-1 text-xs">{field.description}</p>}
                      <input
                        type="text"
                        className="input input-sm w-full"
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
                      <legend className="fieldset-legend text-xs">
                        {field.name}
                        {field.required && <span className="text-error"> *</span>}
                      </legend>
                      {field.description && <p className="text-base-content/60 mb-1 text-xs">{field.description}</p>}
                      <select
                        className="select select-sm w-full"
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
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
          {isPending ? t('actions.saving') : t('actions.save')}
        </button>
      </div>
    </form>
  )
}
