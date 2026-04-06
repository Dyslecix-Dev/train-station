import { describe, expect, it, vi } from "vitest";

const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockCreateSignedUrl = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    storage: {
      from: () => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
        createSignedUrl: mockCreateSignedUrl,
      }),
    },
  }),
}));

import { beforeEach } from "vitest";

import { deleteFile, getPublicUrl, getSignedUrl, uploadFile } from "@/lib/storage";

describe("uploadFile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uploads a file and returns the path", async () => {
    mockUpload.mockResolvedValueOnce({ data: { path: "user/123.png" }, error: null });
    const file = new File(["test"], "test.png", { type: "image/png" });
    const result = await uploadFile("exercise-images", "user/123.png", file);
    expect(result).toEqual({ path: "user/123.png" });
    expect(mockUpload).toHaveBeenCalledWith("user/123.png", file, { upsert: true });
  });

  it("throws on upload error", async () => {
    mockUpload.mockResolvedValueOnce({ data: null, error: new Error("Upload failed") });
    const file = new File(["test"], "test.png");
    await expect(uploadFile("bucket", "path", file)).rejects.toThrow("Upload failed");
  });
});

describe("deleteFile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a file without error", async () => {
    mockRemove.mockResolvedValueOnce({ error: null });
    await expect(deleteFile("bucket", "path.png")).resolves.toBeUndefined();
    expect(mockRemove).toHaveBeenCalledWith(["path.png"]);
  });

  it("throws on delete error", async () => {
    mockRemove.mockResolvedValueOnce({ error: new Error("Not found") });
    await expect(deleteFile("bucket", "path.png")).rejects.toThrow("Not found");
  });
});

describe("getPublicUrl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the public URL", async () => {
    mockGetPublicUrl.mockReturnValueOnce({ data: { publicUrl: "https://example.com/img.png" } });
    const url = await getPublicUrl("bucket", "img.png");
    expect(url).toBe("https://example.com/img.png");
  });
});

describe("getSignedUrl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a signed URL with default expiry", async () => {
    mockCreateSignedUrl.mockResolvedValueOnce({ data: { signedUrl: "https://example.com/signed" }, error: null });
    const url = await getSignedUrl("bucket", "path.png");
    expect(url).toBe("https://example.com/signed");
    expect(mockCreateSignedUrl).toHaveBeenCalledWith("path.png", 3600);
  });

  it("accepts custom expiry", async () => {
    mockCreateSignedUrl.mockResolvedValueOnce({ data: { signedUrl: "https://example.com/signed" }, error: null });
    await getSignedUrl("bucket", "path.png", 7200);
    expect(mockCreateSignedUrl).toHaveBeenCalledWith("path.png", 7200);
  });

  it("throws on signed URL error", async () => {
    mockCreateSignedUrl.mockResolvedValueOnce({ data: null, error: new Error("Expired") });
    await expect(getSignedUrl("bucket", "path.png")).rejects.toThrow("Expired");
  });
});
