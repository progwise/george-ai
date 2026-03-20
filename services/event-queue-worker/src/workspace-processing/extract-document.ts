import { getErrorMessage } from '@george-ai/app-commons'
import { transform } from '@george-ai/app-domain'
import {
  ChatRequest,
  DocumentExtractionRequest,
  DocumentExtractionStatus,
  invokeAction,
  publish,
} from '@george-ai/event-service-client'
import { getUri, getWorkspaceSettings, writeExtraction } from '@george-ai/file-management'

import { WORKER_ID, logger } from '../common'

export async function extractDocument(request: DocumentExtractionRequest) {
  const { extractionMethod, documentId, workspaceId, libraryId } = request
  logger.debug('Starting document extraction', request)

  const statusEvent: DocumentExtractionStatus = {
    version: 1,
    workspaceId,
    action: 'documentExtraction',
    documentId,
    libraryId,
    extractionMethod,
    status: 'started',
    timestamp: new Date(),
    message: `Worker ${WORKER_ID} got it`,
    verb: 'status',
  }

  await publish({ ...statusEvent, timestamp: new Date(), message: `Worker ${WORKER_ID} got it`, status: 'started' })

  const extraction = await transform(workspaceId, {
    libraryId,
    documentId,
    extractionMethod,
  })

  await publish({ ...statusEvent, timestamp: new Date(), message: `source extraction finished`, status: 'progress' })

  const imageAttachments = extraction.attachments.filter((att) => att.mimeType.startsWith('image/')) || []
  if (imageAttachments.length === 0) {
    logger.info('No image attachments found, skipping image analysis provider call', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished without attachments`,
      status: 'finished',
    })
    return
  }
  const workspaceSettings = await getWorkspaceSettings(workspaceId)
  const imageAnalysisSettings = workspaceSettings?.vision
  if (!imageAnalysisSettings) {
    logger.info('Image analysis settings not found for library, skipping image analysis provider call', {
      libraryId,
      workspaceId,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished without attachments. Reason: no settings for image analysis`,
      status: 'finished',
    })
    return
  }
  const attachmentsToProcess =
    imageAttachments.map((att) => ({
      workspaceId,
      libraryId,
      documentId,
      extractionMethod,
      fileName: att.fileName,
      mimeType: att.mimeType,
      uri: getUri(
        {
          workspaceId,
          libraryId,
          documentId,
          extractionMethod,
          version: 1,
          type: 'extraction',
        },
        att.fileName,
      ),
    })) || []

  const chatCompletionRequest: ChatRequest = {
    version: 1,
    workspaceId,
    driver: imageAnalysisSettings.modelDriver,
    modelName: imageAnalysisSettings.modelName,
    action: 'chatCompletion',
    messages: [
      {
        role: 'system',
        content: `You are a high-fidelity OCR and document-to-markdown converter. 
    Your goal is to transcribe images into Markdown. 
    - Maintain the visual hierarchy (use # for titles, | for tables).
    - If you see a list, use markdown bullets.
    - Do not describe the image; only output the text found within it.`,
      },
      {
        role: 'user',
        content: `Below are ${attachmentsToProcess.length} images. Please convert them to Markdown:
    ${attachmentsToProcess.map((a, i) => `[Image ${i + 1}: ${a.fileName}]`).join('\n')}`,
      },
    ],
    attachments: attachmentsToProcess,
    verb: 'request',
    timestamp: new Date(),
  }

  const response = await invokeAction(chatCompletionRequest).catch(async (error) => {
    logger.error('Error requesting image chat completion from provider', { chatCompletionRequest, error })
    return null
  })

  const extractionWriter = await writeExtraction({ extraction })

  try {
    if (!response) {
      await extractionWriter.write(`## Image Analysis Report
            Timestamp: ${new Date()}
            Failed to analyze images with provider ${imageAnalysisSettings.modelDriver} and model ${imageAnalysisSettings.modelName}.`)
      await publish({
        ...statusEvent,
        timestamp: new Date(),
        message: `Finished without attachments, error during image analysis.`,
        status: 'finished',
      })
      return
    }

    if (response.chunk.length === 0) {
      await extractionWriter.write(`## Image Analysis Report
            Timestamp: ${new Date()}
            The image analysis provider ${imageAnalysisSettings.modelDriver} and model ${imageAnalysisSettings.modelName} returned an empty response.`)
      logger.warn('Image analysis provider call returned empty response', {
        documentId,
        workspaceId,
        libraryId,
        extractionMethod,
        provider: imageAnalysisSettings.modelDriver,
        modelName: imageAnalysisSettings.modelName,
      })
      await publish({
        ...statusEvent,
        timestamp: new Date(),
        message: `Finished without attachments, Image analysis returned empty result.`,
        status: 'finished',
      })
      return
    }

    await extractionWriter.write(
      `
    ## Image Analysis Report

    Successfully analyzed ${imageAttachments.length} images with provider ${imageAnalysisSettings.modelDriver} and model ${imageAnalysisSettings.modelName}.`,
    )

    await extractionWriter.write(
      `
    ## Image Analysis Details

    ${response.chunk}
    `,
    )

    logger.debug('Image analysis provider call succeeded', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
      provider: imageAnalysisSettings.modelDriver,
      modelName: imageAnalysisSettings.modelName,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished with successful attachments image analysis.`,
      status: 'finished',
    })

    await extractionWriter.ack()
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    logger.error('Error during document extraction', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
      errorMessage,
      error,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: errorMessage,
      status: 'failure',
    })
    await extractionWriter.nack(error instanceof Error ? error : undefined)
  }
}
