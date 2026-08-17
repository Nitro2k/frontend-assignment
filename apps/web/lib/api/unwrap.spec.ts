import { describe, expect, it } from "vitest";

import { ApiError, unwrap } from "./unwrap";

describe("[1] unwrap", () => {
  it("[1.1] returns data on success", () => {
    expect(unwrap({ data: { id: "1" }, error: null })).toEqual({ id: "1" });
  });

  it("[1.2] throws ApiError with the backend message and status on failure", () => {
    expect(() =>
      unwrap({
        data: null,
        error: { status: 409, value: { message: "Cart is empty" } },
      }),
    ).toThrow(ApiError);

    try {
      unwrap({
        data: null,
        error: { status: 409, value: { message: "Cart is empty" } },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(409);
      expect((error as ApiError).message).toBe("Cart is empty");
    }
  });

  it("[1.3] falls back to a generic message when the error body has no message field", () => {
    try {
      unwrap({ data: null, error: { status: 500, value: {} } });
    } catch (error) {
      expect((error as ApiError).message).toBe("Request failed");
    }
  });
});
