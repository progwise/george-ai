import { useLocation, useNavigate } from '@tanstack/react-router'

import { graphql } from '../../gql'
import { ListSelector_ListFragment } from '../../gql/graphql'
import { Listbox } from '../listbox'

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
  selectedListId: string
}
export const ListSelector = ({ lists, selectedListId }: ListSelectorProps) => {
  const location = useLocation()
  const navigate = useNavigate()

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
    <Listbox
      items={lists}
      className="outline-base-content/30 outline"
      selectedItem={lists.find((item) => item.id === selectedListId)}
      onChange={(list) =>
        list && navigate({ to: getListRoute(list.id), params: (prev: object) => ({ ...prev, listId: selectedListId }) })
      }
    />
  )
}
