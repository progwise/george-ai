import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import path from 'node:path'

import { StorageStatus } from '@george-ai/app-commons'

import { ROOT_DIR } from './commons'
import { exists } from './exists'

const existsDir = async (dir: string): Promise<boolean> => {
  try {
    // F_OK checks for the existence of the file/folder
    await access(dir, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function getStorageStatus(
  workspaceId: string,
  args: { libraryId: string; fileId?: string | null },
): Promise<StorageStatus> {
  const { libraryId, fileId } = args
  const legacyDir = path.join(ROOT_DIR, libraryId, fileId ? fileId : '')
  const legacyDirExists = await existsDir(legacyDir)
  if (legacyDirExists) {
    return 'hasLegacyData'
  }

  const modernExists = await exists(workspaceId, { libraryId, fileId })

  if (modernExists) {
    return 'Ready'
  }

  return 'NotFound'
}

export { getStorageStatus }
