import { useQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { InferenceDriver } from '../../gql/graphql'
import { ChevronDownIcon } from '../../icons/chevron-down-icon'
import { OllamaLogoIcon } from '../../icons/ollama-logo-icon'
import { OpenAILogoIcon } from '../../icons/openai-logo-icon'
import { getInferenceModelsQueryOptions } from './get-inference-models'

export interface ModelSelectInferenceModel {
  modelName: string
  modelDriver: InferenceDriver
}

interface ModelSelectProps {
  value: ModelSelectInferenceModel | undefined | null
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
  name: string
  placeholder?: string
  capability?: 'chat' | 'embedding' | 'vision'
  errors?: string[]
  selectedModelRef?: React.RefObject<ModelSelectInferenceModel | null>
}

const getProviderIcon = (provider?: InferenceDriver) => {
  if (provider === 'ollama') return <OllamaLogoIcon className="size-4" />
  if (provider === 'openai') return <OpenAILogoIcon className="size-4" />
  return null
}

const DEFAULT_LIMIT = 5

export const ModelSelect = ({
  value,
  className,
  disabled,
  required,
  label,
  name,
  placeholder,
  capability,
  errors,
  selectedModelRef,
}: ModelSelectProps) => {
  const id = useId()
  const popoverRef = useRef<HTMLDivElement>(null)

  const { user } = useRouteContext({ from: '/_authenticated' })
  const [selectedItem, setSelectedItem] = useState<ModelSelectInferenceModel | null>(value || null)
  const [searchTerm, setSearchTerm] = useState('')
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedItem(value || null)
    }, 100)
    return () => clearTimeout(timeout)
  }, [value])

  useEffect(() => {
    if (!selectedModelRef) return
    selectedModelRef.current = selectedItem
  }, [selectedItem, selectedModelRef])

  const {
    data: models,
    isLoading,
    isFetching,
  } = useQuery(
    getInferenceModelsQueryOptions({
      workspaceId: user.selectedWorkspaceId,
      limit,
      search: searchTerm || undefined,
      canDoChatCompletion: capability === 'chat' ? true : undefined,
      canDoEmbedding: capability === 'embedding' ? true : undefined,
      canDoVision: capability === 'vision' ? true : undefined,
    }),
  )

  const selectedItemId = useMemo(() => {
    if (!selectedItem) return ''
    return `${selectedItem.modelDriver}-${selectedItem.modelName}`
  }, [selectedItem])

  const hasError = useMemo(() => errors && errors.length > 0, [errors])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleModelSelect = (model: ModelSelectInferenceModel) => {
    if (popoverRef.current) {
      popoverRef.current.hidePopover()
    }
    setSelectedItem(model)
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  const hasMore = useMemo(() => {
    if (!models) return false
    return models.count > limit
  }, [models, limit])

  return (
    <fieldset className={twMerge('group fieldset flex', className)}>
      {label && (
        <legend className="fieldset-legend flex w-full justify-between">
          <label
            className={twMerge(
              'cursor-pointer group-has-aria-invalid:text-error',
              disabled && 'cursor-default text-base-content/50',
            )}
            onClick={() => {
              if (!disabled && detailsRef.current) {
                detailsRef.current.open = !detailsRef.current.open
              }
            }}
          >
            {label}
          </label>

          <span className="text-error">{errors?.join(', ')}</span>
          {required && <span className="text-error">*</span>}
        </legend>
      )}

      <input type="hidden" name={name} value={selectedItemId} />

      <button
        type="button"
        aria-label={`${label || 'Model'}: ${selectedItem?.modelName || 'Not selected'}`}
        className={twMerge(
          'btn flex flex-row flex-nowrap items-center gap-2 btn-ghost transition-all select-none',
          disabled && 'text-base-content/50',
          hasError && 'border-error',
          disabled && 'pointer-events-none',
        )}
        popoverTarget={`popover-${id}`}
        style={{ anchorName: `--info-anchor-${id}` }}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedItem ? (
            <>
              {getProviderIcon(selectedItem.modelDriver)}
              <span className="truncate">{selectedItem.modelName}</span>
            </>
          ) : (
            <span className="text-base-content/50">{placeholder || 'Select model...'}</span>
          )}
        </div>
        <ChevronDownIcon className="size-4 shrink-0" />
      </button>

      <div
        style={
          {
            positionAnchor: `--info-anchor-${id}`,
            '--p-top': 'anchor(bottom)',
            '--p-left': 'anchor(left)',
          } as React.CSSProperties
        }
        className={twMerge(
          'fixed inset-auto inset-x-4 bottom-4 z-1 m-0 bg-base-100',
          'w-auto max-w-xl',
          'rounded-box p-2 shadow-xl',
          'backdrop:bg-black/20 backdrop:transition-opacity',
          'sm:inset-x-auto sm:top-(--p-top)',
          'sm:bottom-auto sm:left-(--p-left)',
        )}
        popover="auto"
        id={`popover-${id}`}
        ref={popoverRef}
      >
        <div className="flex shrink-0 items-center gap-2 bg-base-200 p-2">
          <div className="grow">
            <input
              type="text"
              placeholder="Search models..."
              className="input input-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setLimit(DEFAULT_LIMIT)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            {hasMore && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setLimit((prev) => prev + DEFAULT_LIMIT)
                }}
                disabled={isFetching || !hasMore}
              >
                {isFetching ? (
                  <span className="loading loading-xs loading-spinner" />
                ) : hasMore ? (
                  'Load more...'
                ) : (
                  'No more models'
                )}
              </button>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="px-2 py-4 text-center">
            <span className="loading loading-sm loading-spinner" />
          </div>
        ) : models?.count === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-base-content/50">No models found</div>
        ) : (
          <div className="flex flex-1 flex-wrap gap-3 overflow-y-auto p-2">
            {models?.models.map((model) => (
              <div key={`${model.modelDriver}-${model.modelName}`}>
                <button
                  type="button"
                  role="option"
                  aria-label={`${model.modelName} (${model.modelDriver})`}
                  aria-selected={
                    selectedItem?.modelDriver === model.modelDriver && selectedItem?.modelName === model.modelName
                  }
                  className={twMerge(
                    'btn flex items-center gap-2 btn-dash btn-xs',
                    selectedItem?.modelDriver === model.modelDriver &&
                      selectedItem?.modelName === model.modelName &&
                      'btn-active',
                  )}
                  onClick={() => handleModelSelect(model)}
                >
                  {getProviderIcon(model.modelDriver)}
                  <span className="truncate">{model.modelName}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </fieldset>
  )
}
