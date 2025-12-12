import { useEffect, useRef, useState } from 'react'

import { formatBytes } from '@george-ai/web-utils'

import { useNow } from '../../../hooks/use-now'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CrossIcon } from '../../../icons/cross-icon'
import { FileIcon } from '../../../icons/file-icon'
import { toastError } from '../../georgeToaster'
import { useFileActions } from './use-file-actions'

export type PreparedUploadFile = {
  fileId: string
  fileName: string
  uploadUrl: string
  headers: { name: string; value: string }[]
  blob: Blob
}

export interface FileUploadProgressDialogProps {
  libraryId: string
  preparedUploadFiles: PreparedUploadFile[]
  onClose?: () => void
}

export const FileUploadProgressDialog = ({
  libraryId,
  preparedUploadFiles,
  onClose,
}: FileUploadProgressDialogProps) => {
  const { now } = useNow()
  const { t } = useTranslation()
  const startedUploadIdsRef = useRef<Set<string>>(new Set())
  const { cancelFileUpload } = useFileActions({ libraryId })
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(() => new Map())
  const [abortControllers, setAbortControllers] = useState(() => new Map<string, AbortController>())
  const [uploadEndTime, setUploadEndTime] = useState<number | null>(null)

  // Check if all uploads are complete
  const allUploadsComplete = preparedUploadFiles.every((file) => {
    const progress = uploadProgress.get(file.fileId)
    return progress === 100 || progress === -1 // 100 = uploaded, -1 = cancelled
  })

  // Calculate total bytes
  const totalBytes = preparedUploadFiles.reduce((sum, file) => sum + file.blob.size, 0)

  // Calculate upload duration
  const uploadDuration = uploadEndTime ? ((uploadEndTime - now) / 1000).toFixed(1) : null

  // Set end time when all uploads complete
  useEffect(() => {
    if (allUploadsComplete && !uploadEndTime && preparedUploadFiles.length > 0) {
      const timeoutId = setTimeout(() => {
        setUploadEndTime(Date.now())
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [allUploadsComplete, uploadEndTime, preparedUploadFiles.length])

  const handleCancelUpload = async (fileId: string) => {
    const abortController = abortControllers.get(fileId)
    if (abortController) {
      abortController.abort()
      if (fileId) {
        cancelFileUpload(fileId, {
          onError: (error) => {
            const errorMsg = error instanceof Error ? error.message : 'Failed to cancel upload'
            toastError(errorMsg)
          },
        })
      }
      setUploadProgress((prev) => {
        const newProgress = new Map(prev)
        if (fileId) {
          newProgress.set(fileId, -1) // -1 for cancellation
        }
        return newProgress
      })
      setAbortControllers((prev) => {
        const newControllers = new Map(prev)
        newControllers.delete(fileId) // Remove the controller for the cancelled file
        return newControllers
      })
    }
  }

  const handleCancelAllUploads = async () => {
    abortControllers.forEach((abortController, fileId) => {
      abortController.abort()
      cancelFileUpload(fileId, {
        onError: (error) => {
          const errorMsg = error instanceof Error ? error.message : 'Failed to cancel upload'
          toastError(errorMsg)
        },
      })
    })

    // Update UI to show all files as cancelled
    setUploadProgress((prev) => {
      const newProgress = new Map(prev)
      abortControllers.forEach((_, fileId) => {
        newProgress.set(fileId, -1) // -1 for cancellation
      })
      return newProgress
    })

    // Clear all abort controllers
    setAbortControllers(new Map())
  }

  const startUploads = (filesToUpload: PreparedUploadFile[]) => {
    const removeEventListeners: (() => void)[] = []
    const localAbortControllers = new Map<string, AbortController>()

    const uploadPromises = filesToUpload.map((file) => {
      const abortController = new AbortController()
      localAbortControllers.set(file.fileId, abortController)
      setAbortControllers((prev) => {
        const newControllers = new Map(prev)
        newControllers.set(file.fileId, abortController)
        return newControllers
      })

      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open('POST', file.uploadUrl)

        file.headers.forEach((header) => {
          xhr.setRequestHeader(header.name, header.value)
        })

        const handleAbortEvent = () => {
          xhr.abort()
        }

        const cleanupFn = () => abortController.signal.removeEventListener('abort', handleAbortEvent)
        removeEventListeners.push(cleanupFn)

        const cleanup = () => {
          const index = removeEventListeners.indexOf(cleanupFn)
          if (index !== -1) {
            cleanupFn()
            removeEventListeners.splice(index, 1)
          }
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progressPercent = (event.loaded / event.total) * 100
            setUploadProgress((prev) => {
              const newProgress = new Map(prev)
              newProgress.set(file.fileId, progressPercent)
              return newProgress
            })
          }
        }

        xhr.upload.onloadend = () => {
          // Don't update progress if upload was aborted (status === 0)
          if (xhr.status === 0) {
            return
          }
          // If upload completes without progress events (fast upload), set to 100%
          setUploadProgress((prev) => {
            const newProgress = new Map(prev)
            const currentProgress = newProgress.get(file.fileId)
            // Only set to 100% if we haven't received any progress updates
            if (currentProgress === 0 || currentProgress === undefined) {
              newProgress.set(file.fileId, 100)
            }
            return newProgress
          })
        }

        xhr.onload = () => {
          cleanup()
          if (xhr.status === 200) {
            setUploadProgress((prev) => {
              const newProgress = new Map(prev)
              newProgress.set(file.fileId, 100)
              return newProgress
            })
            resolve()
          } else {
            const errorMsg = `Failed to upload ${file.fileName}: ${xhr.status} ${xhr.responseText}`
            toastError(errorMsg)
            reject(new Error(errorMsg))
          }
        }

        xhr.onerror = () => {
          cleanup()
          const errorMsg = `Network error during upload of ${file.fileName}`
          toastError(errorMsg)
          reject(new Error(errorMsg))
        }

        xhr.onabort = () => {
          cleanup()
          // Abort is intentional, not an error - resolve instead of reject
          resolve()
        }

        abortController.signal.addEventListener('abort', handleAbortEvent)

        xhr.send(file.blob)
      })
    })

    return Promise.all(uploadPromises)
  }

  useEffect(() => {
    const startedUploadIds = startedUploadIdsRef.current
    // Start uploads only once per file
    const filesToStart = preparedUploadFiles.filter((file) => !startedUploadIds.has(file.fileId))
    filesToStart.forEach((file) => startedUploadIds.add(file.fileId))
    if (filesToStart.length === 0) {
      return
    }
    let timeoutFired = false
    const timeout = setTimeout(() => {
      timeoutFired = true
      startUploads(filesToStart).catch((error) => {
        console.error('Error during uploads:', error)
      })
    }, 100)

    // Cleanup function to abort uploads if component unmounts
    return () => {
      clearTimeout(timeout)
      if (!timeoutFired) {
        filesToStart.forEach((file) => startedUploadIds.delete(file.fileId))
      }
    }
  }, [preparedUploadFiles])

  // Calculate successful uploads count
  const successfulUploads = preparedUploadFiles.filter((file) => uploadProgress.get(file.fileId) === 100).length

  const dialogTitle =
    allUploadsComplete && uploadDuration
      ? `${successfulUploads} ${successfulUploads === 1 ? 'file' : 'files'} with ${formatBytes(totalBytes)} successfully uploaded in ${uploadDuration} seconds`
      : t('texts.uploadingFiles')

  return (
    <dialog className="modal" open={true}>
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">{dialogTitle}</h3>
        <ul className="space-y-2">
          {preparedUploadFiles.map((preparedFile) => {
            const fileId = preparedFile.fileId
            const file = preparedFile.blob as File
            const progress = uploadProgress.get(fileId)
            const fileSize = formatBytes(file.size)

            return (
              <li key={file.name} className="flex items-center justify-between gap-2">
                <div className="flex w-1/2 items-center gap-2">
                  <FileIcon />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{fileSize}</span>
                  {progress === -1 ? (
                    <span className="text-error">{t('actions.cancelled')}</span>
                  ) : progress === 100 ? (
                    <span className="text-success">{t('actions.uploaded')}</span>
                  ) : (
                    // Progress Bar
                    <div className="relative h-2 w-20 rounded-sm bg-base-200">
                      <div
                        className="absolute h-2 rounded-sm bg-info duration-200"
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
                    onClick={() => handleCancelUpload(fileId)}
                  >
                    <CrossIcon />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        <div className="modal-action justify-end">
          {allUploadsComplete ? (
            <button type="button" className="btn btn-sm btn-primary" onClick={onClose}>
              {t('actions.close')}
            </button>
          ) : (
            <button type="button" className="btn btn-sm" onClick={handleCancelAllUploads}>
              {t('actions.cancel')}
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}
