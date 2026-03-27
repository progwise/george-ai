import { getErrorMessage } from '@george-ai/app-commons/src/error'
import { ChatAttachment } from '@george-ai/app-schema'
import { AnalyzeImageRequest, AnalyzeImageStatus, publish } from '@george-ai/event-service-client'
import {
  getAnalysisWriter,
  getIdentifier,
  getWorkspaceSettings,
  parseUri,
  readAttachment,
} from '@george-ai/file-management'
import { chatStream } from '@george-ai/llm-client'

import { logger } from '../common'
import { getInferenceModelConnection } from '../invoke-fulfillment/common'

export async function analyzeImage(request: AnalyzeImageRequest): Promise<void> {
  logger.debug('Starting image analysis', request)
  const { workspaceId, libraryId, documentId, extractionMethod, fileName, mimeType } = request

  const statusEvent: AnalyzeImageStatus = {
    version: 1,
    workspaceId,
    action: 'analyzeImage',
    libraryId,
    documentId,
    extractionMethod,
    status: 'started',
    timestamp: new Date(),
    message: `Worker started processing image analysis`,
    verb: 'status',
    fileName,
    mimeType,
  }

  await publish({
    ...statusEvent,
    timestamp: new Date(),
    message: `Worker started processing image analysis`,
    status: 'started',
  })

  const workspaceSettings = await getWorkspaceSettings(workspaceId)
  const visionSettings = workspaceSettings?.vision
  if (!visionSettings) {
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

  const inferenceHost = await getInferenceModelConnection({
    workspaceId,
    driver: visionSettings.modelDriver,
    modelName: visionSettings.modelName,
  })

  if (!inferenceHost) {
    logger.error('Inference host connection not found for image analysis', {
      workspaceId,
      driver: visionSettings.modelDriver,
      modelName: visionSettings.modelName,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished without attachments. Reason: no inference host connection found for image analysis`,
      status: 'finished',
    })
    return
  }

  const analysisStream = await chatStream({
    connection: inferenceHost,
    modelName: visionSettings.modelName,

    messages: [
      {
        role: 'system',
        content: `You are a high-fidelity OCR and document-to-markdown converter.
Your goal is to transcribe images into Markdown.
- Maintain the visual hierarchy (use # for titles, | for tables).
- If you see a list, use markdown bullets.
- Do not describe the image; only output the text found within it.
- Respond immediately with the transcription. Do not reason or explain.`,
      },
      {
        role: 'user',
        content: `Below you find the image. Please convert them to Markdown:\n[Image: ${fileName}]`,
      },
    ],
    attachments: [
      {
        uri: request.imageUri,
        fileName,
        mimeType,
        stream: await getAttachmentStream({
          uri: request.imageUri,
          fileName,
          mimeType,
        }),
      },
    ],
    modelOptions: { think: false },
  })

  const identifier = getIdentifier({ workspaceId, libraryId, documentId, extractionMethod })

  const analysisWriter = await getAnalysisWriter(identifier, {
    sourceFileUri: request.imageUri,
    sourceFileName: fileName,
    sourceFileMimeType: mimeType,
  })

  try {
    const startDate = new Date()
    await analysisWriter.write(`## Start Image Analysis
| | |
|-|-|
| **File Name** | ${fileName} |
| **MIME Type** | ${mimeType} |
| **Inference Driver** | ${visionSettings.modelDriver} |
| **Inference Model** | ${visionSettings.modelName} |
| **Timestamp** | ${startDate.toISOString()} |

    `)
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Started writing analyis results, image sent to provider ${visionSettings.modelDriver} and model ${visionSettings.modelName} for analysis.`,
      status: 'progress',
    })

    const analysisResults: string[] = []
    for await (const chunk of analysisStream) {
      if (!chunk.completionLine) continue
      analysisResults.push(chunk.completionLine)
      await analysisWriter.write(chunk.completionLine + '\n')
    }

    console.log('Full analysis results:', analysisResults.join('\n'))

    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished writing analysis results, image analysis completed successfully with provider ${visionSettings.modelDriver} and model ${visionSettings.modelName}.`,
      status: 'progress',
    })

    await analysisWriter.write(
      `
End of Image Analysis

| | |
|-|-|
| **File Name** | ${fileName} |
| **MIME Type** | ${mimeType} |
| **Inference Driver** | ${visionSettings.modelDriver} |
| **Inference Model** | ${visionSettings.modelName} |
| **Timestamp** | ${new Date()} |
| **Duration** | ${((new Date().getTime() - startDate.getTime()) / 1000).toFixed(2)} seconds |

    Successfully analyzed image with provider ${visionSettings.modelDriver} and model ${visionSettings.modelName}.`,
    )

    logger.debug('Image analysis provider call succeeded', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
      provider: visionSettings.modelDriver,
      modelName: visionSettings.modelName,
    })

    await analysisWriter.ack()

    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished with successful attachments image analysis.`,
      status: 'finished',
    })
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
    await analysisWriter.nack(error instanceof Error ? error : undefined)
  }
}

async function getAttachmentStream(attachment: ChatAttachment) {
  const { workspaceId, libraryId, documentId, extractionMethod } = parseUri(attachment.uri)

  const identifier = getIdentifier({ workspaceId, libraryId, documentId, extractionMethod })

  const result = await readAttachment(identifier, attachment.fileName)
  return result.stream
}
