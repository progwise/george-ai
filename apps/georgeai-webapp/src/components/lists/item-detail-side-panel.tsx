import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CopyIcon } from '../../icons/copy-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { FormattedMarkdown } from '../formatted-markdown'
import { getItemDetailQueryOptions } from './queries/get-item-detail'

interface ItemDetailSidePanelProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemName: string
  fileName: string
  libraryId: string
  fileId: string
}

export const ItemDetailSidePanel = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  fileName,
  libraryId,
  fileId,
}: ItemDetailSidePanelProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState<string | null>(null)

  // Fetch item details when panel opens
  const { data, isLoading } = useQuery({
    ...getItemDetailQueryOptions(itemId),
    enabled: isOpen,
  })

  const item = data?.aiListItem

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

  // Parse metadata JSON if available
  const metadata = item?.metadata ? JSON.parse(item.metadata) : null
  // Parse extraction input/output if available
  const extractionInput = item?.extraction?.extractionInput ? JSON.parse(item.extraction.extractionInput) : null
  const extractionOutput = item?.extraction?.extractionOutput ? JSON.parse(item.extraction.extractionOutput) : null

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} aria-label="Close side panel" />}

      {/* Side Panel */}
      <div
        className={twMerge(
          'fixed top-0 right-0 z-50 flex h-full w-[560px] max-w-full flex-col border-l bg-base-100 shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`${t('lists.itemDetail.title')} - ${itemName}`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-base-300 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold" title={itemName}>
              {itemName}
            </h3>
            <Link
              to="/libraries/$libraryId/files/$fileId"
              params={{ libraryId, fileId }}
              className="link truncate text-sm link-primary text-base-content/60"
              title={fileName}
            >
              {fileName}
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
              <span className="loading loading-md loading-spinner" />
              <span className="ml-2">{t('lists.itemDetail.loading')}</span>
            </div>
          ) : (
            <>
              {/* Item Name Section */}
              <section aria-label={t('lists.itemDetail.itemName')}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold">{t('lists.itemDetail.itemName')}</h4>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleCopy(itemName, 'itemName')}
                    aria-label={t('lists.itemDetail.copy')}
                  >
                    <CopyIcon className="size-3" />
                    {copied === 'itemName' ? t('lists.itemDetail.copied') : t('lists.itemDetail.copy')}
                  </button>
                </div>
                <div className="rounded-lg bg-base-200 p-3">
                  <p className="font-mono text-base-content">{itemName}</p>
                </div>
              </section>

              {/* Extraction Index */}
              {item?.extractionIndex !== null && item?.extractionIndex !== undefined && (
                <section aria-label={t('lists.itemDetail.extractionIndex')}>
                  <h4 className="mb-2 font-semibold">{t('lists.itemDetail.extractionIndex')}</h4>
                  <div className="rounded-lg bg-base-200 p-3">
                    <p className="font-mono text-base-content">{item.extractionIndex}</p>
                  </div>
                </section>
              )}

              {/* Content Section */}
              <section aria-label={t('lists.itemDetail.content')}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold">{t('lists.itemDetail.content')}</h4>
                  {item?.content && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleCopy(item.content || '', 'content')}
                      aria-label={t('lists.itemDetail.copy')}
                    >
                      <CopyIcon className="size-3" />
                      {copied === 'content' ? t('lists.itemDetail.copied') : t('lists.itemDetail.copy')}
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto rounded-lg bg-base-200 p-3">
                  {item?.content ? (
                    <div className="prose prose-sm max-w-none">
                      <FormattedMarkdown markdown={item.content} />
                    </div>
                  ) : (
                    <p className="text-base-content/50 italic">{t('lists.itemDetail.noContent')}</p>
                  )}
                </div>
              </section>

              {/* Metadata Section */}
              {metadata && Object.keys(metadata).length > 0 && (
                <section aria-label={t('lists.itemDetail.metadata')}>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold">{t('lists.itemDetail.metadata')}</h4>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleCopy(JSON.stringify(metadata, null, 2), 'metadata')}
                      aria-label={t('lists.itemDetail.copy')}
                    >
                      <CopyIcon className="size-3" />
                      {copied === 'metadata' ? t('lists.itemDetail.copied') : t('lists.itemDetail.copy')}
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-lg bg-base-200 p-3">
                    <pre className="text-xs whitespace-pre-wrap text-base-content/80">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </div>
                </section>
              )}

              {/* Extraction Details Section */}
              {(extractionInput || extractionOutput) && (
                <section aria-label={t('lists.itemDetail.extraction')}>
                  <h4 className="mb-2 font-semibold">{t('lists.itemDetail.extraction')}</h4>

                  {/* Extraction Input */}
                  {extractionInput && (
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between">
                        <h5 className="text-sm font-medium text-base-content/70">
                          {t('lists.itemDetail.extractionInput')}
                        </h5>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleCopy(JSON.stringify(extractionInput, null, 2), 'extractionInput')}
                          aria-label={t('lists.itemDetail.copy')}
                        >
                          <CopyIcon className="size-3" />
                          {copied === 'extractionInput' ? t('lists.itemDetail.copied') : t('lists.itemDetail.copy')}
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto rounded-lg bg-base-200 p-3">
                        <pre className="text-xs whitespace-pre-wrap text-base-content/80">
                          {JSON.stringify(extractionInput, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Extraction Output */}
                  {extractionOutput && (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <h5 className="text-sm font-medium text-base-content/70">
                          {t('lists.itemDetail.extractionOutput')}
                        </h5>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleCopy(JSON.stringify(extractionOutput, null, 2), 'extractionOutput')}
                          aria-label={t('lists.itemDetail.copy')}
                        >
                          <CopyIcon className="size-3" />
                          {copied === 'extractionOutput' ? t('lists.itemDetail.copied') : t('lists.itemDetail.copy')}
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto rounded-lg bg-base-200 p-3">
                        <pre className="text-xs whitespace-pre-wrap text-base-content/80">
                          {JSON.stringify(extractionOutput, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* No extraction details message */}
              {!extractionInput && !extractionOutput && !metadata && (
                <section aria-label={t('lists.itemDetail.extraction')}>
                  <h4 className="mb-2 font-semibold">{t('lists.itemDetail.extraction')}</h4>
                  <div className="rounded-lg bg-base-200 p-3">
                    <p className="text-base-content/50 italic">{t('lists.itemDetail.noExtraction')}</p>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
