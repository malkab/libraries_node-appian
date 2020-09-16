/**
 *
 * This class is used to model errors that are expected and controlled.
 *
 */
export class AppianExpectedError extends Error {

  /**
   *
   * A member to identify this is an AppianExpectedError.
   *
   */
  get isAppianExpectedError(): boolean { return true; }

  /**
   *
   * The module name the error was thrown in.
   *
   */
  private _module: string;

  /**
   *
   * The module name the error was thrown in.
   *
   */
  get module(): string { return this._module; }

  /**
   *
   * The error payload. This is a set of data to better interpret the error.
   *
   */
  private _payload: any;

  /**
   *
   * The error payload. This is a set of data to better interpret the error.
   *
   */
  get payload(): any { return this._payload; }

  /**
   *
   * The payload log of the success. Defauts to the payload itself,
   * but if it is too long, this allows for providing a bit of detail
   * without mangling the log.
   *
   */
  private _logPayload: any;

  /**
   *
   * The payload log of the success. Defauts to the payload itself,
   * but if it is too long, this allows for providing a bit of detail
   * without mangling the log.
   *
   */
  get logPayload(): any { return this._logPayload; }

  /**
   *
   * External error intercepted by this ApiError.
   *
   */
  get error(): any { return this._error; }

  /**
   *
   * External error intercepted by this ApiError.
   *
   */
  private _error: any;

  /**
   *
   * Constructor. To use in a class, import the HttpStatusCodes library to
   * access standard error codes descriptions:
   *
   * ```TypeScript
   * import * as HTTPERRORCODES from "http-status-codes";
   * ```
   *
   * Most common codes used are:
   *
   * - 406: BAD_REQUEST, imply an error on part of the API user, for example,
   *   trying to retrieve a data that doesn't exists;
   * - 500: INTERNAL_SERVER_ERROR, the default for this error, implies an
   *   uncontrolled and unforeseen error at the server.
   *
   * @param __namedParameters Error options.
   * @param module            The module where the error is thrown in.
   * @param logPayload        An optional payload for the log. This should not
   *                          be too long. Equals the payload by default.
   * @param payload           An optional payload for greater detail.
   * @param error             Any other error being thrown and intercepted by
   *                          this ApiError.
   * @param httpStatus        The status of the HTTP request, if any. Defaults
   *                          to HTTPERRORCODES.INTERNAL_SERVER_ERROR. Codes and
   *                          descriptions come from the http-status-codes
   *                          library. Common error codes are 406 (BAD_REQUEST)
   *                          and 500 (the default, INTERNAL_SERVER_ERROR).
   *
   */
  constructor({
      module = null,
      payload = null,
      logPayload = payload,
      error = null
    }: {
      module?: string;
      payload?: any;
      logPayload?: any;
      error?: Error;
    }
  ) {

    super(error.message);

    this._module = module;
    this._payload = payload;
    this._logPayload = logPayload;
    this._error = error;

  }

}
