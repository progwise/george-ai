import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'
import { ZodRawShape, z } from 'zod'

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
  onBlur?: (selectedItem: ModelSelectItem | null) => void
  placeholder?: string
  capability?: 'chat' | 'embedding' | 'vision'
}

const ITEMS_PER_PAGE = 20

export const ModelSelect = <T extends ZodRawShape>({
  value,
  onBlur,
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
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<ModelSelectItem | null>(value || null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  // Build capability filters based on prop
  const capabilityFilters = {
    ...(capability === 'chat' && { canDoChatCompletion: true }),
    ...(capability === 'embedding' && { canDoEmbedding: true }),
    ...(capability === 'vision' && { canDoVision: true }),
  }

  // Query for models with search and pagination
  const { data, isLoading, isFetching } = useQuery(
    getLanguageModelsQueryOptions({
      skip: 0,
      take: page * ITEMS_PER_PAGE,
      search: searchTerm || undefined,
      ...capabilityFilters,
    }),
  )

  const models = data?.models ?? []
  const totalCount = data?.count ?? 0
  const hasMore = models.length < totalCount

  const validate = (newValue: string | null | undefined) => {
    if (!schema) return
    const partialSchema = schema.partial()
    const parseResult = partialSchema.safeParse({ [name]: newValue })
    if (!parseResult.success) {
      setErrors(parseResult.error.errors.map((error) => error.message))
    } else {
      setErrors([])
    }
  }

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }

  const toggleDropdown = () => {
    if (disabled || readonly) return
    if (!isOpen) {
      updateDropdownPosition()
    }
    setIsOpen(!isOpen)
  }

  const handleChange = (selectedOption: ModelSelectItem | null) => {
    const newValue = selectedOption?.id || ''
    setSelectedItem(selectedOption)
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = newValue
    }
    validate(newValue)
    onBlur?.(selectedOption)
    setSearchTerm('')
    setPage(1)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
        setPage(1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (isOpen && searchInputRef.current) {
      timeoutId = setTimeout(() => searchInputRef.current?.focus(), 0)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isOpen])

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return

    const handleUpdate = () => updateDropdownPosition()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isOpen])

  const getProviderIcon = (provider?: string) => {
    if (provider === 'ollama') return <OllamaLogoIcon className="h-4 w-4" />
    if (provider === 'openai') return <OpenAILogoIcon className="h-4 w-4" />
    return null
  }

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="bg-base-100 z-9999 absolute rounded-lg shadow-lg"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        minWidth: `${dropdownPosition.width}px`,
      }}
    >
      {/* Search Input */}
      <div className="border-base-300 sticky top-0 bg-inherit p-2">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setPage(1)
          }}
          className="input input-sm w-full"
          placeholder="Search models..."
        />
      </div>

      {/* Model List */}
      <ul className="menu max-h-96 overflow-auto p-0">
        {isLoading ? (
          <li className="p-4 text-center">
            <span className="loading loading-spinner loading-sm" />
          </li>
        ) : models.length === 0 ? (
          <li className="text-base-content/60 p-4 text-center text-sm">No models found</li>
        ) : (
          models.map((model) => (
            <li key={model.id}>
              <button
                type="button"
                onClick={() => handleChange(model)}
                className={twMerge('flex items-center gap-2', selectedItem?.id === model.id && 'active')}
              >
                {getProviderIcon(model.provider)}
                <span className="flex-1 truncate">{model.name}</span>
                {selectedItem?.id === model.id && (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <li>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={isFetching}
              className="text-center text-sm font-medium disabled:opacity-50"
            >
              {isFetching ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                `Load more (${models.length} of ${totalCount})`
              )}
            </button>
          </li>
        )}
      </ul>
    </div>
  )

  return (
    <>
      <fieldset className={twMerge('fieldset group', className)}>
        <legend className="fieldset-legend flex w-full justify-between">
          <span
            className={twMerge('group-has-aria-invalid:text-error', (disabled || readonly) && 'text-base-content/50')}
          >
            {label}
            {required && <span className="text-error"> *</span>}
          </span>
          <span className="text-error">{errors.join(', ')}</span>
        </legend>

        <input type="hidden" name={name} ref={hiddenInputRef} value={selectedItem?.id || ''} />

        {/* Dropdown Button */}
        <div
          ref={buttonRef}
          onClick={toggleDropdown}
          className={twMerge(
            'input flex w-full cursor-pointer items-center justify-between',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className="flex flex-1 items-center gap-2 truncate">
            {selectedItem ? (
              <>
                {getProviderIcon(selectedItem.provider)}
                <span className="truncate">{selectedItem.name}</span>
              </>
            ) : (
              <span className="text-base-content/50 truncate">{placeholder}</span>
            )}
          </span>
          <svg
            className="text-base-content/50 size-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </fieldset>

      {/* Render dropdown in portal */}
      {typeof document !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  )
}
