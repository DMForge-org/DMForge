import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  connectEmailChannel,
  disconnectEmailChannel,
  listChannels,
  sendEmailOutreach,
  getLinkedInAuthUrl,
  disconnectLinkedInChannel,
} from '../services/channelService'
import {
  ValidationError,
  UnauthorizedError,
} from '../errors'

describe('Channel Service (lib/services/channelService.js)', () => {
  const fakeFieldValue = {
    serverTimestamp: () => 'MOCK_TIMESTAMP',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('connectEmailChannel', () => {
    it('throws UnauthorizedError if user is not provided', async () => {
      await expect(
        connectEmailChannel({ db: {}, FieldValue: fakeFieldValue, user: null, body: {} })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('throws ValidationError if test email connection fails', async () => {
      const mockTest = vi.fn().mockResolvedValue({ success: false, error: 'Bad SMTP auth' })
      await expect(
        connectEmailChannel({
          db: {},
          FieldValue: fakeFieldValue,
          user: { uid: 'u1' },
          body: { provider: 'gmail', user: 'me@gmail.com', pass: 'secret' },
          testEmailConnectionFn: mockTest,
        })
      ).rejects.toThrow(ValidationError)
    })

    it('saves email channel when test succeeds', async () => {
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
      const mockTest = vi.fn().mockResolvedValue({ success: true, creds: { user: 'me@gmail.com' } })
      const mockEncrypt = vi.fn().mockReturnValue('encrypted_mail')

      const res = await connectEmailChannel({
        db: mockDb,
        FieldValue: fakeFieldValue,
        user: { uid: 'u1' },
        body: { provider: 'gmail', user: 'me@gmail.com', pass: 'secret' },
        testEmailConnectionFn: mockTest,
        encryptFn: mockEncrypt,
      })

      expect(res.success).toBe(true)
      expect(setDoc).toHaveBeenCalled()
    })
  })

  describe('listChannels', () => {
    it('lists channels without encryptedCreds', async () => {
      const mockDocs = [
        {
          id: 'email',
          data: () => ({
            provider: 'gmail',
            connected: true,
            email: 'me@gmail.com',
            encryptedCreds: 'secret_bytes',
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

      const res = await listChannels({ db: mockDb, user: { uid: 'u1' } })
      expect(res.channels).toHaveLength(1)
      expect(res.channels[0].id).toBe('email')
      expect(res.channels[0].encryptedCreds).toBeUndefined()
      expect(res.channels[0].email).toBe('me@gmail.com')
    })
  })

  describe('disconnectEmailChannel and disconnectLinkedInChannel', () => {
    it('deletes channels respectively', async () => {
      const deleteDoc = vi.fn().mockResolvedValue(true)
      const mockDb = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                delete: deleteDoc,
              }),
            }),
          }),
        }),
      }

      const resMail = await disconnectEmailChannel({ db: mockDb, user: { uid: 'u1' } })
      expect(resMail.ok).toBe(true)

      const resLi = await disconnectLinkedInChannel({ db: mockDb, user: { uid: 'u1' } })
      expect(resLi.ok).toBe(true)
      expect(deleteDoc).toHaveBeenCalledTimes(2)
    })
  })

  describe('getLinkedInAuthUrl', () => {
    it('generates oauth url using helper', () => {
      const mockAuthorizeUrl = vi.fn().mockReturnValue('https://linkedin.com/oauth')
      const mockEncrypt = vi.fn().mockReturnValue('state_123')

      const res = getLinkedInAuthUrl({
        user: { uid: 'u1' },
        baseUrl: 'https://example.com',
        linkedinAuthorizeUrlFn: mockAuthorizeUrl,
        encryptFn: mockEncrypt,
      })

      expect(res.url).toBe('https://linkedin.com/oauth')
      expect(mockAuthorizeUrl).toHaveBeenCalledWith('state_123', 'https://example.com/api/auth/linkedin/callback')
    })
  })
})

