import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { aiLibraryFilesQueryOptions } from '../../../../components/library/files/get-files'
import { getProcessingTasksQueryOptions } from '../../../../components/library/tasks/get-tasks'
import { TaskAccordionItem } from '../../../../components/library/tasks/task-accordion-item'
import { TaskMenu } from '../../../../components/library/tasks/task-menu'
import { Pagination } from '../../../../components/table/pagination'
import { ProcessingStatus } from '../../../../gql/graphql'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/processing')({
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
    await Promise.all([
      context.queryClient.ensureQueryData(
        getProcessingTasksQueryOptions({
          libraryId: params.libraryId,
          skip: deps.skip,
          take: deps.take,
          status: deps.status,
        }),
      ),
      context.queryClient.ensureQueryData(
        aiLibraryFilesQueryOptions({
          libraryId: params.libraryId,
          skip: 0,
          take: 1,
        }),
      ),
    ])
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { skip, take, status } = Route.useSearch()
  const navigate = Route.useNavigate()

  const {
    data: { aiContentProcessingTasks },
  } = useSuspenseQuery(
    getProcessingTasksQueryOptions({
      libraryId,
      skip,
      take,
      status,
    }),
  )

  const {
    data: { aiLibraryFiles },
  } = useSuspenseQuery(
    aiLibraryFilesQueryOptions({
      libraryId,
      skip: 0,
      take: 1,
    }),
  )

  const tasks = aiContentProcessingTasks.tasks
  const count = aiContentProcessingTasks.count

  return (
    <div className="grid size-full grid-rows-[auto_1fr] bg-base-100">
      <div>
        <TaskMenu
          libraryId={libraryId}
          files={aiLibraryFiles}
          statusCounts={aiContentProcessingTasks.statusCounts}
          totalTasksCount={aiContentProcessingTasks.count}
        />

        <div className="flex flex-row justify-end">
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
      {tasks.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body text-center">
            <p className="text-base-content/60">No tasks found</p>
          </div>
        </div>
      ) : (
        <div className="overflow-auto">
          {tasks.map((task, index) => (
            <TaskAccordionItem key={task.id} task={task} index={index} skip={skip} take={take} hideFileName={false} />
          ))}
        </div>
      )}
    </div>
  )
}
