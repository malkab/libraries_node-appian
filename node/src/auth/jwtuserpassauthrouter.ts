import { Request, Response } from "express";

import { ApiSuccess } from "../core/apisuccess";

import { NodeLogger } from "@malkab/node-logger";

import { JwtToken } from "./jwttoken";

import { ApiRouter } from "../core/apirouter";

import { addMetadata, httpSuccess } from "../core/httpserver";

import { StatusCodes } from "http-status-codes";

import { bearerAuth } from "./bearerauth";

import * as rxo from "rxjs/operators";

import * as rx from "rxjs";

/**
 *
 * This is a helper router implementing a user / password authorization with an
 * Access / Refresh token schema over JWT.
 *
 * This router implements several entries. The names shown are the default ones,
 * they are configurable at the constructor:
 *
 * - **\/login:** unprotected, allows a POST of { user: string, pass: string }
 *   to log in the user and issue an Access Token and a cookie with the Refresh
 *   Token. The logic to validate user / pass lies in the **loginFunction**, a
 *   function supplied to the constructor that must consume a generic object
 *   parameter in the form { user: string; pass: string; ...additionalParams:
 *   any; } and returns an Observable<boolean> with the validation result;
 *
 * - **\/logout:** protected, logs out the user, deleting the cookie with the
 *   RefreshToken. There is no logic function to be supplied;
 *
 * - **\/refresh:** unprotected, allows the client to get a new Access Token
 *   presenting the Refresh Token from the cookie. The logic for validating the
 *   Refresh Token is stored in a supplied function that consume a generic
 *   object parameter in the form { user: string; pass: string;
 *   ...additionalParams: any; } and returns an Observable<boolean> with the
 *   validation result. If validated, a new Access Token is issued to the
 *   client;
 *
 *
 * HERE HERE HERE
 *
 *
 * These are the auth functions for the JwtUserPassAuthRouter. The
 * authentication process User/pass/token follows the following procedure:
 *
 * - the user uses the JwtUserPassAuthRouter/login API entry to pass user and
 *   pass to get an Access Token, and also to get a cookie with the Refresh
 *   Token;
 *
 * - this Access Token must be provided by client as a Bearer to gain access to
 *   restricted API entries;
 *
 * - once this Access Token expires, the clients will access the
 *   JwtUserPassAuthRouter/refresh to refresh the Access Token by checking the
 *   Refresh token at the cookie with the one at the database. This will grant
 *   the user automatically a new Access Token. Once the Refresh Token expires,
 *   the user is forced to log in again;
 *
 * The JwtUserPassAuthRouter is a generic router and must be provided with the
 * functions shown here:
 *
 * - the loginFunction handles the logic for checking user and password and
 *   validate them. It gets fixed parameters user and pass and optionally others
 *   in a generic object, and must return an Observable<boolean> that determines
 *   if the user / pass matches an user;
 *
 * - the refreshTokenStoreFunction handles the logic of storing the Refresh
 *   Token into the persistence system for a user. It pass in a generic object
 *   the user, the refresh token, and any optional parameters and must return an
 *   Observable<boolean> if the process was successfull;
 *
 * - the refreshFunction handles the logic of getting (in a generic object) the
 *   Refresh Token from the cookie and checks if it is a legitimate one,
 *   returning an Observable<boolean>.
 *
 * Once the client has an Access Token from whatever the means, this token is
 * going to be confronted against another function, in this case the function
 * **validateToken** here, that will receive the decrypted content of the token
 * and validate it, returning Observable<any>. It will return null if not
 * validated, but if returning anything different from null, it will be attached
 * to **request.appianAuth** for future reference.
 *
 */
export class JwtUserPassAuthRouter extends ApiRouter {

  /**
   *
   * The name of the cookie with the refresh token.
   *
   */
  private _cookieName: string;

  /**
   *
   * Additional params for the login and refresh functions.
   *
   */
  private _additionalParams: any;

  /**
   *
   * The login function.
   *
   */
  private _loginFunction: (params: any) => rx.Observable<boolean>;

  /**
   *
   * The refresh token store function.
   *
   */
  private _refreshTokenStoreFunction: (params: any) => rx.Observable<boolean>;

  /**
   *
   * The refresh function.
   *
   */
  private _refreshFunction: (params: any) => rx.Observable<boolean>;

  /**
   *
   * Validate function.
   *
   */
  private _validateFunction: (params: any) => rx.Observable<any>;

  /**
   *
   * Login entry URL.
   *
   */
  private _loginEntryUrl: string;

  /**
   *
   * Logout entry URL.
   *
   */
  private _logoutEntryUrl: string;

  /**
   *
   * Refresh token entry URL.
   *
   */
  private _refreshEntryUrl: string;

  /**
   *
   * The access token.
   *
   */
  private _accessToken: JwtToken;
  get accessToken(): JwtToken { return this._accessToken }

  /**
   *
   * The refresh token.
   *
   */
  private _refreshToken: JwtToken;

