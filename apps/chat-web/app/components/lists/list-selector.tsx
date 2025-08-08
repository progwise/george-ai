import { Link, useLocation } from '@tanstack/react-router'

import { graphql } from '../../gql'
import { ListSelector_ListFragment } from '../../gql/graphql'

graphql(`
  fragment ListSelector_List on AiList {
    id
    createdAt
    updatedAt
    name
    owner {
      id
      name
    }
  }
`)

interface ListSelectorProps {
  lists: ListSelector_ListFragment[]
}
export const ListSelector = ({ lists }: ListSelectorProps) => {
  const location = useLocation()

  // Extract the current sub-route (e.g., 'edit', 'view', or nothing for index)
  const currentPath = location.pathname
  const isEditRoute = currentPath.includes('/edit')

  // Determine which route to use based on current location
  const getListRoute = (listId: string) => {
    if (isEditRoute) {
      return `/lists/${listId}/edit`
    }
    return `/lists/${listId}`
  }

  return (
    <div>
      <ul>
        {lists.map((list) => (
          <li key={list.id} className="center py-1">
            <Link
              className="block rounded-md px-2 text-sm"
              activeProps={{ className: 'border-2 border-info' }}
              inactiveProps={{ className: 'border-2 border-transparent' }}
              to={getListRoute(list.id)}
            >
              <span>{list.name}</span>
              <span className="italic"> ({list.owner.name})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
