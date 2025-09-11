/// <reference types="vinxi/types/server" />
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'

import { createRouter } from './router'

// Filter out ServerFn request/response logs to reduce noise on the server console
const originalConsoleInfo = console.info
console.info = (...args) => {
  if (
    !args.length ||
    args.some(
      (arg) =>
        typeof arg === 'string' &&
        (arg.trim().startsWith('ServerFn Request:') ||
          arg.trim().startsWith('ServerFn Response:') ||
          arg.includes('Payload:') ||
          !arg.trim()),
    )
  ) {
    return
  }

  originalConsoleInfo.apply(console, args)
}
export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
