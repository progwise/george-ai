import { useEffect, useRef, useState } from 'react'

import { graphql } from '../../../gql'
import { FileMenu_FileFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { FileIcon } from '../../../icons/file-icon'
import { toastError, toastSuccess } from '../../georgeToaster'
import { Popout } from '../../popout'
import { logger } from '../common'
import { FileInfoBox } from './file-info-box'
import { FileInfoFilesMenu } from './file-info-files'
import { FileUploadProgressDialog, PreparedUploadFile } from './file-upload-progress-dialog'
import { useDocumentActions } from './use-document-actions'

graphql(`
  fragment FileMenu_File on AiLibraryFile {
    id
    libraryId
    name
    ...FileInfoBox_File
    ...FileInfo_Files
  }
`)

interface FileMenuProps {
  file: FileMenu_FileFragment
}

export const FileMenu = ({ file }: FileMenuProps) => {
  const libraryId = file.libraryId
  const documentId = file.id
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const uploadProgressDialogRef = useRef<HTMLDialogElement>(null)
  const [preparedUploadFile, setPreparedUploadFile] = useState<PreparedUploadFile | null>(null)

  const { t } = useTranslation()
  const { prepareSourceUpload, triggerExtraction, triggerVectorization, isPending } = useDocumentActions({
    libraryId,
    documentId,
  })

  useEffect(() => {
    const outsideClickHandler = (event: Event) => {
      if (!event.target || !(event.target instanceof Node)) return
      const target = event.target as HTMLElement
      document.querySelectorAll('.menu details').forEach((menu: HTMLDetailsElement) => {
        if (!menu.contains(target)) {
          // Click was outside the dropdown, close it
          menu.open = false
        }
      })
    }
    window.addEventListener('click', outsideClickHandler)
    return () => {
      window.removeEventListener('click', outsideClickHandler)
    }
  }, [])

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    if (files.length < 1) {
      return
    }

    const file = files[0]

    logger.info('File upload', file)

    prepareSourceUpload(
      {
        mimeType: file.type,
        name: file.name,
        originUri: `upload:${file.webkitRelativePath}:${file.name}`,
        size: file.size,
        modificationDate: new Date(file.lastModified),
      },
      {
        onSuccess: (preparedFile) => {
          setPreparedUploadFile({ ...preparedFile, blob: file })
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          toastError(`Error preparing upload ${errorMessage}`)
        },
      },
    )
  }
  const handleEmbed = () => {
    triggerVectorization(
      {},
      {
        onSuccess: () => toastSuccess('Embedding processing triggered successfully'),
      },
    )
  }
  const handleExtract = () => {
    triggerExtraction(
      {},
      {
        onSuccess: () => toastSuccess('Extraction processing triggered successfully'),
      },
    )
  }

  return (
    <div className="navbar rounded-box bg-base-100 shadow-sm">
      <div className="navbar-start lg:hidden lg:size-0">
        <Popout
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
          }
          buttonLabel="Files"
        >
          <FileInfoFilesMenu file={file} />
        </Popout>

        <Popout
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          }
          buttonLabel="Info"
        >
          <FileInfoBox file={file} />
        </Popout>
      </div>
      <div className="navbar-center hidden size-0 lg:flex lg:size-auto">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-primary"
          onClick={() => {
            fileInputRef.current?.click()
          }}
          disabled={isPending}
          data-tooltip={t('actions.upload')}
        >
          <FileIcon className="size-4" />
          <span>{t('actions.upload')}</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          style={{ display: 'none' }}
          disabled={isPending}
        />

        <Popout
          color="info"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          }
          buttonLabel="Info"
        >
          <FileInfoBox file={file} />
        </Popout>

        <button type="button" className="btn btn-ghost btn-sm btn-secondary" onClick={handleEmbed}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
          </svg>

          <span>{t('actions.reembed')}</span>
        </button>
        <button type="button" className="btn btn-ghost btn-sm btn-secondary" onClick={handleExtract}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>

          <span>{t('actions.reprocess')}</span>
        </button>
        <Popout
          color="info"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
          }
          buttonLabel="Files"
        >
          <FileInfoFilesMenu file={file} />
        </Popout>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-left">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden lg:size-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M 4 6 h 16 M 8 12 h 12 M 4 18 h 16"
              />{' '}
            </svg>
          </div>
          <ul tabIndex={-1} className="dropdown-content menu z-1 menu-sm rounded-box bg-base-100 p-2 shadow-sm">
            <li>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click()
                }}
                disabled={isPending}
                data-tooltip={t('actions.upload')}
              >
                <FileIcon className="size-5" />
                <span>{t('actions.upload')}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                style={{ display: 'none' }}
                disabled={isPending}
              />
            </li>
            <li>
              <button type="button" onClick={handleEmbed}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                  />
                </svg>

                <span>{t('actions.reembed')}</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={handleExtract}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>

                <span>{t('actions.reprocess')}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      {preparedUploadFile && (
        <FileUploadProgressDialog
          dialogRef={uploadProgressDialogRef}
          libraryId={libraryId}
          preparedUploadFiles={preparedUploadFile ? [preparedUploadFile] : []}
          onClose={() => setPreparedUploadFile(null)}
        />
      )}
    </div>
  )
}
