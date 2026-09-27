import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  connectGHL,
  disconnectGHL,
  listIntegrations,
  syncGHL,
  handleGHLWebhook,
} from '../services/integrationService'
import {
  ValidationError,
  UnauthorizedError,
  BadGatewayError,
} from '../errors'

describe('Integration Service (lib/services/integrationService.js)', () => {
  const fakeFieldValue = {
    serverTimestamp: () => 'MOCK_TIMESTAMP',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('connectGHL', () => {
    it('throws UnauthorizedError if user is not provided', async () => {
      await expect(
        connectGHL({ db: {}, FieldValue: fakeFieldValue, user: null, body: {} })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('throws ValidationError if ghl validation fails', async () => {
      const mockValidate = vi.fn().mockResolvedValue({ success: false, error: 'Invalid API key' })
      await expect(
        connectGHL({
          db: {},
          FieldValue: fakeFieldValue,
          user: { uid: 'u1' },
          body: { apiKey: 'ghl_key', locationId: 'loc_1' },
          ghlValidateFn: mockValidate,
        })
      ).rejects.toThrow(ValidationError)
    })

    it('stores encrypted credentials on valid key', async () => {
      const setDoc = vi.fn().mockResolvedValue(true)
      const mockDb = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                set: setDoc,
              }),
            }),
          }),
        }),
      }
      const mockValidate = vi.fn().mockResolvedValue({ success: true })
      const mockEncrypt = vi.fn().mockReturnValue('encrypted_ghl')

      const res = await connectGHL({
        db: mockDb,
        FieldValue: fakeFieldValue,
        user: { uid: 'u1' },
        body: { apiKey: 'ghl_key', locationId: 'loc_1' },
        ghlValidateFn: mockValidate,
        encryptFn: mockEncrypt,
      })

      expect(res.success).toBe(true)
      expect(setDoc).toHaveBeenCalled()
      expect(mockEncrypt).toHaveBeenCalled()
    })
  })

  describe('listIntegrations', () => {
    it('lists user integrations without exposing encryptedCreds', async () => {
      const mockDocs = [
        {
          id: 'ghl',
          data: () => ({
            provider: 'ghl',
            connected: true,
            locationId: 'loc_1',
            encryptedCreds: 'secret_creds',
          }),
        },
      ]
      const mockDb = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              get: async () => ({ docs: mockDocs }),
            }),
          }),
        }),
      }

      const res = await listIntegrations({ db: mockDb, user: { uid: 'u1' } })
      expect(res.integrations).toHaveLength(1)
      expect(res.integrations[0].id).toBe('ghl')
      expect(res.integrations[0].encryptedCreds).toBeUndefined()
      expect(res.integrations[0].locationId).toBe('loc_1')
    })
  })

  describe('syncGHL', () => {
    it('throws ValidationError if neither email nor phone provided', async () => {
      await expect(
        syncGHL({ db: {}, user: { uid: 'u1' }, body: {} })
      ).rejects.toThrow(ValidationError)
    })

    it('creates contact and returns contactId', async () => {
      const mockDb = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                get: async () => ({
                  exists: true,
                  data: () => ({ connected: true, encryptedCreds: 'creds' }),
                }),
              }),
            }),
          }),
        }),
      }

      const mockDecrypt = vi.fn().mockReturnValue(JSON.stringify({ apiKey: 'key', locationId: 'loc' }))
      const mockGetContact = vi.fn().mockResolvedValue(null)
      const mockCreateContact = vi.fn().mockResolvedValue({ id: 'cnt_123' })

      const res = await syncGHL({
        db: mockDb,
        user: { uid: 'u1' },
        body: { email: 'lead@example.com', firstName: 'Alice' },
        decryptFn: mockDecrypt,
        ghlGetContactFn: mockGetContact,
        ghlCreateContactFn: mockCreateContact,
      })

      expect(res.ok).toBe(true)
      expect(res.contactId).toBe('cnt_123')
    })
  })
})

