import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/newsletter/route";

describe("newsletter endpoint", () => {
  it("rejects invalid email input", async () => {
    const response = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    }));
    expect(response.status).toBe(400);
  });

  it("does not claim success when the subscription service is missing", async () => {
    const response = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "reader@example.com" }),
    }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ message: expect.stringContaining("not saved") });
  });
});
