import { ProviderStatusReportRequest, ProviderStatusReportResponse } from '@george-ai/event-service-client'
import { statusReport } from '@george-ai/llm-client'

import { logger } from './common'

export async function getProviderInstanceStatusReport(
  request: ProviderStatusReportRequest,
): Promise<ProviderStatusReportResponse> {
  logger.debug('Generating provider instance status report for request', { request })

  const startTime = Date.now()
  try {
    const report = await statusReport(request.connection)

    const response: ProviderStatusReportResponse = {
      version: 1,
      resultStatus: 'success',
      errorMessage: null,
      providerInstanceUrl: request.connection.baseUrl,
      processingDurationMs: Date.now() - startTime,
      requestType: 'statusReport',
      isConnected: report.isConnected,
      providerVersion: report.version,
      latencyMs: report.latencyMs,
      connectionErrorMessage: report.connectionErrorMessage,
      processorUsagePercent: report.processorUsagePercent,
      totalMemoryMb: report.totalMemoryMb,
      usedMemoryMb: report.usedMemoryMb,
      loadedModelNames: report.loadedModelNames,
      availableModelNames: report.availableModelNames,
    }
    return response
  } catch (error) {
    logger.error('Error generating provider instance status report', { request, error })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: ProviderStatusReportResponse = {
      version: 1,
      resultStatus: 'error',
      errorMessage,
      providerInstanceUrl: request.connection.baseUrl,
      processingDurationMs: Date.now() - startTime,
      requestType: 'statusReport',
    }
    return response
  }
}
