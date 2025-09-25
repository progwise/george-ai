import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { graphql } from '../../gql'
import { ListSourcesManager_ListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { getLibrariesQueryOptions } from '../library/get-libraries'
import { LoadingSpinner } from '../loading-spinner'
import { getListQueryOptions } from './queries'
import { addListSource, removeListSource } from './server-functions'

graphql(`
  fragment ListSourcesManager_List on AiList {
    id
    name
    sources {
      id
      libraryId
      library {
        id
        name
        owner {
          name
        }
      }
    }
  }
`)

interface ListSourcesManagerProps {
  list: ListSourcesManager_ListFragment
}

export const ListSourcesManager = ({ list }: ListSourcesManagerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedLibraryId, setSelectedLibraryId] = useState('')

  const {
    data: { aiLibraries },
  } = useSuspenseQuery(getLibrariesQueryOptions())

  const { mutate: addSource, isPending: isAddingSource } = useMutation({
    mutationFn: addListSource,
    onError: (error) => toastError(t('lists.sources.addError', { message: error.message })),
    onSuccess: () => {
      toastSuccess(t('lists.sources.addSuccess'))
      setSelectedLibraryId('')
      queryClient.invalidateQueries(getListQueryOptions(list.id))
    },
  })

  const { mutate: removeSource, isPending: isRemovingSource } = useMutation({
    mutationFn: removeListSource,
    onError: (error) => toastError(t('lists.sources.removeError', { message: error.message })),
    onSuccess: () => {
      toastSuccess(t('lists.sources.removeSuccess'))
      queryClient.invalidateQueries(getListQueryOptions(list.id))
    },
  })

  const handleAddSource = () => {
    if (selectedLibraryId) {
      addSource({ data: { listId: list.id, libraryId: selectedLibraryId } })
    }
  }

  const handleRemoveSource = (sourceId: string) => {
    removeSource({ data: sourceId })
  }

  // Get available libraries (not already added as sources)
  const availableLibraries = aiLibraries.filter(
    (library) => !list.sources.some((source) => source.libraryId === library.id),
  )

  const isPending = isAddingSource || isRemovingSource

  return (
    <div className="card bg-base-100 p-6 shadow-md">
      <LoadingSpinner isLoading={isPending} />

      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">{t('lists.sources.title')}</h3>
        <p className="text-base-content/70 text-sm">{t('lists.sources.description')}</p>
      </div>

      {/* Add new source */}
      <div className="mb-6">
        <h4 className="text-md mb-3 font-medium">{t('lists.sources.addLibrary')}</h4>
        <div className="flex gap-2">
          <select
            className="select select-bordered flex-1"
            value={selectedLibraryId}
            onChange={(e) => setSelectedLibraryId(e.target.value)}
            disabled={isPending}
          >
            <option value="">{t('lists.sources.selectLibrary')}</option>
            {availableLibraries.map((library) => (
              <option key={library.id} value={library.id}>
                {library.name} ({library.owner.name})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddSource}
            disabled={!selectedLibraryId || isPending}
          >
            {t('lists.sources.add')}
          </button>
        </div>
      </div>

      {/* Current sources */}
      <div>
        <h4 className="text-md mb-3 font-medium">
          {t('lists.sources.currentSources')} ({list.sources.length})
        </h4>

        {list.sources.length === 0 ? (
          <div className="text-base-content/70 py-4 text-sm">{t('lists.sources.noSources')}</div>
        ) : (
          <div className="space-y-2">
            {list.sources.map((source) => (
              <div key={source.id} className="border-base-300 flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{source.library?.name}</div>
                  <div className="text-base-content/70 text-sm">
                    {t('lists.sources.ownedBy')} {source.library?.owner.name}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-error btn-outline"
                  onClick={() => handleRemoveSource(source.id)}
                  disabled={isPending}
                >
                  {t('lists.sources.remove')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
