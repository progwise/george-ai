import React, { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

export const LibraryFileSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
})

export type LibraryFile = z.infer<typeof LibraryFileSchema>

export interface FilesTableProps {
  files: LibraryFile[]
  selectedFiles: LibraryFile[]
  setSelectedFiles: React.Dispatch<React.SetStateAction<LibraryFile[]>>
}

export const FilesTable: React.FC<FilesTableProps> = ({ files, selectedFiles, setSelectedFiles }) => {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [columns, setColumns] = useState(1)

  const toggle = (file: LibraryFile, checked: boolean) => {
    setSelectedFiles((prev) => (checked ? [...prev, file] : prev.filter((f) => f.id !== file.id)))
  }

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (gridRef.current && gridRef.current.children.length > 0) {
        const containerWidth = gridRef.current.getBoundingClientRect().width
        const childWidth = gridRef.current.children[0].getBoundingClientRect().width
        const colCount = Math.floor(containerWidth / childWidth)
        setColumns(colCount || 1)
      }
    })

    if (gridRef.current) observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/*********** mobile ***********/}
      <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
        {files.map((file, index) => {
          const rowIndex = Math.floor(index / columns)

          return (
            <div
              key={file.id}
              className={`card flex flex-row items-center gap-2 ${rowIndex % 2 === 0 ? 'bg-base-100' : 'bg-base-200'} rounded-none`}
            >
              <label className="ml-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={selectedFiles.some((f) => f.id === file.id)}
                  onChange={(e) => toggle(file, e.target.checked)}
                />
                <span className="font-semibold">{index + 1}</span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
              </label>
            </div>
          )
        })}
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
                    className="checkbox checkbox-xs"
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
