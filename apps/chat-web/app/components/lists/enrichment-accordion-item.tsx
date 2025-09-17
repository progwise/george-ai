import { Link } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { dateTimeString, duration } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { EnrichmentAccordionItem_EnrichmentFragment, EnrichmentStatus } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { JsonModal } from '../json-modal'

graphql(`
  fragment EnrichmentAccordionItem_Enrichment on AiEnrichmentTask {
    id
    listId
    fileId
    fieldId
    status
    priority
    requestedAt
    startedAt
    completedAt
    metadata
    error
    field {
      id
      name
    }
    file {
      id
      name
      library {
        id
        name
      }
    }
    list {
      id
      name
    }
  }
`)

interface EnrichmentAccordionItemProps {
  enrichment: EnrichmentAccordionItem_EnrichmentFragment
  index: number
}

export const EnrichmentAccordionItem = ({ enrichment, index }: EnrichmentAccordionItemProps) => {
  const { language } = useTranslation()
  const metadataModalRef = useRef<HTMLDialogElement>(null)
  return (
    <div className="collapse-arrow join-item border-base-300 collapse border">
      <input type="radio" name={`task-accordion-${enrichment.id}`} defaultChecked={index === 0} className="peer" />
      <div className="collapse-title peer-checked:bg-base-100 font-semibold opacity-40 peer-checked:opacity-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-nowrap">{`${enrichment.field.name}`}</span>
            <span className="text-neutral/50 text-nowrap text-xs">
              {dateTimeString(enrichment.requestedAt, language)}
            </span>
          </div>
          <div className="flex gap-2">
            <span
              className={twMerge(
                'badge badge-sm badge-outline',
                enrichment.status === EnrichmentStatus.Pending ? 'badge-warning' : '',
                enrichment.status === EnrichmentStatus.InProgress ? 'badge-info' : '',
                enrichment.status === EnrichmentStatus.Completed ? 'badge-success' : '',
                enrichment.status === EnrichmentStatus.Failed ? 'badge-error' : '',
                enrichment.status === EnrichmentStatus.Canceled ? 'badge-secondary' : '',
              )}
            >
              <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              <span className="text-base-content/80">{enrichment.status}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="collapse-content bg-base-100 text-sm">
        <div className="space-y-4 pt-2">
          {/* Core Information - Compact 4-column grid */}
          <div className="flex items-center justify-around gap-6 text-xs">
            <div>
              <span className="text-base-content/60">List:</span>
              <span>{enrichment.list.name}</span>
            </div>
            <div>
              <span className="text-base-content/60">Library:</span>
              <span>{enrichment.file.library.name}</span>
            </div>
            <div>
              <span className="text-base-content/60">File:</span>
              <Link
                to="/libraries/$libraryId/files/$fileId"
                params={{ libraryId: enrichment.file.library.id, fileId: enrichment.file.id }}
              >
                {enrichment.file.name}
              </Link>
            </div>
            <div>
              <span className="text-base-content/60">Total Duration:</span>{' '}
              {duration(enrichment.requestedAt, enrichment.completedAt)}
            </div>
            {enrichment.metadata && (
              <button
                type="button"
                className="btn btn-sm btn-circle tooltip"
                data-tip="Process Data"
                onClick={() => metadataModalRef.current?.showModal()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Process Timeline - 3-Phase Pipeline */}

          {/* Additional Data & Actions - Single row */}
        </div>
      </div>
      {/* Modals */}
      {enrichment.metadata && <JsonModal ref={metadataModalRef} title="Metadata" data={enrichment.metadata} />}
    </div>
  )
}
