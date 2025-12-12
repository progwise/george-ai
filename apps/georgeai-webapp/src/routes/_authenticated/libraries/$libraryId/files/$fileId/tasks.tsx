import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getProcessingTasksQueryOptions } from '../../../../../../components/library/tasks/get-tasks'
import { TaskAccordionItem } from '../../../../../../components/library/tasks/task-accordion-item'
import { Pagination } from '../../../../../../components/table/pagination'
import { ProcessingStatus } from '../../../../../../gql/graphql'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/tasks')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
    status: z.nativeEnum(ProcessingStatus).optional(),
  }),
  loaderDeps: ({ search: { skip, take, status } }) => ({
    skip,
    take,
    status,
  }),
  loader: async ({ context, params, deps }) => {
    await context.queryClient.ensureQueryData(
      getProcessingTasksQueryOptions({
        libraryId: params.libraryId,
        fileId: params.fileId,
        skip: deps.skip,
        take: deps.take,
        status: deps.status,
      }),
    )
  },
})

function RouteComponent() {
  const { libraryId, fileId } = Route.useParams()
  const { skip, take, status } = Route.useSearch()
  const navigate = Route.useNavigate()

  const {
    data: { aiContentProcessingTasks },
  } = useSuspenseQuery(
    getProcessingTasksQueryOptions({
      libraryId,
      fileId,
      skip,
      take,
      status,
    }),
  )

  const tasks = aiContentProcessingTasks.tasks
  const count = aiContentProcessingTasks.count

  return (
    <div className="flex h-full flex-col gap-2 bg-base-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-base-content/80">Content Extraction Tasks</h2>
        <div className="flex items-end gap-4">
          <div>
            <select
              className="select h-full select-sm"
              value={status || ''}
              onChange={(e) => {
                const selectedStatus = e.target.value as ProcessingStatus | ''
                navigate({ search: { skip: 0, take, status: selectedStatus || undefined } })
              }}
            >
              <option value="">All</option>
              <option value={ProcessingStatus.Pending}>Pending</option>
              <option value={ProcessingStatus.Extracting}>Extracting</option>
              <option value={ProcessingStatus.Embedding}>Embedding</option>
              <option value={ProcessingStatus.Completed}>Completed</option>
              <option value={ProcessingStatus.Failed}>Failed</option>
            </select>
          </div>
          <Pagination
            totalItems={count}
            itemsPerPage={take}
            currentPage={1 + skip / take}
            onPageChange={(page) => {
              navigate({ search: { skip: (page - 1) * take, take, status } })
            }}
            showPageSizeSelector={true}
            onPageSizeChange={(newPageSize) => {
              navigate({ search: { skip: 0, take: newPageSize, status } })
            }}
          />
        </div>
      </div>

      <div className="overflow-auto">
        {tasks.length === 0 ? (
          <div className="card w-full bg-base-200">
            <div className="card-body text-center">
              <p className="text-base-content/60">No tasks found</p>
            </div>
          </div>
        ) : (
          <div className="join-vertical join w-full bg-base-100">
            {tasks.map((task, index) => (
              <TaskAccordionItem key={task.id} task={task} index={index} skip={skip} take={take} hideFileName={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
