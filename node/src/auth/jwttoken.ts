import { sign, verify } from "jsonwebtoken";

/**
 *
 * This class creates and perform basic operations
 * on JWT tokens.
 *
 */
export class JwtToken {

  /**
   *
   * Secret.
   *
   */
  private _secret: string;

  /**
   *
   * Token lifespan.
   *
   */
  private _tokenLifespan: string;

  /**
   *
   * Constructor.
   *
   * @param secret                  The secret for the token.
   * @param tokenLifespan           The token lifespan.
   *
   */
  constructor(
    secret: string,
    tokenLifespan: string
  ) {

    this._secret = secret;
    this._tokenLifespan = tokenLifespan;

  }

  /**
   *
   * Returns a token.
   *
   */
  public createToken(payload: any) {

    return sign(
      payload,
      this._secret,
      { expiresIn: this._tokenLifespan}
    );

  }

  /**
   *
   * Verify a token.
   *
   * @param token         The token to verify.
   *
   */
  public verifyToken(token: string): any {

    return verify(
      token,
      this._secret
    );

  }

}