  /**
   *
   * Constructor.
   *
   * @param __namedParameters     Logging options.
   * @param loginFunction         A function that gets the user, the pass, and
   *                              the optional parameters defined at
   *                              additionalParams and must return an
   *                              Observable<boolean> that determines if the
   *                              user / pass match an existing user. The
   *                              function will receive an structure in the form
   *                              { user: string; pass: string;
   *                              ...additionalParams: any } as parameter.
   * @param refreshTokenFunction  A function that gets the user, the refresh
   *                              token and the optional parameters defined at
   *                              additionalParams and must return an
   *                              Observable<boolean> that determines if the
   *                              refresh token storing process was successfull.
   *                              The function will receive an structure in the
   *                              form { user: string; token: string;
   *                              ...additionalParams; } as parameter.
   * @param refreshFunction       A function that gets a token stored in a
   *                              cookie and the optional parameters defined at
   *                              additionalParams and must return an
   *                              Observable<boolean> to determine of the
   *                              refresh token at the cookie is valid, if it
   *                              exists at the storage system and matches the
   *                              intended user. The function will receive an
   *                              structure in the form { token: string;
   *                              ...additionalParams; } as parameter.
   * @param validateFunction      The validate auth function. This function is
   *                              used at the bearerAuth middleware to check if
   *                              the given token information coming from the
   *                              protected API entries makes sense when
   *                              confronted against an user at the database.
   *                              Returns anything not null for a successfull
   *                              validation or null otherwise. The not-null
   *                              response is stored at request.appianAuth for
   *                              convenience. This only affect the access token
   *                              validation, has nothing to do with the refresh
   *                              token. The refresh token is used exclusively
   *                              to get a new access token without log in
   *                              again.
   * @param accessTokenLifespan   Life span of the access token, e.g. '15m'.
   *                              Defaults to '30s' (for development).
   * @param accessTokenSecret     The secret for the access token. Defaults to
   *                              a fixed string for development.
   * @param refreshTokenLifespan  Life span of the refresh token, e.g. '7d'.
   *                              Defaults to '1m' (for development).
   * @param refreshTokenSecret    The secret for the refresh token. Defaults to
   *                              a fixed string for development.
   * @param urlBaseRoot           The base root for the router. Defaults to '/'.
   * @param log                   A Log object for automatic logging.
   * @param additionalParams      Any additional params needed for the
   *                              loginFunction and the refreshFunction to work.
   *
   */
  constructor({
    loginFunction,
    refreshTokenStoreFunction,
    refreshFunction,
    validateFunction,
    cookieName,
    accessTokenLifespan = "30s",
    accessTokenSecret = "accessTokenSecret",
    refreshTokenLifespan = "1m",
    refreshTokenSecret = "refreshTokenSecret",
    urlBaseRoot = "/auth",
    log,
    additionalParams = null,
    loginEntryUrl = "/login",
    logoutEntryUrl = "/logout",
    refreshEntryUrl = "/refresh",
    moduleName = "auth"
  }: {
    loginFunction: (params: any) => rx.Observable<boolean>;
    refreshTokenStoreFunction: (params: any) => rx.Observable<boolean>;
    refreshFunction: (params: any) => rx.Observable<boolean>;
    validateFunction: (params: any) => rx.Observable<any>;
    cookieName: string;
    accessTokenLifespan?: string;
    accessTokenSecret?: string;
    refreshTokenLifespan?: string;
    refreshTokenSecret?: string;
    urlBaseRoot?: string;
    log?: NodeLogger;
    additionalParams?: any;
    loginEntryUrl?: string;
    logoutEntryUrl?: string;
    refreshEntryUrl?: string;
    moduleName?: string;
  }) {

    super({
      module: moduleName,
      urlBaseRoot: urlBaseRoot,
      log: log
    });

    this._loginFunction = loginFunction;
    this._refreshTokenStoreFunction = refreshTokenStoreFunction;
    this._refreshFunction = refreshFunction;
    this._validateFunction = validateFunction;
    this._accessToken = new JwtToken(accessTokenSecret, accessTokenLifespan);
    this._refreshToken = new JwtToken(refreshTokenSecret, refreshTokenLifespan);
    this._additionalParams = additionalParams;
    this._loginEntryUrl = loginEntryUrl;
    this._logoutEntryUrl = logoutEntryUrl;
    this._refreshEntryUrl = refreshEntryUrl;
    this._cookieName = cookieName;

    // Configure routes, this must be the last call here
    this._configureRouter();

  }

