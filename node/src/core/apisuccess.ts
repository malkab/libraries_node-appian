/**
 *
 * This class stores the information of a successfull HTTP response.
 *
 */
export class ApiSuccess {

  /**
   *
   * The module name the response was generated in.
   *
   */
  get module(): string { return this._module; }
  private _module: string;

  /**
   *
   * The payload of the success.
   *
   */
  get payload(): any { return this._payload; }
  private _payload: any;

  /**
   *
   * The payload log of the success. Defauts to the payload itself,
   * but if it is too long, this allows for providing a bit of detail
   * without mangling the log.
   *
   */
  get logPayload(): any { return this._logPayload; }
  private _logPayload: any;

  /**
   *
   * Optional file name. If provided, it signals that the request result is to
   * be provided as a JSON file.
   *
   */
  get fileName(): string | undefined { return this._fileName; }
  private _fileName: string | undefined;

  /**
   *
   * Constructor. To use in a class, import the HttpStatusCodes
   * library to access standard error codes descriptions:
   *
   * ```TypeScript
   * import * as HTTPERRORCODES from "http-status-codes";
   * ```
   *
   * Most common codes used are:
   *
   * - 406: BAD_REQUEST, imply an error on part of the API user,
   * for example, trying to retrieve a data that doesn't exists;
   * - 500: INTERNAL_SERVER_ERROR, the default for this error,
   * implies an uncontrolled and unforeseen error at the server.
   *
   * @param module
   * The module where the error is thrown in.
   *
   * @param payload
   * The result of the operation. This can be huge, so it won't be logged.
   *
   * @param logPayload
   * **Optional**. An optional set of data for logging, if any. Defaults to the
   * payload itself, but if this is too big, this can provide details without
   * mangling the log.
   *
   * @param fileName
   * **Optional**. If provided, it signals that the result of the request is to
   * be provided as a JSON file.
   *
   */
  constructor({
      module,
      payload = undefined,
      logPayload = payload,
      fileName = undefined
    }: {
      module: string;
      payload?: any;
      logPayload?: any;
      fileName?: string;
    }
  ) {

    this._module = module;
    this._payload = payload;
    this._logPayload = logPayload;
    this._fileName = fileName;

  }

}
