export async function* lineSplitter(source: AsyncIterable<Buffer | string>): AsyncGenerator<string> {
  let remainder = ''
  for await (const chunk of source) {
    const data = remainder + chunk.toString()
    const lines = data.split(/\r?\n/)
    // Keep the last partial line
    remainder = lines.pop() ?? ''
    for (const line of lines) {
      yield line
    }
  }
  if (remainder) yield remainder
}
