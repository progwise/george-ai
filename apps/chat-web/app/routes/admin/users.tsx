import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { dateTimeString } from '@george-ai/web-utils'

import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'

export const Route = createFileRoute('/admin/users')({
  component: RouteComponent,
})

const getUsers = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(
    graphql(`
      query users {
        users {
          id
          name
          username
          email
          lastLogin
          profile {
            business
            position
          }
        }
      }
    `),
  )
})

function RouteComponent() {
  const { language } = useTranslation()
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
  if (isLoading) {
    return <LoadingSpinner />
  }
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Id</th>
            <th>Email</th>
            <th>Last Login</th>
            <th>Admin</th>
            <th>Business</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.name}</td>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{dateTimeString(user.lastLogin, language)}</td>
              <td>{/*user.isAdmin ? 'Yes' : 'No' */ 'not sure'}</td>
              <td>{user.profile?.business}</td>
              <td>
                <button type="button" className="btn btn-sm">
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {/* row 2 */}
          <tr>
            <th>2</th>
            <td>Hart Hagerty</td>
            <td>Desktop Support Technician</td>
            <td>Purple</td>
          </tr>
          {/* row 3 */}
          <tr>
            <th>3</th>
            <td>Brice Swyre</td>
            <td>Tax Accountant</td>
            <td>Red</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
