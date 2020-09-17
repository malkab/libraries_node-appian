import { AppianExpectedError } from '../core/appianexpectederror';

/**
 *
 * This enum summarizes persistence errors that persistence operations **get$**,
 * **create$**, **update$**, and **delete$** must output.
 *
 */
export enum ERESTORMERRORCODES {

  /**
   *
   * The reference for a newly created object is duplicated at the persistence
   * system and therefore rejected.
   *
   */
  DUPLICATED = "DUPLICATED",
  /**
   *
   * The reference for getting an object is not found at the persistence system.
   *
   */
  NOT_FOUND = "NOT_FOUND",
  /**
   *
   * There was an internal, non-described, error at the persistence system.
   *
   */
  INTERNAL_ERROR = "INTERNAL_ERROR"

}


/**
 *
 * This class describes persistence errors.
 *
 */
export class RestOrmError extends AppianExpectedError {

  /**
   *
   * The error code.
   *
   */
  get code(): string { return this._code; }

  private _code: ERESTORMERRORCODES;

  /**
   *
   * The error code text.
   *
   */
  get codeText(): string { return ERESTORMERRORCODES[this._code]; }

  /**
   *
   * Constructor.
   *
   * @param __namedParameters Error options.
   * @param module            The module where the error is thrown in.
   * @param payload           An optional payload for greater detail.
   * @param logPayload        An optional payload for the log. This should not
   *                          be too long. Equals the payload by default.
   * @param error             Any other error being thrown and intercepted by
   *                          this ApiError.
   * @param code              A member of EPERSISTENCEERRORCODES describing the
   *                          nature of the error.
   *
   */
  constructor({
      module,
      payload = null,
      logPayload = payload,
      error,
      code = ERESTORMERRORCODES.INTERNAL_ERROR
    }: {
      /**
       *
       * The module where the error is thrown in.
       *
       */
      module?: string;
      /**
       *
       * An optional payload for greater detail.
       *
       */
      payload?: any;
      /**
       *
       * An optional payload for the log. This should not
       * be too long. Equals the payload by default.
       */
      logPayload?: any;
      /**
       *
       * Any other error being thrown and intercepted by this ApiError.
       *
       */
      error?: Error;
      /**
       *
       * A member of EPERSISTENCEERRORCODES describing the nature of the error.
       *
       */
      code: ERESTORMERRORCODES;
    }
  ) {

    super({
      error: error,
      logPayload: logPayload,
      module: module,
      payload: payload
    })

    this._code = code;

  }

}
