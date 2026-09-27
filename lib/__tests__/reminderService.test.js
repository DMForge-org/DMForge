import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  connectSMSChannel,
  disconnectSMSChannel,
  scheduleReminders,
  sendDueReminders,
} from '../services/reminderService'
import {
  ValidationError,
  UnauthorizedError,
} from '../errors'

describe('Reminder Service (lib/services/reminderService.js)', () => {
  const fakeFieldValue = {
    serverTimestamp: () => 'MOCK_TIMESTAMP',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('connectSMSChannel', () => {
    it('throws UnauthorizedError if user is not provided', async () => {
      await expect(
        connectSMSChannel({ db: {}, FieldValue: fakeFieldValue, user: null, body: {} })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('throws ValidationError if Twilio test fails', async () => {
      const mockTestTwilio = vi.fn().mockResolvedValue({ success: false, error: 'Invalid SID' })
      await expect(
        connectSMSChannel({
          db: {},
          FieldValue: fakeFieldValue,
          user: { uid: 'u1' },
          body: { accountSid: 'AC123', authToken: 'auth123', from: '+1234567890' },
          testTwilioFn: mockTestTwilio,
        })
      ).rejects.toThrow(ValidationError)
    })

    it('saves encrypted credentials when valid', async () => {
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
      const mockTestTwilio = vi.fn().mockResolvedValue({ success: true })
      const mockEncrypt = vi.fn().mockReturnValue('encrypted_str')

      const res = await connectSMSChannel({
        db: mockDb,
        FieldValue: fakeFieldValue,
        user: { uid: 'u1' },
        body: { accountSid: 'AC123', authToken: 'auth123', from: '+1234567890' },
        testTwilioFn: mockTestTwilio,
        encryptFn: mockEncrypt,
      })

      expect(res.success).toBe(true)
      expect(setDoc).toHaveBeenCalled()
      expect(mockEncrypt).toHaveBeenCalled()
    })
  })

  describe('disconnectSMSChannel', () => {
    it('deletes sms channel doc for user', async () => {
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

      const res = await disconnectSMSChannel({ db: mockDb, user: { uid: 'u1' } })
      expect(res.ok).toBe(true)
      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  describe('scheduleReminders', () => {
    it('enqueues future reminders', async () => {
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

      // Schedule 2 days ahead so both 24h and 1h reminders are in the future
      const futureDate = new Date(Date.now() + 48 * 3600_000).toISOString()
      const res = await scheduleReminders({
        db: mockDb,
        FieldValue: fakeFieldValue,
        user: { uid: 'u1' },
        body: {
          to: '+1234567890',
          scheduledAt: futureDate,
          leadName: 'Jane',
        },
      })

      expect(res.scheduled.length).toBe(2)
      expect(setDoc).toHaveBeenCalledTimes(2)
    })
  })
})

