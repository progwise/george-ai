import React from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { FileIcon } from '../../icons/file-icon'

interface FileUploadProgressListProps {
  selectedFiles: File[]
  uploadProgress: Map<string, number>
  fileIdMap: Map<string, string>
  handleCancelUpload: (fileName: string) => void
}

export const FileUploadProgressList: React.FC<FileUploadProgressListProps> = ({
  selectedFiles,
  uploadProgress,
  fileIdMap,
  handleCancelUpload,
}) => {
  const { t } = useTranslation()
  return (
    <ul className="space-y-2">
      {selectedFiles.map((file) => {
        const fileId = fileIdMap.get(file.name) || file.name
        const progress = uploadProgress.get(fileId)
        const fileSize =
          file.size >= 1000000 ? (file.size / 1000000).toFixed(1) + ' MB' : (file.size / 1000).toFixed(1) + ' KB'

        return (
          <li key={file.name} className="flex items-center justify-between gap-2 text-info-content">
            <div className="flex w-1/2 items-center gap-2">
              <FileIcon />
              <span className="truncate">{file.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-info-content">
              <span>{fileSize}</span>
              {progress === -1 ? (
                <span className="text-error">{t('actions.cancelled')}</span>
              ) : progress === 100 ? (
                <span className="text-success">{t('actions.uploaded')}</span>
              ) : (
                // Progress Bar
                <div className="relative h-2 w-20 rounded bg-base-200">
                  <div
                    className="absolute h-2 rounded bg-info duration-200"
                    style={{
                      width: `${progress || 0}%`,
                    }}
                  ></div>
                </div>
              )}
            </div>
            {progress !== -1 && progress !== 100 && (
              <button
                type="button"
                className="btn btn-square btn-ghost btn-xs"
                onClick={() => handleCancelUpload(file.name)}
              >
                <CrossIcon />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
