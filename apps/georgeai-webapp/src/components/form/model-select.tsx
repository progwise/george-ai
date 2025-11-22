import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ZodRawShape, z } from 'zod'

import { ChevronDownIcon } from '../../icons/chevron-down-icon'
import { OllamaLogoIcon } from '../../icons/ollama-logo-icon'
import { OpenAILogoIcon } from '../../icons/openai-logo-icon'
import { getLanguageModelsQueryOptions } from '../model/get-models'

export interface ModelSelectItem {
  id: string
  name: string
  provider?: string
}

interface ModelSelectProps<T extends ZodRawShape> {
  value: ModelSelectItem | undefined | null
  className?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  label?: string
  name: string
  schema?: z.ZodObject<T>
  placeholder?: string
  capability?: 'chat' | 'embedding' | 'vision'
}

const ITEMS_PER_PAGE = 20

const getProviderIcon = (provider?: string) => {
  if (provider === 'ollama') return <OllamaLogoIcon className="h-4 w-4" />
  if (provider === 'openai') return <OpenAILogoIcon className="h-4 w-4" />
  return null
}

export const ModelSelect = <T extends ZodRawShape>({
  value,
  className,
  disabled,
  readonly,
  required,
  label,
  name,
  schema,
  placeholder,
  capability,
}: ModelSelectProps<T>) => {
  const [selectedItem, setSelectedItem] = useState<ModelSelectItem | null>(value || null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const capabilityFilters = useMemo(
    () => ({
      ...(capability === 'chat' && { canDoChatCompletion: true }),
      ...(capability === 'embedding' && { canDoEmbedding: true }),
      ...(capability === 'vision' && { canDoVision: true }),
    }),
    [capability],
  )

  const { data, isLoading, isFetching } = useQuery(
    getLanguageModelsQueryOptions({
      skip: 0,
      take: page * ITEMS_PER_PAGE,
      search: searchTerm || undefined,
      ...capabilityFilters,
    }),
  )

  const models = data?.models ?? []
  const hasMore = models.length < (data?.count ?? 0)

  const errors = useMemo(() => {
    if (!schema || !selectedItem) return []
    const partialSchema = schema.partial()
    const parseResult = partialSchema.safeParse({ [name]: selectedItem.id })
    return parseResult.success ? [] : parseResult.error.errors.map((error) => error.message)
  }, [schema, name, selectedItem])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleModelSelect = (model: ModelSelectItem) => {
    setSelectedItem(model)
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  return (
    <fieldset className={twMerge('fieldset group', className)}>
      {label && (
        <legend className="fieldset-legend flex w-full justify-between">
          <label
            className={twMerge('group-has-aria-invalid:text-error', (disabled || readonly) && 'text-base-content/50')}
          >
            {label}
          </label>

          <span className="text-error">{errors.join(', ')}</span>
          {required && <span className="text-error">*</span>}
        </legend>
      )}

      <input type="hidden" name={name} value={selectedItem?.id || ''} />

      <details
        aria-description="Select language model"
        ref={detailsRef}
        className={twMerge('dropdown w-full', disabled && 'cursor-not-allowed opacity-50')}
      >
        <summary
          className={twMerge(
            'btn btn-outline/50 flex justify-between border bg-transparent font-normal',
            readonly && 'text-base-content/50',
            errors.length > 0 && 'border-error',
            (disabled || readonly) && 'pointer-events-none',
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedItem ? (
              <>
                {getProviderIcon(selectedItem.provider)}
                <span className="truncate">{selectedItem.name}</span>
              </>
            ) : (
              <span className="text-base-content/50">{placeholder || 'Select model...'}</span>
            )}
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </summary>

        <div className="dropdown-content fixed! bg-base-100 z-50 mr-4 flex max-h-96 shrink-0 flex-col shadow-md">
          <div className="bg-base-200 flex shrink-0 items-center gap-2 p-2">
            <div className="grow">
              <input
                type="text"
                placeholder="Search models..."
                className="input input-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              {hasMore && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setPage((p) => p + 1)
                  }}
                  disabled={isFetching}
                >
                  {isFetching ? <span className="loading loading-spinner loading-xs" /> : 'Load more...'}
                </button>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="px-2 py-4 text-center">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-base-content/50 px-2 py-4 text-center text-sm">No models found</div>
          ) : (
            <div className="flex flex-1 flex-wrap gap-3 overflow-y-auto p-2">
              {models.map((model) => (
                <div key={model.id}>
                  <button
                    type="button"
                    className={twMerge(
                      'btn btn-dash btn-xs flex items-center gap-2',
                      selectedItem?.id === model.id && 'btn-active',
                    )}
                    onClick={() => handleModelSelect(model)}
                  >
                    {getProviderIcon(model.provider)}
                    <span className="truncate">{model.name}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </fieldset>
  )
}
