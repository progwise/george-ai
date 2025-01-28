import { Link } from '@tanstack/react-router'
import { GoogleAccessTokenSchema } from '../data-sources/login-google-server'
import { useState } from 'react'
import {
  FilesTable,
  KnowledgeSourceFile,
  KnowledgeSourceFileSchema,
} from './files-table'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'

export interface GoogleDriveFilesProps {
  currentLocationHref: string
  knowledgeSourceId: string
}

interface GoogleDriveResponse {
  files: [{ id: string; kind: string; name: string }]
}

const EmbedFileDocument = graphql(`
  mutation embedFile($file: AiKnowledgeSourceFileInput!) {
    embedFile(data: $file) {
      id
    }
  }
`)

const embedFiles = createServerFn({ method: 'GET' })
  .validator((data) =>
    z
      .object({
        knowledgeSourceId: z.string().nonempty(),
        files: z.array(KnowledgeSourceFileSchema),
        access_token: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const downloads = ctx.data.files.map((file) =>
      fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application%2Fpdf`,
        {
          headers: {
            Authorization: `Bearer ${ctx.data.access_token}`,
          },
        },
      )
        .then((response) => response.arrayBuffer()) // Todo: handle response.status !== 200
        .then((buffer) => ({
          base64: Buffer.from(buffer).toString('base64'),
          file,
        })),
    )

    const results = await Promise.all(downloads)
    return await Promise.all(
      results.map((result) => {
        backendRequest(EmbedFileDocument, {
          id: result.file.id,
          file: {
            name: result.file.name,
            url: `https://drive.google.com/file/d/${result.file.id}/view`,
            mimeType: 'application/pdf',
            content: result.base64,
            aiKnowledgeSourceId: ctx.data.knowledgeSourceId,
          },
        })
      }),
    )
  })

export const GoogleDriveFiles = ({
  knowledgeSourceId,
  currentLocationHref,
}: GoogleDriveFilesProps) => {
  const [googleDriveResponse, setGoogleDriveResponse] = useState<
    GoogleDriveResponse | undefined
  >(undefined)

  const [selectedFiles, setSelectedFiles] = useState<KnowledgeSourceFile[]>([])

  const googleDriveAccessTokenString = localStorage.getItem(
    'google_drive_access_token',
  )
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(
    JSON.parse(googleDriveAccessTokenString || '{}'),
  )

  const getGoogleDriveFiles = async (accessToken: string) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = await response.json()
    setGoogleDriveResponse(responseJson as GoogleDriveResponse)
  }

  const handleEmbedFiles = async (files: KnowledgeSourceFile[]) => {
    console.log('embedFiles', files)
    await embedFiles({
      data: {
        knowledgeSourceId,
        files,
        access_token: googleDriveAccessToken.access_token!,
      },
    })
  }

  return (
    <>
      <nav className="flex gap-4 justify-between items-center">
        <div className="flex gap-4">
          <Link
            className="btn btn-xs"
            to="/knowledge/auth-google"
            search={{ redirectAfterAuth: currentLocationHref }}
          >
            Login with Google
          </Link>
          <button
            type="button"
            disabled={!googleDriveAccessToken?.access_token}
            className="btn btn-xs"
            onClick={() =>
              getGoogleDriveFiles(googleDriveAccessToken.access_token!)
            }
          >
            Get Google Drive Files
          </button>
        </div>
        <button
          type="button"
          disabled={!selectedFiles.length}
          className="btn btn-xs"
          onClick={() => {
            handleEmbedFiles(selectedFiles)
          }}
        >
          Embed {selectedFiles.length} files into Knowledge Source
        </button>
      </nav>
      {googleDriveResponse?.files && (
        <FilesTable
          files={googleDriveResponse.files}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
      )}
    </>
  )
}