  /**
   *
   * Here the routes are configured.
   *
   */
  protected _configureRouter(): void {

    /**
     *
     * Login.
     *
     */
    this.router.post(this._loginEntryUrl,
    addMetadata(this.module, this.log),
    (req: Request, res: Response) => {

      // Get authorization data
      const user: string = req.body.user;
      const pass: string = req.body.pass;

      // The tokens
      let accessToken: string;
      let refreshToken: string;

      // Check user and pass
      this._loginFunction({ user: user, pass: pass, ...this._additionalParams })
      .pipe(

        // Validate login
        rxo.concatMap((o: boolean) => {

          if (o) {

            // The user was successfully logged, create tokens
            accessToken = this._signAccessToken(user);
            refreshToken = this._signRefreshToken(user);

            // Store the refresh token
            return this._refreshTokenStoreFunction({
              user: user, token: refreshToken, ...this._additionalParams });

          } else {

            // Just throw an error
            throw new Error();

          }

        }),

        // Validate refresh token storage, send the cookie
        rxo.map((o: boolean) => {

          if (o) {

            res.cookie(this._cookieName, refreshToken, {
              httpOnly: true,
              path: `${this._urlBaseRoot}${this._refreshEntryUrl}`
            });

            return { accessToken: accessToken }

          } else {

            // Just throw an error
            throw new Error();

          }

        })

      )
      .subscribe(

        (o: any) => {

          httpSuccess({
            httpRequest: req,
            httpResponse: res,
            success: new ApiSuccess({
              module: this.module,
              logPayload: { user: user },
              payload: o
            }),
            log: this.log
          })

        },

        (error: any) => {

          if (this._log) {

            this._log.logError({
              message: "unauthorized",
              methodName: this._loginEntryUrl,
              moduleName: this._module,
              payload: { user: user, pass: pass,
                httpStatus: StatusCodes.UNAUTHORIZED }
            })

          }

          res.sendStatus(StatusCodes.UNAUTHORIZED);

        }

      )

    })

    /**
     *
     * Logout.
     *
     */
    this.router.post(this._logoutEntryUrl,
    bearerAuth(this._accessToken, this._validateFunction, this._additionalParams),
    addMetadata(this.module, this.log),
    (req: Request, res: Response) => {

      // Clear the cookie
      res.clearCookie(this._cookieName, {
        httpOnly: true,
        path: `${this._urlBaseRoot}${this._refreshEntryUrl}`
      });

      httpSuccess({
        httpRequest: req,
        httpResponse: res,
        success: new ApiSuccess({
          module: this.module,
          logPayload: { user: req.appianAuth },
          payload: true
        }),
        log: this.log
      })

    })

    /**
     *
     * Refresh token.
     *
     */
    this.router.get(this._refreshEntryUrl,
    addMetadata(this.module, this.log),
    (req: Request, res: Response) => {

      // Get the cookie
      let token: any = req.cookies[this._cookieName];

      // If no cookie, drop
      if (token === undefined) {

        if (this._log) {

          this._log.logError({
            message: "no cookie",
            methodName: this._refreshEntryUrl,
            moduleName: this._module,
            payload: { httpStatus: StatusCodes.UNAUTHORIZED }
          })

        }

        res.sendStatus(StatusCodes.UNAUTHORIZED);

      }

      // The error function, to not duplicate code
      const errorFunc: () => void = () => {

        if (this._log) {

          this._log.logError({
            message: "invalid cookie",
            methodName: this._refreshEntryUrl,
            moduleName: this._module,
            payload: {
              httpStatus: StatusCodes.UNAUTHORIZED
            }
          })

        }

        res.sendStatus(StatusCodes.UNAUTHORIZED);

      }

      // Try to extract the token, expiration error can raise here
      try {

        token = this._refreshToken.verifyToken(token);

        const user: string = token.user;

        // Check the users token
        this._refreshFunction({ user: user, ...this._additionalParams })
        .subscribe(

          (o: any) => {

            // The refresh token exists
            if (o) {

              // Sign a new token
              const accessToken: string = this._signAccessToken(user);

              httpSuccess({
                httpRequest: req,
                httpResponse: res,
                success: new ApiSuccess({
                  module: this.module,
                  logPayload: { user: user },
                  payload: { accessToken: accessToken }
                }),
                log: this.log
              })

            } else { errorFunc(); }

          },

          (error: any) => { errorFunc() }

        )

      } catch(e) {

        errorFunc();

      }

    })

  }

  /**
   *
   * Generates an access token.
   *
   */
  private _signAccessToken(user: string): string {

    return this._accessToken.createToken({ user: user, time: Date.now() });

  }

  /**
   *
   * Generates a refresh token.
   *
   */
  private _signRefreshToken(user: any): string {

    return this._refreshToken.createToken({ user: user, time: Date.now() });

  }

  /**
   *
   * Generates a very plain unauthorized message (logging it).
   *
   */
  private _errorLogin(response: Response, user?: string, pass?: string) {

    if (this._log) {

      this._log.logError({
        message: "unauthorized",
        methodName: "/login",
        moduleName: this._module,
        payload: { user: user, pass: pass, httpStatus: StatusCodes.UNAUTHORIZED }
      })

    }

    response.sendStatus(StatusCodes.UNAUTHORIZED);

  }

}
