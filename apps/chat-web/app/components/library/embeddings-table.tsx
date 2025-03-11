import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { useAuth } from '../../auth/auth-hook'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DropIcon } from '../../icons/drop-icon'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { LoadingSpinner } from '../loading-spinner'
import { DesktopFileUpload } from './desktop-file-upload'

interface EmbeddingsTableProps {
  libraryId: string
}

const ClearEmbeddingsDocument = graphql(/* GraphQL */ `
  mutation clearEmbeddings($libraryId: String!) {
    clearEmbeddedFiles(libraryId: $libraryId)
  }
`)

const DropFileDocument = graphql(/* GraphQL */ `
  mutation dropFile($id: String!) {
    dropFile(fileId: $id) {
      id
    }
  }
`)

const ReprocessFileDocument = graphql(/* GraphQL */ `
  mutation reProcessFile($id: String!) {
    processFile(fileId: $id) {
      id
      chunks
      size
      uploadedAt
      processedAt
    }
  }
`)

const clearEmbeddings = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(ClearEmbeddingsDocument, {
      libraryId: ctx.data,
    })
  })

const dropFile = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(DropFileDocument, { id: ctx.data })
  })

const reProcessFile = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(ReprocessFileDocument, { id: ctx.data })
  })

const dropAllFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const dropFilePromises = ctx.data.map((fileId) => backendRequest(DropFileDocument, { id: fileId }))
    return await Promise.all(dropFilePromises)
  })

const reProcessAllFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const reProcessFilePromises = ctx.data.map((fileId) => backendRequest(ReprocessFileDocument, { id: fileId }))
    return await Promise.all(reProcessFilePromises)
  })

const EmbeddingsTableDocument = graphql(`
  query EmbeddingsTable($libraryId: String!) {
    aiLibraryFiles(libraryId: $libraryId) {
      id
      name
      originUri
      mimeType
      size
      chunks
      uploadedAt
      processedAt
    }
  }
`)

const getLibraryFiles = createServerFn({ method: 'GET' })
  .validator(({ libraryId }: { libraryId: string }) => z.string().nonempty().parse(libraryId))
  .handler(async (ctx) => {
    return await backendRequest(EmbeddingsTableDocument, {
      libraryId: ctx.data,
    })
  })

const aiLibraryFilesQueryOptions = (libraryId?: string) => ({
  queryKey: [queryKeys.AiLibraryFiles, libraryId],
  queryFn: async () => {
    if (!libraryId) {
      return null
    } else {
      return getLibraryFiles({ data: { libraryId } })
    }
  },
  enabled: !!libraryId,
})

export const EmbeddingsTable = ({ libraryId }: EmbeddingsTableProps) => {
  const { userProfile } = useAuth()
  const remainingStorage = (userProfile?.freeStorage || 0) - (userProfile?.usedStorage || 0)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const { t, language } = useTranslation()
  const { data, isLoading, refetch } = useSuspenseQuery(aiLibraryFilesQueryOptions(libraryId))

  const clearEmbeddingsMutation = useMutation({
    mutationFn: async (libraryId: string) => {
      await clearEmbeddings({ data: libraryId })
    },
    onSettled: () => {
      refetch()
    },
  })

  const dropFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await dropFile({ data: fileId })
    },
    onSettled: () => {
      refetch()
    },
  })

  const reProcessFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await reProcessFile({ data: fileId })
    },
    onSettled: () => {
      refetch()
    },
  })

  const dropAllFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropAllFiles({ data: fileIds })
    },
    onSettled: () => {
      refetch()
      setSelectedFiles([])
    },
  })

  const reProcessAllFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await reProcessAllFiles({ data: fileIds })
    },
    onSettled: () => {
      refetch()
      setSelectedFiles([])
    },
  })

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === data?.aiLibraryFiles?.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(data?.aiLibraryFiles?.map((file) => file.id) || [])
    }
  }

  const isPending =
    isLoading ||
    clearEmbeddingsMutation.isPending ||
    dropAllFilesMutation.isPending ||
    reProcessAllFilesMutation.isPending ||
    dropFileMutation.isPending ||
    reProcessFileMutation.isPending

  return (
    <>
      <LoadingSpinner isLoading={isPending} />
      <nav className="flex items-center justify-between gap-4">
        <div className="flex w-full gap-4">
          <button
            type="button"
            className="btn btn-xs lg:tooltip"
            data-tip={t('tooltips.clearEmbeddings')}
            onClick={() => clearEmbeddingsMutation.mutate(libraryId)}
            disabled={clearEmbeddingsMutation.isPending}
          >
            Clear
          </button>
          <DesktopFileUpload libraryId={libraryId} onUploadComplete={refetch} disabled={remainingStorage < 1} />
          <button
            type="button"
            className="btn btn-xs"
            onClick={() => dropAllFilesMutation.mutate(selectedFiles)}
            disabled={selectedFiles.length === 0}
          >
            {t('actions.drop')}
          </button>
          <button
            type="button"
            className="btn btn-xs"
            onClick={() => reProcessAllFilesMutation.mutate(selectedFiles)}
            disabled={selectedFiles.length === 0}
          >
            {t('actions.reProcess')}
          </button>
          <div className="flex w-full justify-end text-sm">
            <span>
              Remaining storage: {remainingStorage} / {userProfile?.freeStorage}
            </span>
          </div>
        </div>
      </nav>
      <table className="table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedFiles.length === data?.aiLibraryFiles?.length}
                onChange={handleSelectAll}
                className="flex justify-center"
              />
            </th>
            <th></th>
            <th>Name</th>
            <th>#Size</th>
            <th>#Chunks</th>
            <th>Processed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.aiLibraryFiles?.map((file, index) => (
            <tr key={file.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                />
              </td>
              <td>{index + 1}</td>
              <td>{file.name}</td>
              <td>{file.size}</td>
              <td>{file.chunks}</td>
              <td>{dateTimeString(file.processedAt, language)}</td>
              <td className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-xs lg:tooltip"
                  onClick={() => dropFileMutation.mutate(file.id)}
                  disabled={dropFileMutation.isPending}
                  data-tip={t('tooltips.drop')}
                >
                  <DropIcon />
                </button>
                <button
                  type="button"
                  className="btn btn-xs lg:tooltip"
                  onClick={() => reProcessFileMutation.mutate(file.id)}
                  disabled={reProcessFileMutation.isPending}
                  data-tip={t('tooltips.reProcess')}
                >
                  <ReprocessIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
