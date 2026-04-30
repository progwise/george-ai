import { DomainError } from './domain-error'

describe('DomainError', () => {
  it('should create a DomainError with correct properties', () => {
    const error = new DomainError('Test message', 'validation')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('GeorgeAiDomainError')
    expect(error.message).toBe('Test message')
    expect(error.domain).toBe('validation')
    expect(error.toString()).toBe('GeorgeAiDomainError:validation:Test message')

    const json = error.toJSON()
    expect(json).toEqual({
      name: 'GeorgeAiDomainError',
      message: 'Test message',
      domain: 'validation',
    })
  })

  it('should have non-enumerable stack property', () => {
    const error = new DomainError('Another test', 'authorization')
    const propertyDescriptor = Object.getOwnPropertyDescriptor(error, 'stack')

    expect(propertyDescriptor).toBeDefined()
    expect(propertyDescriptor?.enumerable).toBe(false)
    expect(typeof error.stack).toBe('string')
  })

  it('should have correct Symbol.toStringTag', () => {
    const error = new DomainError('Tag test', 'workspace')
    expect(Object.prototype.toString.call(error)).toBe('[object GeorgeAIDomainError]')
  })

  it('Throwing DomainError should be catchable as Error', () => {
    try {
      throw new DomainError('Catch test', 'authorization')
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(DomainError)
      expect((err as DomainError).domain).toBe('authorization')
      expect((err as DomainError).message).toBe('Catch test')
    }
  })
})
