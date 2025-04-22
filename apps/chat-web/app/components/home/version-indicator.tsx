import { useQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getVersions = createServerFn({ method: 'GET' }).handler(async () => {
  const { version: serverVersion } = await backendRequest(
    graphql(`
      query version {
        version
      }
    `),
  )

  const clientVersion = process.env.GIT_COMMIT_SHA

  return {
    clientVersion,
    serverVersion,
  }
})

export const VerstionIndicator = () => {
  const { data } = useQuery({
    queryKey: ['versions'],
    queryFn: () => getVersions(),
    staleTime: Infinity,
  })

  if (!data?.clientVersion && !data?.serverVersion) {
    return
  }

  const { clientVersion, serverVersion } = data
  const differentVersion = clientVersion !== serverVersion

  return (
    <p className="text-sm">
      Build: <span className="font-semibold">{clientVersion ?? 'not found'}</span>{' '}
      {differentVersion && (
        <>
          (Server: <span className="font-semibold">{serverVersion ?? 'not found'}</span>)
        </>
      )}
    </p>
  )
}
