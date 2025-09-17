import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { dateTimeString, duration } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { EnrichmentAccordionItem_EnrichmentFragment, EnrichmentStatus } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'

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
          </div>

          {/* Process Timeline - 3-Phase Pipeline */}

          {/* Additional Data & Actions - Single row */}
        </div>
      </div>
    </div>
  )
}
