import { DeleteAllUpdatesDialog } from './delete-all-updates-dialog'

interface UpdatesActionBarProps {
  libraryId: string
  tableDataChanged: () => void
  totalItems: number
}

export const UpdatesActionBar = ({ libraryId, tableDataChanged, totalItems }: UpdatesActionBarProps) => {
  return (
    <nav className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <DeleteAllUpdatesDialog libraryId={libraryId} tableDataChanged={tableDataChanged} totalItems={totalItems} />
      </div>
    </nav>
  )
}
