import { describe, it, expect } from 'vitest'
import { buildOpenApiSpec } from '../openapi'

describe('buildOpenApiSpec', () => {
  const spec = buildOpenApiSpec('https://example.test')

  it('emits a 3.1 document rooted at /api', () => {
    expect(spec.openapi).toBe('3.1.0')
    expect(spec.servers[0].url).toBe('https://example.test/api')
  })

  it('derives request bodies from the Zod schemas', () => {
    const body = spec.paths['/agent/create'].post.requestBody.content['application/json'].schema
    expect(body.required).toEqual(expect.arrayContaining(['niche', 'offer']))
    expect(body.properties.niche.maxLength).toBe(200)
  })

  it('declares path params and auth', () => {
    const op = spec.paths['/prospects/{id}'].put
    expect(op.parameters[0]).toMatchObject({ name: 'id', in: 'path', required: true })
    expect(op.security).toEqual([{ firebaseIdToken: [] }])
    expect(op.responses[401]).toBeDefined()
  })

  it('round-trips through JSON', () => {
    expect(() => JSON.parse(JSON.stringify(spec))).not.toThrow()
  })
})
