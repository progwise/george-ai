export class DomainError extends Error {
  readonly domain: string
  readonly message: string
  readonly name: string = 'GeorgeAiDomainError'

  constructor(
    message: string,
    domain:
      | 'workspace'
      | 'file'
      | 'document'
      | 'library'
      | 'extraction'
      | 'embedding'
      | 'inference'
      | 'validation'
      | 'authorization'
      | 'payment',
  ) {
    super(message)

    this.message = message
    this.domain = domain

    // Only properties prescribed by the spec should be enumerable.
    // Keep the rest as non-enumerable.
    Object.defineProperties(this, {
      message: {
        writable: true,
        enumerable: true,
      },
      name: { enumerable: false },
    })
  }

  get [Symbol.toStringTag](): string {
    return 'GeorgeAIDomainError'
  }

  toString(): string {
    return `${this.name}:${this.domain}:${this.message}`
  }

  toJSON() {
    return JSON.parse(
      JSON.stringify({
        message: this.message,
        domain: this.domain,
        name: this.name,
      }),
    )
  }
}
