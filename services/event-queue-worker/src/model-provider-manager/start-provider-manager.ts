import { logger } from '../common'

export async function startProviderManager() {
  logger.info('AI Provider Manager started')

  const timeout = setTimeout(() => {
    logger.debug('again checking provider health...')
  }, 1000)

  return async () => {
    clearTimeout(timeout)
    logger.info('AI Provider Manager stopped')
  }
}
