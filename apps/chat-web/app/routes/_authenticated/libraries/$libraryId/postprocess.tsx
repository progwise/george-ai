import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'

import { getLibraryQueryOptions } from '../../../../components/library/get-library'
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
}

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { data: aiLibrary } = useSuspenseQuery(getLibraryQueryOptions(libraryId))
  const { t } = useTranslation()

  // Temporary state - will be replaced with GraphQL data
  const [postprocessItems, setPostprocessItems] = useState<PostprocessItem[]>([
    { id: '1', name: 'Summary', prompt: 'Provide a brief summary of this document' },
    { id: '2', name: 'Key Points', prompt: 'Extract the main key points from this content' },
    { id: '3', name: '', prompt: '' }, // Always have one empty row
  ])

  // Auto-save function (placeholder for GraphQL mutation)
  const saveItem = useCallback(async (item: PostprocessItem) => {
    // TODO: Replace with GraphQL mutation
    console.log('Auto-saving item:', item)
    // await savePostprocessItem({ libraryId, ...item })
  }, [libraryId])

  // Auto-delete function (placeholder for GraphQL mutation)
  const deleteItem = useCallback(async (id: string) => {
    // TODO: Replace with GraphQL mutation
    console.log('Auto-deleting item:', id)
    // await deletePostprocessItem({ id })
  }, [])

  const handleItemChange = useCallback((id: string, field: 'name' | 'prompt', value: string) => {
    setPostprocessItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }, [])

  const handleItemBlur = useCallback((id: string) => {
    const item = postprocessItems.find(i => i.id === id)
    if (!item) return

    // If both name and prompt are filled, save and ensure there's an empty row
    if (item.name.trim() && item.prompt.trim()) {
      saveItem(item)
      
      // Add new empty row if this was the last item and it's now filled
      const isLastItem = postprocessItems[postprocessItems.length - 1].id === id
      if (isLastItem) {
        setPostprocessItems(prev => [
          ...prev,
          { id: Date.now().toString(), name: '', prompt: '' }
        ])
      }
    }
    // If both name and prompt are empty and it's not the only empty item, remove it
    else if (!item.name.trim() && !item.prompt.trim()) {
      const emptyItems = postprocessItems.filter(i => !i.name.trim() && !i.prompt.trim())
      if (emptyItems.length > 1) {
        setPostprocessItems(prev => prev.filter(i => i.id !== id))
        deleteItem(id)
      }
    }
  }, [postprocessItems, saveItem, deleteItem])

  // Debounced auto-save for items with content
  useEffect(() => {
    const timer = setTimeout(() => {
      postprocessItems.forEach(item => {
        if (item.name.trim() && item.prompt.trim()) {
          saveItem(item)
        }
      })
    }, 1000) // Auto-save after 1 second of no changes

    return () => clearTimeout(timer)
  }, [postprocessItems, saveItem])

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('labels.postprocess')}</h2>

      <div className="space-y-3">
        {postprocessItems.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 gap-3 rounded-lg border p-4 lg:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('labels.name')}</span>
                {item.name.trim() && item.prompt.trim() && (
                  <span className="label-text-alt text-success">✓ Saved</span>
                )}
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                onBlur={() => handleItemBlur(item.id)}
                className="input input-bordered"
                placeholder="Enter name..."
                required
              />
            </div>
            <div className="form-control lg:row-span-2">
              <label className="label">
                <span className="label-text">{t('labels.prompt')}</span>
              </label>
              <textarea
                value={item.prompt}
                onChange={(e) => handleItemChange(item.id, 'prompt', e.target.value)}
                onBlur={() => handleItemBlur(item.id)}
                className="textarea textarea-bordered h-24 lg:h-full"
                placeholder="Enter your prompt..."
                required
              />
            </div>
          </div>
        ))}

        {postprocessItems.length === 1 && !postprocessItems[0].name && !postprocessItems[0].prompt && (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('texts.enterNameAndPrompt')}</p>
          </div>
        )}
      </div>
    </div>
  )
}