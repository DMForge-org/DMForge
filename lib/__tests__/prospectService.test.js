import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProspect,
  listProspects,
  getProspectWithMessages,
  updateProspect,
  deleteProspect,
  addProspectMessage,
  getOrCreateInboundToken,
  ingestInboundReply,
} from "../services/prospectService";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors";

vi.mock("@/lib/prospects", () => ({
  PROSPECT_STATUSES: [
    "new",
    "contacted",
    "replied",
    "qualified",
    "booked",
    "lost",
  ],
  PROSPECT_CHANNELS: ["instagram", "messenger", "email", "sms", "manual"],
  normalizeStatus: (s, fallback = "new") =>
    ["new", "contacted", "replied", "qualified", "booked", "lost"].includes(s)
      ? s
      : fallback,
  normalizeChannel: (c, fallback = "manual") =>
    ["instagram", "messenger", "email", "sms", "manual"].includes(c) ? c : fallback,
  onProspectBooked: vi.fn(),
}));

import { onProspectBooked } from "@/lib/prospects";

describe("Prospect Service (lib/services/prospectService.js)", () => {
  let mockDb;
  let mockFieldValue;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFieldValue = {
      serverTimestamp: vi.fn().mockReturnValue("TIMESTAMP"),
    };
  });

  describe("createProspect", () => {
    it("creates a prospect successfully", async () => {
      const mockSet = vi.fn().mockResolvedValue({});
      mockDb = {
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({
            collection: vi.fn().mockReturnValue({
              doc: vi.fn().mockReturnValue({ set: mockSet }),
            }),
          }),
        }),
      };

      const res = await createProspect({
        db: mockDb,
        FieldValue: mockFieldValue,
        uid: "user-1",
        body: { name: "Lead 1", channel: "instagram" },
      });

      expect(res.id).toBeDefined();
      expect(res.prospect.name).toBe("Lead 1");
      expect(res.prospect.channel).toBe("instagram");
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("throws UnauthorizedError if uid is missing", async () => {
      await expect(
        createProspect({
          db: {},
          FieldValue: mockFieldValue,
          uid: null,
          body: {},
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("updateProspect", () => {
    it("updates prospect and triggers onProspectBooked when transitioning to booked", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({});
      const prevData = {
        status: "qualified",
        name: "John Coach",
        scheduledAt: null,
      };
      const freshData = {
        status: "booked",
        name: "John Coach",
        scheduledAt: "2026-10-01T14:00:00Z",
      };

      const mockDocRef = {
        get: vi
          .fn()
          .mockResolvedValueOnce({ exists: true, data: () => prevData })
          .mockResolvedValueOnce({ exists: true, data: () => freshData }),
        update: mockUpdate,
      };

      mockDb = {
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({
            collection: vi.fn().mockReturnValue({
              doc: vi.fn().mockReturnValue(mockDocRef),
            }),
          }),
        }),
      };

      const mockAfter = vi.fn((fn) => fn());

      const res = await updateProspect({
        db: mockDb,
        FieldValue: mockFieldValue,
        uid: "user-1",
        prospectId: "p-1",
        body: { status: "booked", scheduledAt: "2026-10-01T14:00:00Z" },
        after: mockAfter,
        ser: (d) => d.data(),
      });

      expect(res.booked).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockAfter).toHaveBeenCalledTimes(1);
      expect(onProspectBooked).toHaveBeenCalledTimes(1);
    });
  });

  describe("getOrCreateInboundToken", () => {
    it("creates and returns an inbound token for user", async () => {
      const mockUserSet = vi.fn().mockResolvedValue({});
      const mockTokenSet = vi.fn().mockResolvedValue({});

      mockDb = {
        collection: vi.fn((name) => {
          if (name === "users") {
            return {
              doc: vi.fn().mockReturnValue({
                get: vi
                  .fn()
                  .mockResolvedValue({ exists: true, data: () => ({}) }),
                set: mockUserSet,
              }),
            };
          }
          if (name === "inbound_tokens") {
            return {
              doc: vi.fn().mockReturnValue({ set: mockTokenSet }),
            };
          }
          return {};
        }),
      };

      const res = await getOrCreateInboundToken({
        db: mockDb,
        FieldValue: mockFieldValue,
        uid: "user-1",
        baseUrl: "http://localhost:3000",
      });

      expect(res.token).toHaveLength(48); // 24 bytes hex
      expect(res.url).toContain(`/api/inbound/${res.token}`);
      expect(mockUserSet).toHaveBeenCalledTimes(1);
      expect(mockTokenSet).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteProspect", () => {
    it("deletes prospect and subcollection messages in a batch", async () => {
      const mockBatchDelete = vi.fn();
      const mockBatchCommit = vi.fn().mockResolvedValue({});

      const mockDocRef = {
        collection: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            docs: [{ ref: "msg-ref-1" }, { ref: "msg-ref-2" }],
          }),
        }),
      };

      mockDb = {
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({
            collection: vi.fn().mockReturnValue({
              doc: vi.fn().mockReturnValue(mockDocRef),
            }),
          }),
        }),
        batch: vi.fn().mockReturnValue({
          delete: mockBatchDelete,
          commit: mockBatchCommit,
        }),
      };

      const res = await deleteProspect({
        db: mockDb,
        uid: "user-1",
        prospectId: "p-1",
      });

      expect(res.ok).toBe(true);
      expect(mockBatchDelete).toHaveBeenCalledTimes(3); // 2 messages + 1 prospect
      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });
  });
});
