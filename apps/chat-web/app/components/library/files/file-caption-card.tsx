import { graphql } from '../../../gql'
import { AiLibraryFileInfo_CaptionCardFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { FileStatusLabels } from './file-status-labels'
import { useFileActions } from './use-file-actions'

graphql(`
  fragment AiLibraryFileInfo_CaptionCard on AiLibraryFile {
    ...AiLibraryFile_FileStatusLabels
    id
    libraryId
    name
    originUri
    originModificationDate
    size
    uploadedAt
    archivedAt
    taskCount
    status
    sourceFiles {
      fileName
      url
    }
    crawler {
      id
      uri
      uriType
    }
    lastSuccessfulExtraction {
      id
      createdAt
      markdownFileName
      extractionStartedAt
      extractionFinishedAt
      processingStatus
      metadata
    }
    lastSuccessfulEmbedding {
      id
      createdAt
      markdownFileName
      embeddingStartedAt
      embeddingFinishedAt
      processingStatus
      metadata
      chunksCount
    }
  }
`)

interface FileCaptionCardProps {
  file: AiLibraryFileInfo_CaptionCardFragment
}

export const FileCaptionCard = ({ file }: FileCaptionCardProps) => {
  const { t, language } = useTranslation()

  const { createEmbeddingTasksMutation, createExtractionTasksMutation, createTasksMutationPending } = useFileActions({
    fileId: file.id,
  })
  return (
    <div className="card bg-base-100 gap-2 p-2 shadow-xl">
      <div className="card-title flex items-center justify-between">
        <h3>{file.name}</h3>
        <ul className="menu bg-base-200 menu-horizontal menu-xs rounded-box gap-2">
          <li>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => createEmbeddingTasksMutation()}
              disabled={createTasksMutationPending}
            >
              {t('actions.reembed')}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => createExtractionTasksMutation()}
              disabled={createTasksMutationPending}
            >
              {t('actions.reprocess')}
            </button>
          </li>
        </ul>
      </div>
      <div className="flex justify-between">
        <dl className="properties max-w-100 text-xs">
          <dt>{t('labels.size')}</dt>
          <dd>{file.size} bytes</dd>
          <dt>{t('labels.status')}</dt>
          <dd>{file.status}</dd>
          <dt>{t('labels.chunks')}</dt>
          <dd>{file.lastSuccessfulEmbedding?.chunksCount || 'unknown'}</dd>
          <dt>{t('labels.tasks')}</dt>
          <dd>{file.taskCount}</dd>
          <dt>{t('labels.crawler')}</dt>
          <dd>{file.crawler ? `${file.crawler.uri} (${file.crawler.uriType})` : '-'}</dd>
          <dt>{t('labels.originModified')}</dt>
          <dd>{file.originModificationDate ? new Date(file.originModificationDate).toLocaleString(language) : '-'}</dd>
        </dl>
        <div className="h-48 overflow-scroll">
          <ul className="menu menu-xs bg-base-200 rounded-box w-xs shadow-lg">
            <li>
              <a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                {file.name}
              </a>
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
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                    />
                  </svg>
                  Markdown Extractions
                </summary>
                <ul>
                  {file.sourceFiles
                    .filter((file) => file.fileName.endsWith('.md'))
                    .map((source) => (
                      <li key={source.fileName}>
                        <a className="link link-hover" href={source.url} target="_blank">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                          </svg>
                          {source.fileName}
                        </a>
                      </li>
                    ))}
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
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-4 w-4"
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
                  {file.sourceFiles
                    .filter(
                      (file) =>
                        file.fileName.endsWith('.png') ||
                        file.fileName.endsWith('.jpg') ||
                        file.fileName.endsWith('.jpeg'),
                    )
                    .map((source) => (
                      <li key={source.fileName}>
                        <a className="link link-hover" href={source.url} target="_blank">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                          </svg>
                          {source.fileName}
                        </a>
                      </li>
                    ))}

                  {Array.from({ length: 20 }).map((_, i) => (
                    <li key={i}>
                      <a className="link link-hover" href={''} target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        File {i}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
      <div className="">
        <FileStatusLabels file={file} />
      </div>
    </div>
  )
}
