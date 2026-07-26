import { createServerFn } from '@tanstack/react-start'

import { MARKETING_WEBSITE_URL } from '../constants'
import { queryKeys } from '../query-keys'

export const getMarketingWebsiteUrl = createServerFn({ method: 'GET' }).handler(() => {
  return MARKETING_WEBSITE_URL
})

export const getMarketingWebsiteUrlQueryOptions = () => ({
  queryKey: [queryKeys.MarketingWebsiteUrl],
  queryFn: getMarketingWebsiteUrl,
})
