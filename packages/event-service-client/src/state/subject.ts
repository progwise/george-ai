import { StateItemFilter } from './filter'
import { StateItem } from './schema'

export const getStateKey = (item: StateItem) => {
  switch (item.type) {
    case 'inferenceHost':
      return `state.ws.${item.workspaceId}.inference-host.${item.connection.driver}.host-id.${item.hostId}`
    case 'inferenceModel':
      return `state.ws.${item.workspaceId}.inference-model.${item.connection.driver}.model-name.${safeModelName(item.modelName)}.host-id.${item.hostId}.load-state.${item.loadState}`
    default:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw new Error(`getting state key for item type ${item.type} not implemented`)
  }
}

export const getStateKeyFilter = (filter: StateItemFilter) => {
  switch (filter.type) {
    case 'inferenceHost': {
      return `state.ws.${filter.workspaceId ?? '*'}.inference-host.${filter.driver ?? '*'}.host-id.${filter.hostId ?? '*'}`
    }
    case 'inferenceModel':
      return `state.ws.${filter.workspaceId ?? '*'}.inference-model.${filter.driver ?? '*'}.model-name.${filter.modelName ? safeModelName(filter.modelName) : '*'}.host-id.${filter.hostId ?? '*'}.load-state.${filter.loadState ?? '*'}`
    default:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw new Error(`getting state key filter for item type ${filter.type} not implemented`)
  }
}

const safeModelName = (modelName: string) =>
  modelName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace everything non-alphanumeric with a dash
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Trim dashes from start/end
