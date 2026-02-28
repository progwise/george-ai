import { eventClient } from '../client'
import { getRequestSubject } from './common'
import {
  DiscoverModelsResponse,
  ProviderRequest,
  ProviderResponseSchema,
  ProviderStatusReportRequest,
  ProviderStatusReportResponse,
  ProviderTestConnectionRequest,
  ProviderTestConnectionResponse,
  RequestDiscoverModels,
} from './schema'

export async function requestProviderInstance(
  request: ProviderTestConnectionRequest,
): Promise<ProviderTestConnectionResponse>
export async function requestProviderInstance(request: RequestDiscoverModels): Promise<DiscoverModelsResponse>
export async function requestProviderInstance(
  request: ProviderStatusReportRequest,
): Promise<ProviderStatusReportResponse>
export async function requestProviderInstance(request: ProviderRequest) {
  const { workspaceId, modelProvider, requestType } = request
  const subject = getRequestSubject({ workspaceId, modelProvider, requestType })
  const payload = new TextEncoder().encode(JSON.stringify(request))

  const response = await eventClient.request({
    subject,
    payload,
  })
  const decodedResponse = new TextDecoder().decode(response)
  const parsedResponse = ProviderResponseSchema.parse(JSON.parse(decodedResponse))
  return parsedResponse
}
