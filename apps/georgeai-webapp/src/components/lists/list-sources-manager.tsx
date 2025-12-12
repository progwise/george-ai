import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { graphql } from '../../gql'
import { ListSourcesManager_ListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { GearIcon } from '../../icons/gear-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { getLibrariesQueryOptions } from '../library/queries/get-libraries'
import { LoadingSpinner } from '../loading-spinner'
import { ExtractionStrategyModal } from './extraction-strategy-modal'
import { getListQueryOptions } from './queries'
import { addListSource, removeListSource } from './server-functions'

graphql(`
  fragment ListSourcesManager_List on AiList {
    id
    name
    sources {
      id
      libraryId
      extractionStrategy
      extractionConfig
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
  const [configureSourceId, setConfigureSourceId] = useState<string | null>(null)

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
    <div className="flex flex-col gap-2">
      <LoadingSpinner isLoading={isPending} />

      {/* Add Source Section */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold tracking-wide text-base-content/60 uppercase">
          {t('lists.sources.addLibrary')}
        </h3>
        <p className="mb-4 text-sm text-base-content/70">{t('lists.sources.description')}</p>

        <div className="flex gap-2">
          <select
            className="select flex-1"
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
            className="btn btn-sm btn-primary"
            onClick={handleAddSource}
            disabled={!selectedLibraryId || isPending}
          >
            {t('lists.sources.add')}
          </button>
        </div>
      </div>

      {/* Current Sources Section */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-base-content/60 uppercase">
            {t('lists.sources.currentSources')}
          </h3>
          <span className="badge badge-lg badge-primary">{list.sources.length}</span>
        </div>

        {list.sources.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-base-300 bg-base-200/30 p-8 text-center">
            <div className="text-sm font-medium text-base-content/60">{t('lists.sources.noSources')}</div>
            <div className="mt-1 text-xs text-base-content/50">Use the section above to add a library as a source</div>
          </div>
        ) : (
          <div className="space-y-3">
            {list.sources.map((source) => (
              <div
                key={source.id}
                className="group rounded-lg border-2 border-primary/20 bg-linear-to-r from-primary/5 to-transparent p-5 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{source.library?.name}</span>
                      <span className="badge badge-sm badge-success">Active</span>
                    </div>
                    <div className="mt-1 text-sm text-base-content/70">
                      Owner: <span className="font-medium">{source.library?.owner.name}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-base-content/60 uppercase">
                        Extraction:
                      </span>
                      <span className="badge badge-outline">
                        {t(`lists.sources.strategies.${source.extractionStrategy || 'per_file'}`)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      className="btn gap-2 btn-sm btn-primary"
                      onClick={() => setConfigureSourceId(source.id)}
                      disabled={isPending}
                    >
                      <GearIcon className="size-4" />
                      {t('lists.sources.configureExtraction')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-error"
                      onClick={() => handleRemoveSource(source.id)}
                      disabled={isPending}
                    >
                      {t('lists.sources.remove')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extraction Strategy Configuration Modal */}
      {configureSourceId && (
        <ExtractionStrategyModal
          listId={list.id}
          source={list.sources.find((s) => s.id === configureSourceId)!}
          onClose={() => setConfigureSourceId(null)}
          onSuccess={() => {
            setConfigureSourceId(null)
            queryClient.invalidateQueries(getListQueryOptions(list.id))
          }}
        />
      )}
    </div>
  )
}
