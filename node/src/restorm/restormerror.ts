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
  get restOrmCode(): string { return this._restOrmCode; }
  private _restOrmCode: ERESTORMERRORCODES;

  /**
   *
   * The error code text.
   *
   */
  get restOrmCodeText(): string { return ERESTORMERRORCODES[this._restOrmCode]; }

  /**
   *
   * Constructor.
   *
   * @param __namedParameters
   * Error options.
   *
   * @param module
   * The module where the error is thrown in.
   *
   * @param payload
   * An optional payload for greater detail.
   *
   * @param logPayload
   * An optional payload for the log. This should not be too long. Equals the
   * payload by default.
   *
   * @param error
   * Any other error being thrown and intercepted by this ApiError.
   *
   * @param code
   * A member of EPERSISTENCEERRORCODES describing the nature of the error.
   *
   */
  constructor({
      error,
      restOrmModule,
      restOrmPayload,
      restOrmLogPayload = restOrmPayload,
      restOrmCode = ERESTORMERRORCODES.INTERNAL_ERROR
    }: {
      error: Error;
      restOrmModule?: string;
      restOrmPayload?: any;
      restOrmLogPayload?: any;
      restOrmCode: ERESTORMERRORCODES;
    }
  ) {

    super({
      error: error,
      appianExpectedErrorLogPayload: restOrmLogPayload,
      appianExpectedErrorModule: restOrmModule,
      appianExpectedErrorPayload: restOrmPayload
    })

    Object.assign(this, error);

    this._restOrmCode = restOrmCode;

  }

}
