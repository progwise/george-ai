import React, { useEffect } from 'react'

import { graphql } from '../../../gql'
import { AiLibraryFileInfo_CaptionCardFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { FileInfoBox } from './file-info-box'
import { FileInfoFiles } from './file-info-files'
import { FileStatusLabels } from './file-status-labels'
import { useFileActions } from './use-file-actions'

graphql(`
  fragment AiLibraryFileInfo_CaptionCard on AiLibraryFile {
    ...AiLibraryFile_FileStatusLabels
    ...AiLibraryFileInfo_Files
    ...AiLibraryFile_InfoBox
    id
    libraryId
    name
    originUri
  }
`)

interface FileCaptionCardProps {
  file: AiLibraryFileInfo_CaptionCardFragment
}

export const FileCaptionCard = ({ file }: FileCaptionCardProps) => {
  const { t } = useTranslation()
  const { createEmbeddingTasksMutation, createExtractionTasksMutation, createTasksMutationPending } = useFileActions({
    fileId: file.id,
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

  return (
    <div className="bg-base-100 flex flex-col">
      <div className="">
        <a
          className="text-base-content/50 text-nowrap align-text-top text-xs italic hover:underline"
          href={file.originUri || '#'}
          target="_blank"
        >
          {file.originUri}
        </a>
      </div>
      <div className="flex justify-between align-top">
        <div className="flex-start flex flex-col gap-1 overflow-y-auto">
          <h3 className="text-base-content text-xl font-bold">{file.name}</h3>
          <FileStatusLabels file={file} />
        </div>
        <div className="flex flex-col flex-nowrap gap-2 self-start">
          <ul className="menu menu-xs menu-horizontal bg-base-200 rounded-box items-center shadow-lg">
            <li>
              <button
                type="button"
                className="btn btn-xs rounded-full"
                onClick={() => createEmbeddingTasksMutation()}
                disabled={createTasksMutationPending}
              >
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
              <button
                type="button"
                className="btn btn-xs rounded-full"
                onClick={() => createExtractionTasksMutation()}
                disabled={createTasksMutationPending}
              >
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
            <li>
              <details>
                <summary>
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

                  <span>Info</span>
                </summary>
                <ul className="right-0">
                  <li className="z-50">
                    <div>
                      <FileInfoBox file={file} />
                    </div>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>
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
                  <span>Files</span>
                </summary>
                <ul className="right-0">
                  <li className="z-50">
                    <FileInfoFiles file={file} />
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
