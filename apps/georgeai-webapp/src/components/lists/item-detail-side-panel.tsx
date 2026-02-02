import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CopyIcon } from '../../icons/copy-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { getBackendPublicUrlQueryOptions } from '../../queries'
import { FormattedMarkdown } from '../formatted-markdown'
import { useMarkdownDownload } from '../library/files/use-markdown-download'
import { ResizableHandle } from '../resizable-handle'
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
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch item details when panel opens
  const { data: item, isLoading: isLoadingMeta } = useQuery({
    ...getItemDetailQueryOptions(itemId),
    enabled: isOpen,
  })

  const { data: backendPublicUrl } = useQuery(getBackendPublicUrlQueryOptions())

  // Fetch markdown content from backend
  const {
    content,
    isLoading: isLoadingContent,
    progress,
    error,
  } = useMarkdownDownload({
    url: backendPublicUrl && `${backendPublicUrl}/files/${libraryId}/${fileId}/items/${itemId}/content`,
  })

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

  const extraction = item?.extractionInfo

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} aria-label="Close side panel" />}

      {/* Side Panel */}
      <div
        ref={containerRef}
        className={twMerge(
          'fixed top-0 right-0 z-50 flex h-full w-140 max-w-full flex-col border-l bg-base-100 shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`${t('lists.itemDetail.title')} - ${itemName}`}
      >
        <ResizableHandle containerRef={containerRef} minSize={400} maxSize={window.innerWidth * 0.8}></ResizableHandle>
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
          {isLoadingMeta ? (
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

              {/* Extraction Method */}
              {extraction && (
                <section aria-label="Extraction Method">
                  <h4 className="mb-2 font-semibold">Extraction Method</h4>
                  <div className="rounded-lg bg-base-200 p-3">
                    <p className="font-mono text-base-content">{item.extractionMethod}</p>
                    {extraction.hasFragments && item?.fragment !== null && item?.fragment !== undefined && (
                      <p className="mt-1 text-sm text-base-content/60">
                        Part {item.fragment + 1} of {extraction.fragmentCount}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Extraction Index (fallback if no extraction info) */}
              {!extraction && !!item?.fragment && (
                <section aria-label={t('lists.itemDetail.extractionIndex')}>
                  <h4 className="mb-2 font-semibold">{t('lists.itemDetail.extractionIndex')}</h4>
                  <div className="rounded-lg bg-base-200 p-3">
                    <p className="font-mono text-base-content">{item?.fragment}</p>
                  </div>
                </section>
              )}

              {/* Chunk Count */}
              {item?.chunkCount !== null && item?.chunkCount !== undefined && (
                <section aria-label="Chunk Count">
                  <h4 className="mb-2 font-semibold">Chunk Count</h4>
                  <div className="rounded-lg bg-base-200 p-3">
                    <p className="font-mono text-base-content">{item.chunkCount.toLocaleString()}</p>
                  </div>
                </section>
              )}

              {/* Content Section */}
              <section aria-label={t('lists.itemDetail.content')}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold">{t('lists.itemDetail.content')}</h4>
                  {content && !isLoadingContent && !error && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleCopy(content, 'content')}
                      aria-label={t('lists.itemDetail.copy')}
                    >
                      <CopyIcon className="size-3" />
                      {copied === 'content' ? t('lists.itemDetail.copied') : t('lists.itemDetail.copy')}
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto rounded-lg bg-base-200 p-3">
                  {error ? (
                    <div className="alert alert-error">
                      <span>Error loading content: {error.message}</span>
                    </div>
                  ) : isLoadingContent ? (
                    <div className="flex items-center gap-4 py-4">
                      <div className="loading loading-sm loading-spinner"></div>
                      <div>Loading content... {progress > 0 && `${Math.round(progress)}%`}</div>
                    </div>
                  ) : content ? (
                    <div className="prose prose-sm max-w-none">
                      <FormattedMarkdown markdown={content} />
                    </div>
                  ) : (
                    <p className="text-base-content/50 italic">{t('lists.itemDetail.noContent')}</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}
