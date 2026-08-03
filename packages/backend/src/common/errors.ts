export type ErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "CONFLICT";

/** Domain error raised by the business layer, mapped to HTTP by the service layer. */
export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super("BAD_REQUEST", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super("NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message);
  }
}
