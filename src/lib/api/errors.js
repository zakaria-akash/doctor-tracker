// Keep the backend error shape available to server and browser callers.
export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload?.code;
    this.fieldErrors = payload?.details?.fieldErrors ?? {};
  }
}
