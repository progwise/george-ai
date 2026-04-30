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
  const { workspaceId, fileName, mimeType } = request

  const statusEvent: AnalyzeImageStatus = {
    version: 1,
    workspaceId,
    action: 'analyzeImage',
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
Your goal is to transcribe images into Markdown with perfect fidelity.
- Maintain the visual hierarchy: use # for standalone page-level titles, GFM tables for tabular data.
- Every GFM table MUST have a header row and a separator row (| --- | --- |) with the SAME number of columns as the data rows. Never use a 1-column separator for a multi-column table.
- Preserve each distinct table as a separate table — do not merge multiple tables into one.
- Transcribe all text exactly as it appears. Do not translate, correct spelling, or alter wording.
- Capture all text within each cell, including secondary lines and footnote markers.
- If a cell contains a signature image, stamp, or non-text graphic, output [Signature] or [Image].
- Use ☐ for unchecked and ☑ for checked checkboxes.
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

  const { documentId, libraryId, extractionMethod } = parseUri(request.imageUri)
  const identifier = getIdentifier({ workspaceId, libraryId, documentId, extractionMethod })

  const analysisWriter = await getAnalysisWriter(identifier, {
    sourceFileUri: request.imageUri,
    sourceFileName: fileName,
    sourceFileMimeType: mimeType,
  })

  try {
    const startDate = new Date()

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
    }

    const endDate = new Date()
    const durationSeconds = ((endDate.getTime() - startDate.getTime()) / 1000).toFixed(2)

    const rawOutput = analysisResults.join('\n')
    logger.debug('Full analysis results', { rawOutput })
    const stripped = rawOutput
      .replace(/^```(?:markdown)?\s*\n?([\s\S]*?)```\s*$/s, '$1') // properly closed fence
      .replace(/^```(?:markdown)?\s*\n?/, '') // unclosed opening fence
      .trim()
    const content = stripped.replace(/(\|[^\n]*)\n\n+(?=\|)/g, '$1\n')

    await analysisWriter.write(
      `---
fileName: ${fileName}
mimeType: ${mimeType}
driver: ${visionSettings.modelDriver}
model: ${visionSettings.modelName}
analyzedAt: ${endDate.toISOString()}
durationSeconds: ${durationSeconds}
---

${content}
`,
    )

    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished writing analysis results, image analysis completed successfully with provider ${visionSettings.modelDriver} and model ${visionSettings.modelName}.`,
      status: 'progress',
    })

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
