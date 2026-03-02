import { Transform, TransformOptions } from 'stream'

export class Base64Encoder extends Transform {
  remainder: Buffer<ArrayBuffer>
  constructor(options: TransformOptions<Transform> | undefined) {
    super(options)
    this.remainder = Buffer.alloc(0)
  }

  _transform(chunk: Uint8Array<ArrayBufferLike>, _encoding: unknown, callback: () => void) {
    const data = Buffer.concat([this.remainder, chunk])
    const completeLength = data.length - (data.length % 3)

    // 3. Extract the complete groups and convert to Base64
    if (completeLength > 0) {
      const dataToEncode = data.subarray(0, completeLength)
      this.push(Buffer.from(dataToEncode.toString('base64')))
    }

    // 4. Save the leftovers (0, 1, or 2 bytes) for the next _transform call
    this.remainder = data.subarray(completeLength)
    callback()
  }

  _flush(callback: () => void) {
    // 5. When the stream ends, encode any final leftover bytes with padding
    if (this.remainder.length > 0) {
      this.push(Buffer.from(this.remainder.toString('base64')))
    }
    callback()
  }
}
