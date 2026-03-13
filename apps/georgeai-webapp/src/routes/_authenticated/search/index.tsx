import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { getFilesQueryOptions, getLibrariesQueryOptions } from '../../../components/library/queries'
import { getListsQueryOptions } from '../../../components/lists/queries'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CrossIcon } from '../../../icons/cross-icon'
import { FileIcon } from '../../../icons/file-icon'
import { LibraryIcon } from '../../../icons/library-icon'
import { ListViewIcon } from '../../../icons/list-view-icon'
import { SearchIcon } from '../../../icons/search-icon'

const RouteComponent = () => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const { data: libraries } = useSuspenseQuery(getLibrariesQueryOptions())
  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())

  const filesQueries = useSuspenseQueries({
    queries: libraries.items
      .filter((lib) => lib.filesCount > 0)
      .map((lib) => getFilesQueryOptions({ libraryId: lib.id, skip: 0, take: lib.filesCount })),
  })

  const librariesWithFiles = (() => {
    const filteredLibs = libraries.items.filter((lib) => lib.filesCount > 0)
    const filesMap = new Map(filteredLibs.map((lib, index) => [lib.id, filesQueries[index]?.data?.items ?? []]))
    return libraries.items.map((lib) => ({
      ...lib,
      files: filesMap.get(lib.id) ?? [],
    }))
  })()

  const filtered = {
    libraries: librariesWithFiles
      .map((lib) => {
        const libMatches = lib.name.toLowerCase().includes(query.toLowerCase())
        return {
          ...lib,
          libMatches,
          files: libMatches
            ? lib.files
            : lib.files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase())),
        }
      })
      .filter((lib) => lib.name.toLowerCase().includes(query.toLowerCase()) || lib.files.length > 0),

    lists: aiLists.filter((list) => list.name.toLowerCase().includes(query.toLowerCase())),
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col overflow-hidden">
      <div className="mx-auto flex w-full flex-col items-center">
        <h1 className="mr-auto px-3 pt-5 pb-7 text-2xl font-medium not-md:hidden" title={t('search.title')}>
          {t('search.title')}
        </h1>
        <label className="input h-12 w-full gap-5 rounded-4xl border-gray-400 text-lg outline-none">
          <SearchIcon className="size-5.5" />
          <input
            id="search"
            autoFocus
            type="search"
            aria-label={t('search.label')}
            value={query}
            placeholder={t('search.placeholder')}
            onChange={(e) => setQuery(e.target.value)}
            className="[&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" className="btn btn-circle btn-ghost" onClick={() => setQuery('')}>
              <CrossIcon className="size-6" />
            </button>
          )}
        </label>
      </div>

      <div className="mx-auto mt-4 min-h-0 w-full flex-1 overflow-y-auto">
        {filtered.libraries.map((lib) => (
          <div key={lib.id}>
            {lib.libMatches && (
              <Link
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-300"
                to="/libraries/$libraryId"
                params={{ libraryId: lib.id }}
              >
                <LibraryIcon className="text-primary" />
                <span>{lib.name}</span>
              </Link>
            )}

            {lib.files.map((file) => (
              <Link
                className="flex flex-col rounded-lg p-2 hover:bg-base-300"
                key={file.id}
                to="/libraries/$libraryId/files/$fileId"
                params={{ libraryId: lib.id, fileId: file.id }}
              >
                <div className="flex items-center gap-2">
                  <FileIcon />
                  {file.name}
                </div>
                <span className="pl-6 text-sm text-base-content/50">{lib.name}</span>
              </Link>
            ))}
          </div>
        ))}

        {filtered.lists.map((list) => (
          <Link
            key={list.id}
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-300"
            to="/lists/$listId"
            params={{ listId: list.id }}
          >
            <ListViewIcon className="text-accent" />
            <div className="flex flex-1 justify-between">
              <div>{list.name}</div>
              <div> </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: RouteComponent,
})
