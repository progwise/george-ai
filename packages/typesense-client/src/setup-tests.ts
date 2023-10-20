import { server } from './mocks/server.js'
import { afterAll, afterEach, beforeAll } from 'vitest'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

process.env.TYPESENSE_API_HOST = 'localhost'
process.env.TYPESENSE_API_PORT = '8108'
process.env.TYPESENSE_API_PROTOCOL = 'https'
