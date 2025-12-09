import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CopyIcon } from '../../icons/copy-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { ClientDate } from '../client-date'
import { getAutomationItemQueryOptions } from './queries/get-automation-item'

interface AutomationItemSidePanelProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemName: string
  listId: string
  listItemId: string
}

export const AutomationItemSidePanel = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  listId,
  listItemId,
}: AutomationItemSidePanelProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState<string | null>(null)

  // Fetch item details when panel opens
  const { data, isLoading, isError } = useQuery({
    ...getAutomationItemQueryOptions(itemId),
    enabled: isOpen,
  })

  const item = data?.automationItem

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'badge-success'
      case 'FAILED':
        return 'badge-error'
      case 'WARNING':
        return 'badge-warning'
      case 'SKIPPED':
        return 'badge-ghost'
      default:
        return 'badge-info'
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} aria-label="Close side panel" />}

      {/* Side Panel */}
      <div
        className={twMerge(
          'bg-base-100 fixed right-0 top-0 z-50 flex h-full w-[560px] max-w-full flex-col border-l shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`${t('automations.itemDetail.title')} - ${itemName}`}
      >
        {/* Header */}
        <div className="border-base-300 flex shrink-0 items-center justify-between border-b p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold" title={itemName}>
              {itemName}
            </h3>
            <Link
              to="/lists/$listId"
              params={{ listId }}
              search={{ selectedItemId: listItemId }}
              className="link link-primary text-base-content/60 text-sm"
            >
              {t('automations.itemDetail.viewInList')}
            </Link>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close panel">
            <CrossIcon className="size-5" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-md" />
              <span className="ml-2">{t('automations.itemDetail.loading')}</span>
            </div>
          ) : isError || !item ? (
            <div className="text-error py-8 text-center">{t('automations.itemDetail.notFound')}</div>
          ) : (
            <>
              {/* Status Section */}
              <section aria-label={t('automations.itemDetail.status')}>
                <h4 className="mb-2 font-semibold">{t('automations.itemDetail.status')}</h4>
                <div className="bg-base-200 flex items-center gap-4 rounded-lg p-3">
                  <div>
                    <span className="text-base-content/60 text-sm">{t('automations.itemStatus')}:</span>
                    <span className={`badge badge-sm ml-2 ${getStatusBadgeClass(item.status)}`}>{item.status}</span>
                  </div>
                  <div>
                    <span className="text-base-content/60 text-sm">{t('automations.itemInScope')}:</span>
                    <input
                      type="checkbox"
                      checked={item.inScope}
                      className={`checkbox checkbox-xs ml-2 ${item.inScope ? 'checkbox-success' : 'checkbox-warning'}`}
                      readOnly
                    />
                  </div>
                </div>
              </section>

              {/* Last Executed Section */}
              {item.lastExecutedAt && (
                <section aria-label={t('automations.itemDetail.lastExecuted')}>
                  <h4 className="mb-2 font-semibold">{t('automations.itemDetail.lastExecuted')}</h4>
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-base-content">
                      <ClientDate date={item.lastExecutedAt} />
                    </p>
                  </div>
                </section>
              )}

              {/* Preview Values Section */}
              <section aria-label={t('automations.itemDetail.previewValues')}>
                <h4 className="mb-2 font-semibold">{t('automations.itemDetail.previewValues')}</h4>
                {item.preview.length > 0 ? (
                  <div className="space-y-2">
                    {item.preview.map((p) => (
                      <div key={p.targetField} className="bg-base-200 rounded-lg p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-base-content/60 text-sm font-medium">{p.targetField}</span>
                          {p.transformedValue && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleCopy(p.transformedValue || '', p.targetField)}
                              aria-label={t('automations.itemDetail.copy')}
                            >
                              <CopyIcon className="size-3" />
                              {copied === p.targetField
                                ? t('automations.itemDetail.copied')
                                : t('automations.itemDetail.copy')}
                            </button>
                          )}
                        </div>
                        <div className="bg-base-300 max-h-60 overflow-y-auto rounded p-2">
                          {p.transformedValue ? (
                            <pre className="text-base-content/80 whitespace-pre-wrap text-xs">{p.transformedValue}</pre>
                          ) : (
                            <span className="text-base-content/50 italic">—</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-base-content/50 italic">{t('automations.itemDetail.noPreviewValues')}</p>
                  </div>
                )}
              </section>

              {/* Execution History Section */}
              <section aria-label={t('automations.itemDetail.executionHistory')}>
                <h4 className="mb-2 font-semibold">{t('automations.itemDetail.executionHistory')}</h4>
                {item.executions.length > 0 ? (
                  <div className="space-y-3">
                    {item.executions.map((execution) => (
                      <div key={execution.id} className="bg-base-200 rounded-lg p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`badge badge-sm ${getStatusBadgeClass(execution.status)}`}>
                            {execution.status}
                          </span>
                          <span className="text-base-content/60 text-xs">
                            <ClientDate date={execution.startedAt} />
                          </span>
                        </div>

                        {/* Input */}
                        <div className="mb-2">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-base-content/60 text-xs font-medium">
                              {t('automations.itemDetail.input')}
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleCopy(execution.inputJson, `input-${execution.id}`)}
                              aria-label={t('automations.itemDetail.copy')}
                            >
                              <CopyIcon className="size-3" />
                              {copied === `input-${execution.id}`
                                ? t('automations.itemDetail.copied')
                                : t('automations.itemDetail.copy')}
                            </button>
                          </div>
                          <div className="bg-base-300 max-h-32 overflow-y-auto rounded p-2">
                            <pre className="text-base-content/80 whitespace-pre-wrap text-xs">
                              {JSON.stringify(JSON.parse(execution.inputJson), null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* Output */}
                        {execution.outputJson && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-base-content/60 text-xs font-medium">
                                {t('automations.itemDetail.output')}
                              </span>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleCopy(execution.outputJson || '', `output-${execution.id}`)}
                                aria-label={t('automations.itemDetail.copy')}
                              >
                                <CopyIcon className="size-3" />
                                {copied === `output-${execution.id}`
                                  ? t('automations.itemDetail.copied')
                                  : t('automations.itemDetail.copy')}
                              </button>
                            </div>
                            <div className="bg-base-300 max-h-32 overflow-y-auto rounded p-2">
                              <pre className="text-base-content/80 whitespace-pre-wrap text-xs">
                                {JSON.stringify(JSON.parse(execution.outputJson), null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {execution.finishedAt && (
                          <div className="text-base-content/50 mt-2 text-right text-xs">
                            {t('automations.itemDetail.duration')}:{' '}
                            {Math.round(
                              (new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime()) /
                                1000,
                            )}
                            s
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-base-content/50 italic">{t('automations.itemDetail.noExecutions')}</p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}
