import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  connectEmailChannel,
  disconnectEmailChannel,
  listChannels,
  sendEmailOutreach,
  connectInstagramChannel,
  disconnectInstagramChannel,
  connectMessengerChannel,
  disconnectMessengerChannel,
  sendMetaOutreach,
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
    it('strips encryptedCreds from channels list', async () => {
      const mockDocs = [
        {
          id: 'email',
          data: () => ({
            provider: 'gmail',
            email: 'me@gmail.com',
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

      const res = await listChannels({ db: mockDb, user: { uid: 'u1' } })
      expect(res.channels).toHaveLength(1)
      expect(res.channels[0].id).toBe('email')
      expect(res.channels[0].encryptedCreds).toBeUndefined()
      expect(res.channels[0].email).toBe('me@gmail.com')
    })
  })

  describe('connectInstagramChannel', () => {
    it('throws on invalid input', async () => {
      await expect(
        connectInstagramChannel({ db: {}, FieldValue: fakeFieldValue, user: { uid: 'u1' }, body: {} })
      ).rejects.toThrow(ValidationError)
    })

    it('connects instagram channel and writes meta index on valid credentials', async () => {
      const setDoc = vi.fn().mockResolvedValue(true)
      const mockDb = {
        collection: (col) => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                set: setDoc,
              }),
            }),
            set: setDoc,
          }),
        }),
      }

      const mockVerify = vi.fn().mockResolvedValue({ id: '178414', username: 'coach_jane', name: 'Jane Coach' })
      const mockEncrypt = vi.fn().mockReturnValue('encrypted_meta')

      const res = await connectInstagramChannel({
        db: mockDb,
        FieldValue: fakeFieldValue,
        user: { uid: 'u1' },
        body: { pageAccessToken: 'tok_123', instagramAccountId: '178414' },
        verifyInstagramFn: mockVerify,
        encryptFn: mockEncrypt,
      })

      expect(res.success).toBe(true)
      expect(res.account.username).toBe('coach_jane')
      expect(setDoc).toHaveBeenCalledTimes(2) // channel doc + meta_channel_index
    })
  })

  describe('connectMessengerChannel', () => {
    it('connects messenger channel on valid page token', async () => {
      const setDoc = vi.fn().mockResolvedValue(true)
      const mockDb = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                set: setDoc,
              }),
            }),
            set: setDoc,
          }),
        }),
      }

      const mockVerify = vi.fn().mockResolvedValue({ id: 'page_456', name: 'Fitness Coaching Page' })
      const mockEncrypt = vi.fn().mockReturnValue('encrypted_meta_page')

      const res = await connectMessengerChannel({
        db: mockDb,
        FieldValue: fakeFieldValue,
        user: { uid: 'u1' },
        body: { pageAccessToken: 'tok_456', pageId: 'page_456' },
        verifyPageFn: mockVerify,
        encryptFn: mockEncrypt,
      })

      expect(res.success).toBe(true)
      expect(res.page.name).toBe('Fitness Coaching Page')
      expect(setDoc).toHaveBeenCalledTimes(2)
    })
  })

  describe('disconnectInstagramChannel and disconnectMessengerChannel', () => {
    it('deletes channels and removes index entries', async () => {
      const deleteDoc = vi.fn().mockResolvedValue(true)
      const mockGet = vi.fn().mockResolvedValue({ exists: true, data: () => ({ instagramAccountId: '178414', pageId: 'page_456' }) })
      const mockDb = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                get: mockGet,
                delete: deleteDoc,
              }),
            }),
            delete: deleteDoc,
          }),
        }),
      }

      const resIg = await disconnectInstagramChannel({ db: mockDb, user: { uid: 'u1' } })
      expect(resIg.ok).toBe(true)

      const resFb = await disconnectMessengerChannel({ db: mockDb, user: { uid: 'u1' } })
      expect(resFb.ok).toBe(true)
      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  describe('sendMetaOutreach', () => {
    it('dispatches outbound message via Meta Graph API', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          connected: true,
          encryptedCreds: 'enc_creds',
        }),
      })
      const mockDb = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                get: mockGet,
              }),
            }),
          }),
        }),
      }

      const mockDecrypt = vi.fn().mockReturnValue(JSON.stringify({ pageAccessToken: 'token', pageId: '123' }))
      const mockSend = vi.fn().mockResolvedValue({ success: true, messageId: 'mid_999' })

      const res = await sendMetaOutreach({
        db: mockDb,
        user: { uid: 'u1' },
        channel: 'messenger',
        body: { recipientId: 'user_psid_1', message: 'Hello from coach!' },
        decryptFn: mockDecrypt,
        sendMetaMessageFn: mockSend,
      })

      expect(res.sent).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'user_psid_1',
          message: 'Hello from coach!',
          channel: 'messenger',
        })
      )
    })
  })
})
