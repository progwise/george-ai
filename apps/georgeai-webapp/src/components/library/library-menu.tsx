import { Link, useParams, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { LibraryMenu_AiLibrariesFragment, LibraryMenu_AiLibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ListPlusIcon } from '../../icons/list-plus-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { NewLibraryDialog } from './new-library-dialog'
import { useLibraryActions } from './use-library-actions'

graphql(`
  fragment LibraryMenu_AiLibrary on AiLibrary {
    id
    name
    filesCount
    ownerId
  }
`)

graphql(`
  fragment LibraryMenu_AiLibraries on AiLibrary {
    id
    name
  }
`)

interface LibraryMenuProps {
  library: LibraryMenu_AiLibraryFragment
  selectableLibraries: LibraryMenu_AiLibrariesFragment[]
}

export const LibraryMenu = ({ library, selectableLibraries }: LibraryMenuProps) => {
  const newLibraryDialogRef = useRef<HTMLDialogElement | null>(null)
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const librarySelectorDetailsRef = useRef<HTMLDetailsElement | null>(null)
  const params = useParams({ strict: false })
  const { t } = useTranslation()
  const { user } = useRouteContext({ strict: false })

  const { deleteLibrary, isPending } = useLibraryActions(library.id)

  useEffect(() => {
    if (!librarySelectorDetailsRef.current) return
    librarySelectorDetailsRef.current.open = false
  }, [library.id])

  useEffect(() => {
    if (!deleteDialogRef.current) return
    const handleMouseDown = (e: MouseEvent) => {
      if (librarySelectorDetailsRef.current && !librarySelectorDetailsRef.current.contains(e.target as Node)) {
        librarySelectorDetailsRef.current.open = false
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  if (!user) return null
  return (
    <div>
      <ul className="menu menu-horizontal w-full rounded-box">
        <li>
          <span className="menu-title text-xl font-semibold text-nowrap text-primary/50">{t('libraries.title')}</span>
        </li>
        <li>
          <details ref={librarySelectorDetailsRef} className="z-40">
            <summary className="min-w-68 rounded-2xl border border-base-content/30 text-xl font-semibold text-nowrap text-primary">
              {library.name}
            </summary>
            <ul className="min-w-68 rounded-box bg-base-200 p-2 shadow-lg">
              {selectableLibraries.map((library) => (
                <li key={library.id}>
                  <Link
                    to={
                      params.crawlerId
                        ? '/libraries/$libraryId/crawlers'
                        : params.fileId
                          ? '/libraries/$libraryId/files'
                          : '.'
                    }
                    className="text-nowrap"
                    params={{ libraryId: library.id }}
                    activeProps={{ className: 'font-bold' }}
                  >
                    {library.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li className="grow items-end">
          <button
            type="button"
            onClick={() => newLibraryDialogRef.current?.showModal()}
            className="btn btn-ghost btn-sm btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            title={t('libraries.addNewButton')}
            data-tip={t('libraries.addNew')}
          >
            <ListPlusIcon className="size-5" />
            <span className="max-lg:hidden">{t('libraries.addNewButton')}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-error max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            onClick={() => deleteDialogRef.current?.showModal()}
            disabled={isPending}
            title={t('libraries.deleteLibraryButton')}
            data-tip={t('libraries.deleteLibrary', { name: library.name })}
          >
            <TrashIcon className="size-4" />
            <span className="max-lg:hidden">{t('libraries.deleteLibraryButton')}</span>
          </button>
        </li>
      </ul>
      <NewLibraryDialog ref={newLibraryDialogRef} />
      <DialogForm
        ref={deleteDialogRef}
        title={t('libraries.deleteLibrary', { libraryName: library.name })}
        description={t('libraries.deleteLibraryConfirmation', {
          libraryName: library.name,
          fileCount: library.filesCount,
        })}
        onSubmit={() => {
          deleteLibrary()
        }}
        submitButtonText={t('actions.delete')}
        disabledSubmit={isPending}
      />
    </div>
  )
}
