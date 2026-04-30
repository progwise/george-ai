import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { logger } from '../../common'
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from '../../constants'
import { queryKeys } from '../../query-keys'

const getKeycloakConfigFn = createServerFn({ method: 'GET' }).handler(() => {
  const keycloakConfig = {
    url: KEYCLOAK_URL!,
    realm: KEYCLOAK_REALM!,
    clientId: KEYCLOAK_CLIENT_ID!,
  }
  if (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId) {
    throw new Error('Keycloak config is not complete: ' + JSON.stringify(keycloakConfig))
  }

  logger.debug('Keycloak config fetched successfully', {
    maskedConfig: { ...keycloakConfig, url: '***', realm: '***', clientId: '***' },
  })
  return keycloakConfig
})

export const getKeycloakConfigQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.KeycloakConfig],
    queryFn: () => getKeycloakConfigFn(),
    staleTime: Infinity,
  })
