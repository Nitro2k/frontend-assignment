export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type EdenResult<T> =
  | { data: T; error: null }
  | { data: null; error: { status: number; value: unknown; message?: string } };

export function unwrap<T>(result: EdenResult<T>): T {
  if (result.error) {
    const { status, value } = result.error;
    const message =
      typeof value === "object" && value !== null && "message" in value
        ? String((value as { message: unknown }).message)
        : (result.error.message ?? "Request failed");

    throw new ApiError(status, message);
  }

  return result.data;
}
