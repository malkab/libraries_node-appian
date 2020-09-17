import * as HTTPERRORCODES from "http-status-codes";

import { AppianExpectedError } from './appianexpectederror';

/**
 *
 * This Error subclass reports any kind of expected error at the API.
 *
 * Not for HTTP error responses, use **processHttpError** for that. This class
 * just defines the error to be processed and later output.
 *
 */
export class ApiError extends AppianExpectedError {

  /**
   *
   * The HTTP status, if any.
   *
   */
  private _httpStatus: number;

  /**
   *
   * The HTTP status, if any.
   *
   */
  get httpStatus(): number { return this._httpStatus; }

  /**
   *
   * The status text.
   *
   */
  get httpStatusText(): string {
    return HTTPERRORCODES.getStatusText(this._httpStatus);
  }

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
      module,
      payload = null,
      logPayload = payload,
      error,
      httpStatus = HTTPERRORCODES.INTERNAL_SERVER_ERROR
    }: {
      module?: string;
      payload?: any;
      logPayload?: any;
      error?: Error;
      /**
       *
       * The status of the HTTP request, if any. Defaults to
       * HTTPERRORCODES.INTERNAL_SERVER_ERROR. Codes and descriptions come from
       * the http-status-codes library. Common error codes are 406 (BAD_REQUEST)
       * and 500 (the default, INTERNAL_SERVER_ERROR).
       *
       */
      httpStatus?: number;
    }
  ) {

    super({
      error: error,
      logPayload: logPayload,
      module: module,
      payload: payload
    })

    this._httpStatus = httpStatus;

  }

}
