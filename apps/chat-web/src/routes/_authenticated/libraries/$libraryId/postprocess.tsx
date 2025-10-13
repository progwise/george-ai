import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'

import { getLibraryQueryOptions } from '../../../../components/library/queries/get-library'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/postprocess')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))
  },
})

interface PostprocessItem {
  id: string
  name: string
  prompt: string
  filePattern: string // regex pattern for matching file paths (originUri)
  llmModel: string // Selected LLM model
}

// Mock file data - replace with actual GraphQL query
const mockLibraryFiles = [
  { originUri: '/documents/report.pdf' },
  { originUri: '/documents/summary.docx' },
  { originUri: '/spreadsheets/data.xlsx' },
  { originUri: '/presentations/demo.pptx' },
  { originUri: '/notes/meeting.txt' },
  { originUri: '/docs/readme.md' },
]

// Mock available Ollama models - replace with actual GraphQL query
const mockOllamaModels = [
  { id: 'llama3.2', name: 'Llama 3.2', description: 'Latest Llama model' },
  { id: 'llama3.1', name: 'Llama 3.1', description: 'Previous Llama version' },
  { id: 'mistral', name: 'Mistral 7B', description: 'Fast and efficient' },
  { id: 'mixtral', name: 'Mixtral 8x7B', description: 'Mixture of experts' },
  { id: 'qwen2.5', name: 'Qwen 2.5', description: 'Alibaba model' },
  { id: 'gemma2', name: 'Gemma 2', description: 'Google model' },
  { id: 'phi3', name: 'Phi-3', description: 'Microsoft small model' },
]

