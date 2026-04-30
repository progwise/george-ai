import { Link } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { ExtractionMethod } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CheckBadgeIcon } from '../../../icons/check-badge-icon'
import { GearIcon } from '../../../icons/gear-icon'
import { RefreshIcon } from '../../../icons/refresh-icon'
import { ReprocessIcon } from '../../../icons/reprocess-icon'
import { ClientDate } from '../../client-date'
import { Popout } from '../../popout'
import { useDocumentActions } from './use-document-actions'

interface ExtractionSelectorProps {
  documentId: string
  libraryId: string
  extractions: Array<{
    extractionMethod: ExtractionMethod
    sourceHash: string | null
    created: string
    updated?: string | null
  }>
  sourceHash?: string | null
  selectedExtractionMethod?: ExtractionMethod
  availableExtractionMethods: ExtractionMethod[]
}

export const ExtractionSelector = ({
  documentId,
  libraryId,
  extractions,
  sourceHash,
  selectedExtractionMethod,
  availableExtractionMethods,
}: ExtractionSelectorProps) => {
  const { t } = useTranslation()
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const { triggerExtraction, isPending } = useDocumentActions({ documentId, libraryId })

  const { options, selectedOption } = useMemo(() => {
    const methodsSet = new Set([...availableExtractionMethods, ...extractions.map((e) => e.extractionMethod)])
    if (selectedExtractionMethod) {
      methodsSet.add(selectedExtractionMethod)
    }
    const options = [...methodsSet].map((method) => {
      const extraction = extractions.find((e) => e.extractionMethod === method)
      const availableMethod = availableExtractionMethods.includes(method)
      return {
        title: t(`extractionMethods.${method}`),
        extractionMethod: method,
        created: extraction?.created,
        updated: extraction?.updated,
        status: !availableMethod
          ? ('not-available' as const)
          : !extraction
            ? ('not-extracted' as const)
            : !extraction.sourceHash || !sourceHash
              ? ('unknown-source' as const)
              : extraction.sourceHash === sourceHash
                ? ('up-to-date' as const)
                : ('outdated' as const),
      }
    })
    let selectedOption = options.find((option) => option.extractionMethod === selectedExtractionMethod)
    if (!selectedOption && options.length > 0) {
      selectedOption = options[0]
    }
    if (!selectedOption) {
      throw new Error(`Selected extraction method ${selectedExtractionMethod} not found in options`)
    }
    return { options, selectedOption }
  }, [availableExtractionMethods, extractions, t, sourceHash, selectedExtractionMethod])

  const statusMap = {
    'not-extracted': { text: 'Not Extracted', color: 'text-base-content/40' },
    'unknown-source': { text: 'Unknown Source', color: 'text-warning' },
    'up-to-date': { text: 'Up to Date', color: 'text-success' },
    outdated: { text: 'Outdated', color: 'text-error' },
    'not-available': { text: 'Not Available', color: 'text-base-content/30' },
  }
  return (
    <Popout
      icon={<CheckBadgeIcon className={twMerge('size-4', statusMap[selectedOption.status].color)} />}
      buttonLabel={selectedOption.title}
    >
      <ul className="list mt-2 rounded-box bg-base-100 p-2 shadow-md">
        {options.map((option) => (
          <li
            key={`${option.extractionMethod}}`}
            className={twMerge(
              'list-row cursor-default rounded-box hover:bg-base-300',
              option.extractionMethod === selectedOption.extractionMethod ? 'bg-base-300' : '',
            )}
          >
            <div>
              <Link
                className="btn btn-square btn-ghost"
                to="/libraries/$libraryId/files/$fileId"
                search={{ extractionMethod: option.extractionMethod }}
                params={{ libraryId, fileId: documentId }}
                onClick={() => detailsRef.current?.removeAttribute('open')}
              >
                <CheckBadgeIcon className={twMerge('inline size-6', statusMap[option.status].color)}></CheckBadgeIcon>
              </Link>
            </div>
            <div>
              <div>
                <Link
                  className="link link-hover"
                  to="/libraries/$libraryId/files/$fileId"
                  search={{ extractionMethod: option.extractionMethod }}
                  params={{ libraryId, fileId: documentId }}
                  onClick={() => detailsRef.current?.removeAttribute('open')}
                >
                  {option.title}
                  <span className={`badge badge-sm ${statusMap[option.status].color}`}>
                    {statusMap[option.status].text}
                  </span>
                </Link>
              </div>
              <div className="text-xs font-semibold uppercase opacity-60">
                <GearIcon className="inline size-4" />: <ClientDate date={option.created} />
                {option.updated && (
                  <>
                    <br />
                    <RefreshIcon className="inline size-4" />: <ClientDate date={option.updated} />
                  </>
                )}
              </div>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-square btn-ghost"
                onClick={() => triggerExtraction({ extractionMethod: option.extractionMethod })}
                disabled={isPending || option.status === 'not-available'}
              >
                <ReprocessIcon className="inline size-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Popout>
  )
}
