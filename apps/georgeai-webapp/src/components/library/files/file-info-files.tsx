import { useQuery } from '@tanstack/react-query'

import { graphql } from '../../../gql'
import { FileInfo_FilesFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getBackendPublicUrlQueryOptions } from '../../../queries'

graphql(`
  fragment FileInfo_Files on AiLibraryFile {
    id
    libraryId
    name
    manifest {
      version
      sourceHash
      extractions {
        extractionMethod
        sourceHash
        created
        updated
      }
    }
  }
`)

interface FileInfoFilesMenuProps {
  file: FileInfo_FilesFragment
}

export const FileInfoFilesMenu = ({ file }: FileInfoFilesMenuProps) => {
  const { t } = useTranslation()

  const { data: backendPublicUrl, isLoading } = useQuery(getBackendPublicUrlQueryOptions())

  // Show loading skeleton while fetching workspaces
  if (isLoading) {
    return <div className="h-9 w-32 skeleton" />
  }

  if (!backendPublicUrl) {
    return <div className="text-error">{t('errors.unableToFetchFile')}</div>
  }

  const fileUrl = new URL(`${backendPublicUrl}/library-files/${file.libraryId}/${file.id}`)
  const fileName = file.name || 'unknown'
  return (
    <div className="text-base-content/60">
      <ul className="menu w-full menu-xs rounded-box">
        <li>
          {file.manifest ? (
            <a href={`${fileUrl}`} className="link wrap-break-word link-hover" download={fileName}>
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              {fileName}
            </a>
          ) : (
            <span className="text-warning">{t('errors.uploadedFileIsMissing')}</span>
          )}
        </li>
        <li>
          <details>
            <summary>
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
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
              Markdown Extractions
            </summary>
          </details>
        </li>
        <li>
          <details>
            <summary>
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
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
              Screenshots & Images
            </summary>
            <ul>
              {file.manifest?.extractions.map((extraction) => (
                <li key={extraction.extractionMethod}>
                  <a
                    className="link wrap-break-word link-hover"
                    href={`${fileUrl}?extractionMethod=${extraction.extractionMethod}`}
                    download
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
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    {extraction.extractionMethod + 'md'}
                  </a>
                  {/* TODO: List attachments if any */}
                </li>
              ))}
            </ul>
          </details>
        </li>
      </ul>
    </div>
  )
}
