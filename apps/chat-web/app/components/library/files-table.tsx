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

export const FilesTable = ({
  files,
  selectedFiles,
  setSelectedFiles,
}: FilesTableProps) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th></th>
          <th>Id</th>
          <th>Name</th>
          <th>Kind</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file, index) => (
          <tr key={file.id}>
            <td>
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  onChange={(event) => {
                    setSelectedFiles((prev) => {
                      if (event.target.checked) {
                        return [...prev, file]
                      } else {
                        return prev.filter((f) => f.id !== file.id)
                      }
                    })
                  }}
                  name="selectedFiles"
                  defaultChecked={selectedFiles.includes(file)}
                />
              </label>
            </td>
            <td>{index + 1}</td>
            <td>{file.id}</td>
            <td>{file.name}</td>
            <td>{file.kind}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
