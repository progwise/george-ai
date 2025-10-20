import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { dateStringShort, timeString } from '@george-ai/web-utils'

import { NewLibraryDialog } from '../../../components/library/new-library-dialog'
import { getLibrariesQueryOptions } from '../../../components/library/queries/get-libraries'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ListPlusIcon } from '../../../icons/list-plus-icon'

export const Route = createFileRoute('/_authenticated/libraries/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(getLibrariesQueryOptions())
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const newLibraryDialogRef = useRef<HTMLDialogElement | null>(null)

  const { data, isLoading } = useSuspenseQuery(getLibrariesQueryOptions())
  const { t, language } = useTranslation()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <ul className="bg-base-200 menu-horizontal rounded-box flex w-full items-center justify-start gap-2 p-2">
        <li>
          <h3 className="text-l font-bold">{t('libraries.myLibraries', { count: data.aiLibraries.length })}</h3>
        </li>
        <li className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={() => newLibraryDialogRef.current?.showModal()}
            className="btn btn-sm btn-ghost btn-success max-lg:tooltip max-lg:tooltip-bottom max-lg:tooltip-info"
            title={t('libraries.newList')}
            data-tip={t('libraries.newList')}
          >
            <ListPlusIcon className="size-5" />
            <span className="max-lg:hidden">{t('labels.new')}</span>
          </button>
        </li>
      </ul>

      {data.aiLibraries.length < 1 ? (
        <h3>{t('libraries.noLibrariesFound')}</h3>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('labels.name')}</th>
              <th>{t('libraries.owner')}</th>
              <th>{t('libraries.lastUpdate')}</th>
            </tr>
          </thead>

          <tbody>
            {data.aiLibraries.map((library, index) => {
              const datePart = dateStringShort(library.updatedAt ?? library.createdAt, language)
              const timePart = timeString(library.updatedAt ?? library.createdAt, language)

              return (
                <tr
                  key={library.id}
                  className="hover:bg-base-200"
                  onClick={() =>
                    navigate({
                      to: '/libraries/$libraryId',
                      params: { libraryId: library.id },
                    })
                  }
                >
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Name">
                    <Link to={'/libraries/$libraryId'} params={{ libraryId: library.id }}>
                      <span className="font-bold hover:underline">{library.name}</span>
                    </Link>
                  </td>
                  <td data-label="Owner">{library.owner?.name}</td>
                  <td data-label="Last update">
                    {datePart} {timePart}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <NewLibraryDialog ref={newLibraryDialogRef} />
    </article>
  )
}