function RouteComponent() {
  const { libraryId } = Route.useParams()
  useSuspenseQuery(getLibraryQueryOptions(libraryId))
  const { t } = useTranslation()

  // Temporary state - will be replaced with GraphQL data
  const [postprocessItems, setPostprocessItems] = useState<PostprocessItem[]>([
    {
      id: '1',
      name: 'Summary',
      prompt: 'Provide a brief summary of this document',
      filePattern: '.*',
      llmModel: 'llama3.2',
    },
    {
      id: '2',
      name: 'Key Points',
      prompt: 'Extract the main key points from this content',
      filePattern: '.*\\.pdf$',
      llmModel: 'mistral',
    },
    { id: '3', name: '', prompt: '', filePattern: '.*', llmModel: 'llama3.2' }, // Always have one empty row
  ])

  // Auto-save function (placeholder for GraphQL mutation)
  const saveItem = useCallback(async (item: PostprocessItem) => {
    // TODO: Replace with GraphQL mutation
    console.log('Auto-saving item:', item)
    // await savePostprocessItem({ libraryId, ...item })
  }, [])

  // Auto-delete function (placeholder for GraphQL mutation)
  const deleteItem = useCallback(async (id: string) => {
    // TODO: Replace with GraphQL mutation
    console.log('Auto-deleting item:', id)
    // await deletePostprocessItem({ id })
  }, [])

  const handleItemChange = useCallback(
    (id: string, field: 'name' | 'prompt' | 'filePattern' | 'llmModel', value: string) => {
      setPostprocessItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    },
    [],
  )

  // Check for duplicate names
  const getDuplicateNames = useCallback(() => {
    const names = postprocessItems.filter((item) => item.name.trim()).map((item) => item.name.trim().toLowerCase())

    const duplicates = new Set<string>()
    const seen = new Set<string>()

    names.forEach((name) => {
      if (seen.has(name)) {
        duplicates.add(name)
      }
      seen.add(name)
    })

    return duplicates
  }, [postprocessItems])

  const handleItemBlur = useCallback(
    (id: string) => {
      const item = postprocessItems.find((i) => i.id === id)
      if (!item) return

      // If both name and prompt are filled, save and ensure there's an empty row
      if (item.name.trim() && item.prompt.trim()) {
        saveItem(item)

        // Add new empty row if this was the last item and it's now filled
        const isLastItem = postprocessItems[postprocessItems.length - 1].id === id
        if (isLastItem) {
          setPostprocessItems((prev) => [
            ...prev,
            { id: Date.now().toString(), name: '', prompt: '', filePattern: '.*', llmModel: 'llama3.2' },
          ])
        }
      }
      // If both name and prompt are empty and it's not the only empty item, remove it
      else if (!item.name.trim() && !item.prompt.trim()) {
        const emptyItems = postprocessItems.filter((i) => !i.name.trim() && !i.prompt.trim())
        if (emptyItems.length > 1) {
          setPostprocessItems((prev) => prev.filter((i) => i.id !== id))
          deleteItem(id)
        }
      }
    },
    [postprocessItems, saveItem, deleteItem],
  )

  // Debounced auto-save for items with content
  useEffect(() => {
    const timer = setTimeout(() => {
      postprocessItems.forEach((item) => {
        if (item.name.trim() && item.prompt.trim()) {
          saveItem(item)
        }
      })
    }, 1000) // Auto-save after 1 second of no changes

    return () => clearTimeout(timer)
  }, [postprocessItems, saveItem])

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold">{t('labels.postprocess')}</h2>
        <p className="text-base-content/70">
          Define custom prompts to automatically process your documents. Each prompt will be applied to new documents
          added to this library.
        </p>
      </div>

      <div className="space-y-4">
        {postprocessItems.map((item) => {
          const duplicateNames = getDuplicateNames()
          const isDuplicateName = item.name.trim() && duplicateNames.has(item.name.trim().toLowerCase())
          const isCompleted = item.name.trim() && item.prompt.trim() && !isDuplicateName
          const isEmpty = !item.name.trim() && !item.prompt.trim()

          // Validate regex pattern and count matching files
          let isValidPattern = true
          let patternError = ''
          let matchingFileCount = 0

          try {
            if (item.filePattern) {
              const regex = new RegExp(item.filePattern)
              // Count files that match the pattern (using mock data for now)
              matchingFileCount = mockLibraryFiles.filter((file) => regex.test(file.originUri)).length
            }
          } catch {
            isValidPattern = false
            patternError = 'Invalid regex pattern'
          }

          const getPatternDisplay = (pattern: string) => {
            if (!pattern || pattern === '.*') return 'All paths'
            if (pattern === '.*\\.pdf$') return 'PDF files'
            if (pattern === '.*\\.docx?$') return 'Word documents'
            if (pattern === '.*\\.(xlsx?|csv)$') return 'Spreadsheets'
            if (pattern === '^/documents/.*') return 'Files in /documents'
            if (pattern === '^/[^/]+\\.pdf$') return 'PDFs in root'
            return pattern
          }

          return (
            <div
              key={item.id}
              className={`card bg-base-100 shadow-xl transition-all duration-200 ${
                isCompleted ? 'ring-success/20 ring-2' : isEmpty ? 'opacity-60' : ''
              }`}
            >
              <div className="card-body p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  {/* Left Column: Name, Model, and Pattern - narrower on lg screens */}
                  <div className="space-y-4 lg:col-span-5">
                    {/* Name Input */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">{t('labels.name')}</span>
                        {isDuplicateName ? (
                          <span className="badge badge-error badge-sm">Name must be unique</span>
                        ) : isCompleted ? (
                          <span className="badge badge-success badge-sm gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-3 w-3"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Saved
                          </span>
                        ) : null}
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        onBlur={() => handleItemBlur(item.id)}
                        className={`input input-bordered w-full ${
                          isDuplicateName ? 'input-error' : isCompleted ? 'input-success' : ''
                        }`}
                        placeholder="e.g., Summary, Key Points, Action Items..."
                      />
                    </div>

                    {/* LLM Model Select */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">LLM Model</span>
                        <span className="label-text-alt">Ollama</span>
                      </label>
                      <select
                        value={item.llmModel}
                        onChange={(e) => handleItemChange(item.id, 'llmModel', e.target.value)}
                        onBlur={() => handleItemBlur(item.id)}
                        className={`select select-bordered w-full ${isCompleted ? 'select-success' : ''}`}
                      >
                        {mockOllamaModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} - {model.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* File Path Pattern Input */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">File Path Pattern</span>
                        {!isValidPattern ? (
                          <span className="label-text-alt text-error">{patternError}</span>
                        ) : isValidPattern && item.filePattern ? (
                          <span className="badge badge-ghost badge-sm">{matchingFileCount} files</span>
                        ) : null}
                      </label>
                      <div className="join w-full">
                        <input
                          type="text"
                          value={item.filePattern}
                          onChange={(e) => handleItemChange(item.id, 'filePattern', e.target.value)}
                          onBlur={() => handleItemBlur(item.id)}
                          className={`input input-bordered join-item flex-1 ${
                            !isValidPattern ? 'input-error' : isCompleted ? 'input-success' : ''
                          }`}
                          placeholder=".*"
                          title="Regular expression for matching file paths (originUri)"
                        />
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-square join-item">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </label>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu rounded-box bg-base-100 z-10 w-52 p-2 shadow"
                          >
                            <li>
                              <button type="button" onClick={() => handleItemChange(item.id, 'filePattern', '.*')}>
                                All files
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => handleItemChange(item.id, 'filePattern', '.*\\.pdf$')}
                              >
                                PDF files only
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => handleItemChange(item.id, 'filePattern', '.*\\.docx?$')}
                              >
                                Word documents
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => handleItemChange(item.id, 'filePattern', '.*\\.(xlsx?|csv)$')}
                              >
                                Spreadsheets
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => handleItemChange(item.id, 'filePattern', '^/documents/.*')}
                              >
                                Files in /documents
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => handleItemChange(item.id, 'filePattern', '^/sharepoint/.*\\.pdf$')}
                              >
                                PDFs from SharePoint
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <label className="label">
                        <span className="label-text-alt">{getPatternDisplay(item.filePattern)}</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Prompt Only - wider on lg screens */}
                  <div className="form-control h-full lg:col-span-7">
                    <label className="label">
                      <span className="label-text font-semibold">{t('labels.prompt')}</span>
                      <span className="label-text-alt">{item.prompt.length}/500</span>
                    </label>
                    <textarea
                      value={item.prompt}
                      onChange={(e) => handleItemChange(item.id, 'prompt', e.target.value)}
                      onBlur={() => handleItemBlur(item.id)}
                      onFocus={(e) => {
                        // Move cursor to end of text when focusing
                        const length = e.target.value.length
                        e.target.setSelectionRange(length, length)
                      }}
                      className={`textarea textarea-bordered h-32 w-full resize-none lg:h-48 ${
                        isCompleted ? 'textarea-success' : ''
                      }`}
                      placeholder="Enter the prompt that will be applied to documents..."
                      maxLength={500}
                    />
                  </div>
                </div>

                {/* Statistics Section - Show for completed items */}
                {isCompleted && isValidPattern && (
                  <div className="bg-base-200 mt-4 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-base-content/60 text-xs font-semibold uppercase tracking-wide">
                            Status
                          </span>
                          <p className="mt-1 flex items-center gap-2">
                            <span className="badge badge-success badge-sm">Active</span>
                            <span className="text-base-content/70">Ready to process</span>
                          </p>
                        </div>
                        <div className="divider divider-horizontal"></div>
                        <div className="text-sm">
                          <span className="text-base-content/60 text-xs font-semibold uppercase tracking-wide">
                            Model
                          </span>
                          <p className="mt-1">
                            <span className="font-semibold">
                              {mockOllamaModels.find((m) => m.id === item.llmModel)?.name || item.llmModel}
                            </span>
                          </p>
                        </div>
                        <div className="divider divider-horizontal"></div>
                        <div className="text-sm">
                          <span className="text-base-content/60 text-xs font-semibold uppercase tracking-wide">
                            Applies to
                          </span>
                          <p className="mt-1">
                            <span className="font-semibold">{matchingFileCount}</span>
                            <span className="text-base-content/70"> file{matchingFileCount !== 1 ? 's' : ''}</span>
                          </p>
                        </div>
                      </div>
                      {matchingFileCount === 0 && (
                        <div className="text-warning text-xs">⚠️ Pattern doesn't match any existing files</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {postprocessItems.length === 1 && !postprocessItems[0].name && !postprocessItems[0].prompt && (
          <div className="hero bg-base-200 min-h-[200px] rounded-lg">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="text-base-content/40 mx-auto h-12 w-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-bold">{t('texts.noPostprocessItems')}</h3>
                <p className="text-base-content/70 mt-2 text-sm">{t('texts.enterNameAndPrompt')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-sm">
            Changes are saved automatically. Empty items will be removed when you navigate away.
          </span>
        </div>
      </div>
    </div>
  )
}
