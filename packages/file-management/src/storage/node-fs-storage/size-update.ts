import { getFileDirFromPath, getLibraryDirFromPath, getWorkspaceDirFromPath } from './commons'
import {
  getFileManifest,
  getLibraryManifest,
  getWorkspaceManifest,
  saveFileManifest,
  saveLibraryManifest,
  saveWorkspaceManifest,
} from './metadata-files'

export async function workspaceSizeUpdate(workspaceDir: string, difference: { bytes: number; files: number }) {
  const workspaceManifest = await getWorkspaceManifest(workspaceDir)
  await saveWorkspaceManifest(workspaceDir, {
    ...workspaceManifest,
    usage: {
      ...workspaceManifest.usage,
      activeBytes: workspaceManifest.usage.activeBytes + difference.bytes,
      physicalBytes: workspaceManifest.usage.physicalBytes + difference.bytes,
      totalFileCount: workspaceManifest.usage.totalFileCount + difference.files,
      lastUpdated: new Date().toISOString(),
    },
  })
}

export async function librarySizeUpdate(libraryDir: string, difference: { bytes: number; files: number }) {
  const workspaceDir = getWorkspaceDirFromPath(libraryDir)

  await Promise.all([
    // Update Library Manifest
    (async () => {
      const libraryManifest = await getLibraryManifest(libraryDir)
      await saveLibraryManifest(libraryDir, {
        ...libraryManifest,
        usage: {
          ...libraryManifest.usage,
          activeBytes: libraryManifest.usage.activeBytes + difference.bytes,
          physicalBytes: libraryManifest.usage.physicalBytes + difference.bytes,
          totalFileCount: libraryManifest.usage.totalFileCount + difference.files,
          lastUpdated: new Date().toISOString(),
        },
      })
    })(),
    // Update Workspace Manifest
    (async () => {
      workspaceSizeUpdate(workspaceDir, difference)
    })(),
  ])
}

export async function fileSizeUpdate(path: string, difference: { bytes: number; files: number }) {
  const fileDir = getFileDirFromPath(path)
  const libraryDir = getLibraryDirFromPath(fileDir)

  await Promise.all([
    // Update File Manifest
    (async () => {
      const fileManifest = await getFileManifest(fileDir)
      await saveFileManifest(fileDir, {
        ...fileManifest,
        usage: {
          ...fileManifest.usage,
          activeBytes: fileManifest.usage.activeBytes + difference.bytes,
          physicalBytes: fileManifest.usage.physicalBytes + difference.bytes,
          lastUpdated: new Date().toISOString(),
        },
      })
    })(),
    // Update Library Manifest
    (async () => {
      librarySizeUpdate(libraryDir, difference)
    })(),
  ])
}
