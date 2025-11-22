import { twMerge } from 'tailwind-merge'

import { ChevronDownIcon } from '../../icons/chevron-down-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { useTranslation } from '../../i18n/use-translation-hook'

export type ContextSourceType = 'field' | 'webCrawl' | 'webSearch' | 'vectorSearch'

export interface ContextSource {
  id: string // Unique ID for React keys
  type: ContextSourceType
  contextFieldId?: string // For field type
  contextFieldName?: string // Display name for field type
  contextQuery?: {
    type: ContextSourceType
    urlTemplate?: string // For webCrawl
    queryTemplate?: string // For webSearch/vectorSearch
  }
  maxContentTokens?: number
}

interface AvailableField {
  id: string
  name: string
  sourceType: string
}

interface ContextSourceListProps {
  value: ContextSource[]
  onChange: (sources: ContextSource[]) => void
  availableFields: AvailableField[]
  excludeFieldId?: string // Field being edited (to prevent self-reference)
}

const DEFAULT_MAX_TOKENS = 4000

export const ContextSourceList = ({
  value,
  onChange,
  availableFields,
  excludeFieldId,
}: ContextSourceListProps) => {
  const { t } = useTranslation()

  // Filter out already selected fields and the current field
  const selectableFields = availableFields.filter(
    (field) =>
      field.id !== excludeFieldId &&
      !value.some((source) => source.type === 'field' && source.contextFieldId === field.id),
  )

  const addSource = (type: ContextSourceType, fieldId?: string, fieldName?: string) => {
    const newSource: ContextSource = {
      id: `${type}-${Date.now()}`,
      type,
      maxContentTokens: DEFAULT_MAX_TOKENS,
    }

    if (type === 'field' && fieldId) {
      newSource.contextFieldId = fieldId
      newSource.contextFieldName = fieldName
    } else if (type !== 'field') {
      newSource.contextQuery = {
        type,
        ...(type === 'webCrawl' ? { urlTemplate: '' } : { queryTemplate: '' }),
      }
    }

    onChange([...value, newSource])
  }

  const removeSource = (id: string) => {
    onChange(value.filter((source) => source.id !== id))
  }

  const updateSource = (id: string, updates: Partial<ContextSource>) => {
    onChange(value.map((source) => (source.id === id ? { ...source, ...updates } : source)))
  }

  const updateContextQuery = (id: string, field: 'urlTemplate' | 'queryTemplate', newValue: string) => {
    onChange(
      value.map((source) => {
        if (source.id !== id || !source.contextQuery) return source
        return {
          ...source,
          contextQuery: {
            ...source.contextQuery,
            [field]: newValue,
          },
        }
      }),
    )
  }

  const getSourceTypeLabel = (type: ContextSourceType): string => {
    switch (type) {
      case 'field':
        return t('lists.contextSources.field')
      case 'webCrawl':
        return t('lists.contextSources.webCrawl')
      case 'webSearch':
        return t('lists.contextSources.webSearch')
      case 'vectorSearch':
        return t('lists.contextSources.vectorSearch')
      default:
        return ''
    }
  }

  const isExpandable = (source: ContextSource): boolean => {
    return source.type !== 'field'
  }

  return (
    <div className="flex flex-col gap-2 min-h-0 flex-1">
      {/* Dropdown to add sources */}
      <div className="dropdown w-full shrink-0">
        <div tabIndex={0} role="button" className="btn btn-outline btn-sm w-full justify-between">
          <span>{t('lists.contextSources.addSource')}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-10 w-full p-2 shadow-lg">
          {/* Fields group */}
          {selectableFields.length > 0 && (
            <>
              <li className="menu-title text-xs">{t('lists.contextSources.fieldsGroup')}</li>
              {selectableFields.map((field) => (
                <li key={field.id}>
                  <button type="button" onClick={() => addSource('field', field.id, field.name)} className="text-sm">
                    {field.name}
                    <span className="text-base-content/50 text-xs">
                      ({field.sourceType === 'file_property' ? t('lists.fields.fileProperty') : t('lists.fields.computed')}
                      )
                    </span>
                  </button>
                </li>
              ))}
            </>
          )}

          {/* External group */}
          <li className="menu-title text-xs">{t('lists.contextSources.externalGroup')}</li>
          <li>
            <button type="button" onClick={() => addSource('webCrawl')} className="text-sm">
              {t('lists.contextSources.webCrawl')}
            </button>
          </li>
          <li>
            <button type="button" onClick={() => addSource('webSearch')} className="text-sm">
              {t('lists.contextSources.webSearch')}
            </button>
          </li>
          <li>
            <button type="button" onClick={() => addSource('vectorSearch')} className="text-sm">
              {t('lists.contextSources.vectorSearch')}
            </button>
          </li>
        </ul>
      </div>

      {/* List of selected sources using DaisyUI collapse/accordion */}
      {value.length > 0 && (
        <div className="space-y-1 flex-1 overflow-y-auto min-h-0">
          {value.map((source) => {
            const expandable = isExpandable(source)

            return (
              <div
                key={source.id}
                className={twMerge('collapse bg-base-200 rounded-lg', expandable && 'collapse-arrow')}
              >
                {/* Checkbox for expand/collapse (only for expandable items) */}
                {expandable && <input type="checkbox" defaultChecked />}

                {/* Header row */}
                <div className={twMerge('flex items-center gap-2 px-3 py-2', expandable && 'collapse-title p-0 min-h-0')}>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSource(source.id)
                    }}
                    className="btn btn-ghost btn-xs text-error"
                    title={t('actions.remove')}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>

                  {/* Type badge */}
                  <span className="badge badge-sm badge-ghost">
                    {source.type === 'field' ? t('lists.contextSources.fieldBadge') : getSourceTypeLabel(source.type)}
                  </span>

                  {/* Name/label */}
                  <span className="flex-1 truncate text-sm">
                    {source.type === 'field' ? source.contextFieldName : ''}
                  </span>

                  {/* Max tokens input */}
                  <input
                    type="number"
                    value={source.maxContentTokens || DEFAULT_MAX_TOKENS}
                    onChange={(e) =>
                      updateSource(source.id, {
                        maxContentTokens: parseInt(e.target.value) || DEFAULT_MAX_TOKENS,
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="input input-xs w-20 text-right"
                    min={100}
                    max={100000}
                    title={t('lists.contextSources.maxTokens')}
                  />
                  <span className="text-base-content/50 text-xs">{t('lists.contextSources.tokens')}</span>
                </div>

                {/* Expanded content for external sources */}
                {expandable && (
                  <div className="collapse-content px-3 pb-3 pt-0">
                    {source.type === 'webCrawl' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium">{t('lists.contextSources.urlTemplate')}</label>
                        <input
                          type="text"
                          value={source.contextQuery?.urlTemplate || ''}
                          onChange={(e) => updateContextQuery(source.id, 'urlTemplate', e.target.value)}
                          placeholder={t('lists.contextSources.urlTemplatePlaceholder')}
                          className="input input-sm w-full"
                        />
                        <p className="text-base-content/50 text-xs">{t('lists.contextSources.templateHelp')}</p>
                      </div>
                    )}

                    {(source.type === 'webSearch' || source.type === 'vectorSearch') && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium">{t('lists.contextSources.queryTemplate')}</label>
                        <input
                          type="text"
                          value={source.contextQuery?.queryTemplate || ''}
                          onChange={(e) => updateContextQuery(source.id, 'queryTemplate', e.target.value)}
                          placeholder={t('lists.contextSources.queryTemplatePlaceholder')}
                          className="input input-sm w-full"
                        />
                        <p className="text-base-content/50 text-xs">{t('lists.contextSources.templateHelp')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {value.length === 0 && (
        <p className="text-base-content/50 py-2 text-center text-xs">{t('lists.contextSources.empty')}</p>
      )}
    </div>
  )
}

// Helper to convert ContextSource[] to the format expected by the API
export const contextSourcesToApiFormat = (
  sources: ContextSource[],
): Array<{ contextFieldId?: string; contextQuery?: string; maxContentTokens?: number }> => {
  return sources.map((source) => ({
    contextFieldId: source.type === 'field' ? source.contextFieldId : undefined,
    contextQuery: source.contextQuery ? JSON.stringify(source.contextQuery) : undefined,
    maxContentTokens: source.maxContentTokens,
  }))
}

// Helper to convert API format back to ContextSource[]
export const apiFormatToContextSources = (
  apiSources: Array<{
    id?: string
    contextFieldId?: string | null
    contextQuery?: string | null
    maxContentTokens?: number | null
  }>,
  availableFields: AvailableField[],
): ContextSource[] => {
  return apiSources.map((apiSource, index) => {
    if (apiSource.contextFieldId) {
      // Field reference
      const field = availableFields.find((f) => f.id === apiSource.contextFieldId)
      return {
        id: apiSource.id || `field-${index}`,
        type: 'field' as const,
        contextFieldId: apiSource.contextFieldId,
        contextFieldName: field?.name || apiSource.contextFieldId,
        maxContentTokens: apiSource.maxContentTokens || DEFAULT_MAX_TOKENS,
      }
    } else if (apiSource.contextQuery) {
      // External source
      const query = JSON.parse(apiSource.contextQuery) as ContextSource['contextQuery']
      return {
        id: apiSource.id || `external-${index}`,
        type: query?.type || 'webCrawl',
        contextQuery: query,
        maxContentTokens: apiSource.maxContentTokens || DEFAULT_MAX_TOKENS,
      }
    }
    // Fallback
    return {
      id: `unknown-${index}`,
      type: 'field' as const,
      maxContentTokens: DEFAULT_MAX_TOKENS,
    }
  })
}
