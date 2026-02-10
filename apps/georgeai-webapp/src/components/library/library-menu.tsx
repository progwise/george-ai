import { useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { LibraryMenu_AiLibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
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
}

export const LibraryMenu = ({ library }: LibraryMenuProps) => {
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)
  const librarySelectorDetailsRef = useRef<HTMLDetailsElement | null>(null)
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
