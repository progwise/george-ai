import { OllamaHostConnection } from '@george-ai/app-schema'

import { InferenceModelState, ensureStateBucket } from '.'
import { STATE_BUCKET_NAME } from './common'
import { deleteState } from './delete-state'
import { getState } from './get-state'
import { writeState } from './write-state'

describe.sequential(`Testing state bucket ${STATE_BUCKET_NAME}`, () => {
  const now = Date.now()
  const TEST_WORKSPACE_ID = `test-state-bucket-workspace_${now}`
  const TEST_OLLAMA_CONNECTION: OllamaHostConnection = {
    driver: 'ollama',
    baseUrl: 'http://test.ollama/api',
  }
  beforeAll(async () => {
    await ensureStateBucket()
  })

  afterAll(async () => {
    await deleteState({ type: 'inferenceHost', workspaceId: TEST_WORKSPACE_ID })
    await deleteState({ type: 'inferenceModel', workspaceId: TEST_WORKSPACE_ID })
  })

  it('Should write inference host state', async () => {
    await writeState({
      type: 'inferenceHost',
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      connection: TEST_OLLAMA_CONNECTION,
      hostId: 'horst-1',
      state: 'healthy',
      lastTestConnection: new Date(now),
    })
  })

  it('Should read back the host', async () => {
    const entries = await getState({ type: 'inferenceHost', workspaceId: TEST_WORKSPACE_ID })

    expect(entries.length).toBe(1)
    expect(entries[0].connection).toEqual(TEST_OLLAMA_CONNECTION)
    expect(entries[0].type).toBe('inferenceHost')
  })

  it('Should write 1000 model entries', async () => {
    const result = await Promise.all(
      Array.from({ length: 1000 }).map(async (_, index) => {
        const modelState: InferenceModelState = {
          type: 'inferenceModel',
          version: 1,
          workspaceId: TEST_WORKSPACE_ID,
          hostId: 'horst1',
          loadState: 'installed',
          modelName: `model:${index}`,
          connection: TEST_OLLAMA_CONNECTION,
          callCount: 0,
          errorCount: 0,
          responseTimeMsPerToken: 0,
        }
        return await writeState(modelState)
      }),
    )

    const revisions = new Set(result.map((r) => r.revision))

    expect(result.length).toBe(1000)
    expect(revisions.size).toBe(1000)
  })

  it('Should read back the created entries', async () => {
    const entries = await getState({ type: 'inferenceModel', workspaceId: TEST_WORKSPACE_ID })
    expect(entries.length).toBe(1000)
  })

  it('Should delete a single model entry', async () => {
    await deleteState({ type: 'inferenceModel', workspaceId: TEST_WORKSPACE_ID, modelName: 'model:99' })

    const entries = await getState({ type: 'inferenceModel', workspaceId: TEST_WORKSPACE_ID })

    expect(entries.length).toBe(999)
  })

  it('should delete the remaining model entries', async () => {
    await deleteState({ type: 'inferenceModel', workspaceId: TEST_WORKSPACE_ID })

    const entries = await getState({ type: 'inferenceModel', workspaceId: TEST_WORKSPACE_ID })

    expect(entries.length).toBe(0)
  })
})
