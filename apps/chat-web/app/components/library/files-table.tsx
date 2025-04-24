import React from 'react'
import { z } from 'zod'

export const LibraryFileSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
})

export type LibraryFile = {
  id: string
  kind: string
  name: string
}

export interface FilesTableProps {
  files: LibraryFile[]
  selectedFiles: LibraryFile[]
  setSelectedFiles: React.Dispatch<React.SetStateAction<LibraryFile[]>>
}

export const FilesTable: React.FC<FilesTableProps> = ({ files, selectedFiles, setSelectedFiles }) => {
  const toggle = (file: LibraryFile, checked: boolean) => {
    setSelectedFiles((prev) => (checked ? [...prev, file] : prev.filter((f) => f.id !== file.id)))
  }

  return (
    <>
      {/*********** mobile ***********/}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
        {files.map((file, idx) => (
          <div key={file.id} className="card flex flex-col border border-neutral-content bg-base-100 p-4 shadow">
            <div className="mb-2 flex items-center justify-between">
              <label className="ml-auto flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedFiles.some((f) => f.id === file.id)}
                  onChange={(e) => toggle(file, e.target.checked)}
                />
              </label>
            </div>
            {/* <div className="mb-1">
              <span className="font-semibold">ID:</span> {file.id}
            </div> */}
            <div className="font-semibold">{idx + 1}</div>
            <div className="mb-1">
              <span>Name:</span> {file.name}
            </div>
            <div>
              <span className="font-semibold"></span> {file.kind}
            </div>
          </div>
        ))}
      </div>

      {/*********** desktop ***********/}
      <div className="hidden lg:block">
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Kind</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr key={file.id}>
                <td>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedFiles.some((f) => f.id === file.id)}
                    onChange={(e) => toggle(file, e.target.checked)}
                  />
                </td>
                <td>{idx + 1}</td>
                <td>{file.id}</td>
                <td>{file.name}</td>
                <td>{file.kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
