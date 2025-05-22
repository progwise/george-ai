import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { getProfileQueryOptions } from '../../auth/get-profile-query'
import { UserProfileFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ChevronBottomIcon } from '../../icons/chevron-bottom-icon'
import { ChevronUpIcon } from '../../icons/chevron-up-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { ExclamationIcon } from '../../icons/exclamation-icon'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { aiLibraryFilesQueryOptions, dropAllFiles, reProcessAllFiles } from '../../server-functions/library'
import { toastError } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { DesktopFileUpload } from './desktop-file-upload'
import { getLibrariesQueryOptions } from './get-libraries-query-options'
import { GoogleDriveFiles } from './google-drive-files'

interface EmbeddingsTableProps {
  libraryId: string
  profile?: UserProfileFragment
}

type SortColumn = 'index' | 'name' | 'size' | 'chunks' | 'processedAt' | null
type SortDirection = 'asc' | 'desc'

const truncateFileName = (name: string, maxLength: number, truncatedLength: number) =>
  name.length > maxLength ? `${name.slice(0, truncatedLength)}...${name.slice(name.lastIndexOf('.'))}` : name

export const EmbeddingsTable = ({ libraryId, profile }: EmbeddingsTableProps) => {
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const { data, isLoading } = useSuspenseQuery(aiLibraryFilesQueryOptions(libraryId))
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return parseInt(params.get('page') || '1', 10)
    }
    return 1
  })

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return parseInt(params.get('perPage') || '5', 10)
    }
    return 5
  })

  const [sortColumn, setSortColumn] = useState<SortColumn>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return (params.get('sortBy') as SortColumn) || null
    }
    return null
  })

  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return (params.get('sortDir') as SortDirection) || 'asc'
    }
    return 'asc'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('perPage', itemsPerPage.toString())

      if (sortColumn) {
        url.searchParams.set('sortBy', sortColumn)
        url.searchParams.set('sortDir', sortDirection)
      } else {
        url.searchParams.delete('sortBy')
        url.searchParams.delete('sortDir')
      }

      window.history.replaceState({}, '', url.toString())
    }
  }, [itemsPerPage, sortColumn, sortDirection])

  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState<string | null>(null)

  const remainingStorage = (profile?.freeStorage || 0) - (profile?.usedStorage || 0)

  const filesWithIndex = data.aiLibraryFiles.map((file, index) => ({
    ...file,
    originalIndex: index + 1,
  }))

  const sortedData = [...filesWithIndex].sort((a, b) => {
    if (!sortColumn) return 0

    let comparison = 0

    switch (sortColumn) {
      case 'index':
        comparison = a.originalIndex - b.originalIndex
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size': {
        const sizeA = a.size ? parseFloat(String(a.size).replace(/[^0-9.]/g, '')) : 0
        const sizeB = b.size ? parseFloat(String(b.size).replace(/[^0-9.]/g, '')) : 0
        comparison = sizeA - sizeB
        break
      }
      case 'chunks':
        comparison = (a.chunks || 0) - (b.chunks || 0)
        break
      case 'processedAt': {
        const dateA = a.processedAt ? new Date(a.processedAt).getTime() : 0
        const dateB = b.processedAt ? new Date(b.processedAt).getTime() : 0
        comparison = dateA - dateB
        break
      }
      default:
        return 0
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const totalPages = Math.ceil(data.aiLibraryFiles.length / itemsPerPage)
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, currentPage * itemsPerPage)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10)
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }

    setCurrentPage(1)
  }

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null

    return sortDirection === 'asc' ? <ChevronBottomIcon /> : <ChevronUpIcon />
  }

  useEffect(() => {
    const googleDriveAccessTokenString = localStorage.getItem('google_drive_access_token')
    const updateAccessToken = () => {
      const updateToken = () => {
        setGoogleDriveAccessToken(googleDriveAccessTokenString ? JSON.parse(googleDriveAccessTokenString) : null)
      }
      updateToken()
    }
    updateAccessToken()
  }, [])

  useEffect(() => {
    if (googleDriveAccessToken) {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('googleDriveAuth')) {
        dialogRef.current?.showModal()
      }
    }
  }, [googleDriveAccessToken])

  const handleGoogleDriveClick = () => {
    if (googleDriveAccessToken) {
      dialogRef.current?.showModal()
    } else {
      window.location.href = `/libraries/auth-google?redirectAfterAuth=${encodeURIComponent(window.location.href)}&googleDriveAuth=true`
    }
  }

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.AiLibraryFiles, libraryId] })
    queryClient.invalidateQueries(getLibrariesQueryOptions())
    queryClient.invalidateQueries(getProfileQueryOptions())
  }

  const dropAllFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropAllFiles({ data: fileIds })
    },
    onSettled: () => {
      setSelectedFiles([])
      invalidateQueries()
    },
  })

  const reProcessAllFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await reProcessAllFiles({ data: fileIds })
    },
    onSettled: () => {
      setSelectedFiles([])
      invalidateQueries()
    },
    onError: () => {
      toastError('An error occurred while reprocessing the files. Please try again later.')
    },
  })

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === data.aiLibraryFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(data.aiLibraryFiles.map((file) => file.id) || [])
    }
  }

  const isPending = isLoading || dropAllFilesMutation.isPending || reProcessAllFilesMutation.isPending

  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    reProcessAllFilesMutation.mutate(uploadedFileIds)
  }

  return (
    <>
      <LoadingSpinner isLoading={isPending} />
      <nav className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <DesktopFileUpload
            libraryId={libraryId}
            onUploadComplete={handleUploadComplete}
            disabled={remainingStorage < 1}
          />
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={handleGoogleDriveClick}
            disabled={remainingStorage < 1}
          >
            {t('libraries.googleDrive')}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={() => dropAllFilesMutation.mutate(selectedFiles)}
            disabled={selectedFiles.length === 0}
          >
            {t('actions.drop')}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={() => reProcessAllFilesMutation.mutate(selectedFiles)}
            disabled={selectedFiles.length === 0}
          >
            {t('actions.reProcess')}
          </button>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right text-sm">
            <div className="font-semibold">{t('labels.remainingStorage')}</div>
            <div>
              {remainingStorage} / {profile?.freeStorage}
            </div>
          </div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">{t('labels.filesPerPage')}:</legend>
            <select className="select" value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </fieldset>
        </div>
      </nav>
      {googleDriveAccessToken && (
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box relative flex w-full min-w-[400px] max-w-screen-lg flex-col">
            <button
              type="button"
              className="btn btn-ghost btn-sm absolute right-2 top-2"
              onClick={() => dialogRef.current?.close()}
            >
              <CrossIcon />
            </button>
            <h3 className="text-lg font-bold">{t('texts.addGoogleDriveFiles')}</h3>
            <div className="flex-grow overflow-auto">
              <GoogleDriveFiles
                libraryId={libraryId}
                currentLocationHref={window.location.href}
                noFreeUploads={remainingStorage < 100}
                dialogRef={dialogRef}
              />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => dialogRef.current?.close()}>
            <button type="button" onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </form>
        </dialog>
      )}
      {!data.aiLibraryFiles.length ? (
        <div className="mt-6 text-center">{t('texts.noFilesFound')}</div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="block lg:hidden">
            <label className="mb-4 flex gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selectedFiles.length === data.aiLibraryFiles.length && data.aiLibraryFiles.length > 0}
                onChange={handleSelectAll}
              />
              <span className="text-sm font-medium">{t('actions.selectAll')}</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {data.aiLibraryFiles.map((file, index) => (
                <div key={file.id} className="shadow-xs border-base-300 flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                      />
                      <span className="text-sm font-semibold">
                        {index + 1}. {truncateFileName(file.name, 25, 20)}
                      </span>
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={() => dropAllFilesMutation.mutate([file.id])}
                        disabled={dropAllFilesMutation.isPending}
                        data-tip={t('tooltips.delete')}
                      >
                        <TrashIcon />
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={() => reProcessAllFilesMutation.mutate([file.id])}
                        disabled={reProcessAllFilesMutation.isPending}
                      >
                        <ReprocessIcon />
                      </button>
                      {file.processingErrorMessage && (
                        <span className="tooltip tooltip-left flex items-center" data-tip={file.processingErrorMessage}>
                          <ExclamationIcon />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="">{t('labels.size')}:</span>
                    <span>{file.size ?? '-'}</span>
                    <span className="">{t('labels.chunks')}:</span>
                    <span>{file.chunks ?? '-'}</span>
                    <span className="">{t('labels.processed')}:</span>
                    <span>{dateTimeString(file.processedAt, language) || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div>
              <table className="table table-fixed">
                <thead className="bg-base-200">
                  <tr>
                    <th className="w-0">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={selectedFiles.length === data.aiLibraryFiles.length && data.aiLibraryFiles.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th onClick={() => handleSort('index')} className="hover:bg-base-300 cursor-pointer">
                      <div className="flex items-center gap-2">#{getSortIndicator('index')}</div>
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="hover:bg-base-300 flex cursor-pointer items-center gap-2"
                    >
                      {t('labels.name')} {getSortIndicator('name')}
                    </th>
                    <th>{t('libraries.source')}</th>
                    <th
                      onClick={() => handleSort('size')}
                      className="hover:bg-base-300 flex cursor-pointer items-center gap-2"
                    >
                      #{t('labels.size')} {getSortIndicator('size')}
                    </th>
                    <th onClick={() => handleSort('chunks')} className="hover:bg-base-300 cursor-pointer">
                      <div className="flex items-center gap-2">
                        #{t('labels.chunks')} {getSortIndicator('chunks')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('processedAt')}
                      className="hover:bg-base-300 flex cursor-pointer items-center gap-2"
                    >
                      {t('labels.processed')} {getSortIndicator('processedAt')}
                    </th>
                    <th>{t('labels.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((file) => (
                    <tr key={file.id} className="hover:bg-base-200">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleSelectFile(file.id)}
                        />
                      </td>
                      <td>{file.originalIndex}</td>
                      <td className="truncate">{file.name}</td>
                      <td className="truncate">
                        {file.originUri &&
                          (file.originUri.startsWith('http') ? (
                            <Link to={file.originUri} className="link" target="_blank" title={file.originUri}>
                              {file.originUri}
                            </Link>
                          ) : (
                            <span>{file.originUri}</span>
                          ))}
                      </td>
                      <td>{file.size ?? '-'}</td>
                      <td>{file.chunks ?? '-'}</td>
                      <td>{dateTimeString(file.processedAt, language) || '-'}</td>
                      <td className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-xs tooltip tooltip-left"
                          data-tip={t('tooltips.delete')}
                          onClick={() => dropAllFilesMutation.mutate([file.id])}
                          disabled={dropAllFilesMutation.isPending}
                        >
                          <TrashIcon />
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs tooltip tooltip-left"
                          data-tip={t('tooltips.reProcess')}
                          onClick={() => reProcessAllFilesMutation.mutate([file.id])}
                          disabled={reProcessAllFilesMutation.isPending}
                        >
                          <ReprocessIcon />
                        </button>
                        {file.processingErrorMessage && (
                          <span className="tooltip" data-tip={file.processingErrorMessage}>
                            <ExclamationIcon />
                          </span>
                        )}

                        {file.dropError && (
                          <span className="lg:tooltip" data-tip={t('libraries.dropFileError')}>
                            <ExclamationIcon className="fill-warning" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <div className="join">
                  <button
                    type="button"
                    className="join-item btn"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={`join-item btn ${currentPage === pageNumber && 'btn-active'}`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="join-item btn"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
