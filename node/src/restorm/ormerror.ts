import { EORMERRORCODES } from "./eormerrorcodes";

/**
 *
 * Error for ORM operations.
 *
 */
export class OrmError extends Error {

  /**
   *
   * The ORM error code.
   *
   */
  get code(): EORMERRORCODES { return this._code }
  private _code: EORMERRORCODES;

  /**
   *
   * The original error.
   *
   */
  get error(): Error { return this._error }
  private _error: Error;

  /**
   *
   * Constructor.
   *
   */
  constructor({
      code,
      message,
      error
    }: {
      code: EORMERRORCODES;
      message: string;
      error: any;
  }) {

    super(message);

    this._code = code;
    this._error = error;

  }

}
