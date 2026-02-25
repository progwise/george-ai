import { Link } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'

import { ExtractionMethod } from '@george-ai/app-commons'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { BoltIcon } from '../../../icons/bolt-icon'
import { toastSuccess } from '../../georgeToaster'
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

  const statusIcon = (status: 'not-extracted' | 'unknown-source' | 'up-to-date' | 'outdated' | 'not-available') => {
    if (!status) return null
    switch (status) {
      case 'not-extracted':
        return '⚪'
      case 'unknown-source':
        return '🟡'
      case 'up-to-date':
        return '🟢'
      case 'outdated':
        return '🔴'
      case 'not-available':
        return '⚫'
      default:
        return null
    }
  }

  return (
    <ul className="menu menu-horizontal m-0 items-center gap-2 p-0">
      <li
        className="tooltip tooltip-right menu-title text-base-content"
        data-tip="Extraction status: 🟢 Up-to-date, 🟡 Unknown source, 🔴 Outdated, ⚪ Not extracted, ⚫ Not available"
      >
        <span>{statusIcon(selectedOption.status)}</span>
      </li>
      <li>
        <details ref={detailsRef}>
          <summary>{selectedOption?.title || 'Select extraction'}</summary>
          <ul>
            {options.map((option) => (
              <li key={`${option.extractionMethod}}`}>
                <Link
                  to="/libraries/$libraryId/files/$fileId"
                  search={{ extractionMethod: option.extractionMethod }}
                  params={{ libraryId, fileId: documentId }}
                  className="text-nowrap"
                  onClick={() => detailsRef.current?.removeAttribute('open')}
                >
                  <span>{statusIcon(option.status)}</span>
                  {option.title}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </li>
      {selectedOption && (
        <li>
          <button
            type="button"
            onClick={() =>
              triggerExtraction(selectedOption.extractionMethod, {
                onSuccess: () =>
                  toastSuccess(
                    t('files.extractionTriggered', {
                      id: `extraction-triggered-${documentId}-${selectedOption.extractionMethod}`,
                    }),
                  ),
              })
            }
            disabled={isPending}
            data-tip={`Execute ${selectedOption.title}`}
            className="hover:text-accent"
          >
            <BoltIcon />
          </button>
        </li>
      )}
    </ul>
  )
}
