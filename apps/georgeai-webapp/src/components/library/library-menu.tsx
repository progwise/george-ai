import { useRouteContext } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { LibraryMenu_AiLibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ClipboardIcon } from '../../icons/clipboard-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { toastSuccess } from '../georgeToaster'
import { useLibraryActions } from './use-library-actions'

graphql(`
  fragment LibraryMenu_AiLibrary on AiLibrary {
    id
    name
    filesCount
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

  const copyLibraryLink = useCallback(async () => {
    const path = `/libraries/${library.id}`
    const fullUrl = `${window.location.origin}${path}`

    try {
      await navigator.clipboard.writeText(fullUrl)
      const popoverElement = document.getElementById('popoverLibraryMenu')
      if (popoverElement) {
        popoverElement.hidePopover()
      }

      toastSuccess(t('sidebar.copyItemLinkSuccess'))
    } catch (err) {
      console.error('Failed to copy the link:', err)
    }
  }, [library.id, t])

  if (!user) return null
  return (
    <>
      <button
        popoverTarget="popoverLibraryMenu"
        tabIndex={0}
        type="button"
        className={'btn btn-circle bg-base-300 btn-xs'}
        style={{ anchorName: 'anchorLibraryMenu' } as React.CSSProperties}
      >
        <span className="size-3">…</span>
      </button>

      <ul
        className="dropdown rounded-xl bg-base-200 p-1.5 shadow-sm"
        popover="auto"
        id="popoverLibraryMenu"
        style={
          {
            positionAnchor: 'anchorLibraryMenu',
            transition: 'none',
            top: 'calc(anchor(bottom) + 3px)',
            left: 'calc(anchor(left) - 12px)',
          } as React.CSSProperties
        }
      >
        <li>
          <button
            type="button"
            onClick={copyLibraryLink}
            className="btn w-full justify-start rounded-lg border-none px-3 py-1.5 font-medium btn-ghost hover:bg-base-100"
          >
            <ClipboardIcon />
            {t('sidebar.copyItemLink')}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              deleteDialogRef.current?.showModal()
            }}
            disabled={isPending}
            className="btn w-full justify-start rounded-lg px-3 py-1.5 font-medium text-error btn-ghost hover:bg-error/20"
          >
            <TrashIcon />
            {t('sidebar.deleteItem')}
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
        submitButtonText={t('Menu.delete')}
        disabledSubmit={isPending}
      />
    </>
  )
}
