import { PassThrough, Readable } from 'node:stream'

export function concatStreams(...streams: Readable[]): Readable {
  const pass = new PassThrough()
  let i = 0
  const pipeNext = () => {
    if (i >= streams.length) return pass.end()
    const s = streams[i++]
    s.pipe(pass, { end: false })
    s.on('end', pipeNext)
    s.on('error', (err) => pass.destroy(err))
  }
  pipeNext()
  return pass
}
