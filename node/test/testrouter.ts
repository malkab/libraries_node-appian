import { Request, Response, ApiError, ApiSuccess, IResponsePayload, ApiRouter, addMetadata, httpError, httpSuccess, processResponse, Auth, Utils, RestOrm } from "../src/index";

import { StatusCodes } from "http-status-codes";

import * as rx from "rxjs";

import { NodeLogger } from "@malkab/node-logger";

import * as rxo from "rxjs/operators";

import { Pg } from "./pg";

import { Redis } from "./redis";

import { QueryResult, RxPg } from "@malkab/rxpg";

import { OrmTest } from "./ormtest";

/**
 *
 * The router.
 *
 */
export class TestRouter extends ApiRouter {

  /**
   *
   * PG persistence, tiny wrapper of RxPg with some SQL logic.
   *
   */
  private _pg: Pg;

  /**
   *
   * The PG connection.
   *
   */
  private _pgCon: RxPg;

  /**
   *
   * Redis persistence.
   *
   */
  private _redis: Redis;

  /**
   *
   * The JWT token.
   *
   */
  private _jwtToken: Auth.JwtToken;

  /**
   *
   * Constructor.
   *
   */
  constructor({
    pg,
    pgCon,
    redis,
    jwtToken,
    urlBaseRoot = "/",
    log = null
  }: {
    pg: Pg;
    pgCon: RxPg;
    redis: Redis;
    urlBaseRoot?: string;
    log?: NodeLogger;
    jwtToken: Auth.JwtToken;
  }) {

    super({
      module: "TestRouter",
      urlBaseRoot: urlBaseRoot,
      log: log
    });

    this._pg = pg;
    this._pgCon = pgCon;
    this._redis = redis;
    this._jwtToken = jwtToken;

    // Configure routes, this must be the last call here
    this._configureRouter();

  }

  /**
   *
   * This is the authentication function. Must return something to add to the
   * appianAuth member of Request or null if not validated.
   *
   * Here connections to the database to check user and such should be
   * performed. In this example there is no example of refreshing token, but
   * session / refresh token is a common pattern, as is the API keys.
   *
   */
  private _authentication(params: any): rx.Observable<any> {

    // Simple checking
    if (params.token.user === "user" && params.token.pass === "pass") {

      // Simulated delay
      return rx.of(
        { auth: true, user: "user", pass: "pass"}
      ).pipe(rxo.delay(250));

    } else {

      return rx.of(null);

    }

  }

  /**
   *
   * Here the routes are configured.
   *
   */
  protected _configureRouter(): void {

    const multerFile: Utils.Multer = new Utils.Multer("/data/a", true);

    const multerMemory: Utils.MulterMemory = new Utils.MulterMemory();

    /**
     *
     * Test entry. This is an automatic processing of a request adding to the
     * response a success member of class ApiSuccess. Process look for either an
     * ApiError as member res.error, an ApiSuccess as member res.success, or a
     * complex observable pipe chain as res.observable member, in this order.
     *
     */
    this.router.get(
      "/test",
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        res.appianSuccess = new ApiSuccess({
          module: this.module,
          payload: { a: 0, b: 1, c: 2 },
          logPayload: { a: 0 }
        })

        next();

      },
      processResponse({})
    );

    /**
     *
     * Test entry, non-automatic process. This is an example of completely
     * manual entry processing, calling directly the httpSuccess method to
     * produce a succesfull entry call.
     *
     */
    this.router.get(
      "/testnotautomatic",
      addMetadata(this.module, this.log),
      (req: Request, res: Response) => {

        httpSuccess({
          httpRequest: req,
          httpResponse: res,
          success: new ApiSuccess({
            module: this.module,
            logPayload: { a: 99 },
            payload: { a: 99, b: 88}
          }),
          log: this.log
        })

      }
    );

    /**
     *
     * Test error entry. An automatic error entry processing.
     *
     */
    this.router.get(
      "/testerror",
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        res.appianError = new ApiError({
          module: this.module,
          httpStatus: StatusCodes.CONFLICT,
          payload: { "message": "forced" },
          error: new Error("This is a common error")
        })

        next();

      },
      processResponse({})
    );

    /**
     *
     * Test error entry, non-automatic. A manual processing of an error.
     *
     */
    this.router.get(
      "/testerrornotautomatic",
      addMetadata(this.module, this.log),
      (req: Request, res: Response) => {

        httpError({
          error: new ApiError({
            module: this.module,
            httpStatus: StatusCodes.CONFLICT,
            payload: { "error": "forced" },
            error: new Error("This is a common error")
          }),
          httpRequest: req,
          httpResponse: res,
          doNotEchoBody: true,
          doNotEchoErrorPayload: true,
          log: this.log
        })

      }
    );

    /**
     *
     * Post file 1. Automatic processing of a file upload.
     *
     */
    this.router.post(
      "/postimage",
      addMetadata(this.module, this.log),
      multerFile.multer.single("image"),
      (req: Request, res: Response, next: any) => {

        res.appianSuccess = new ApiSuccess({
          module: this.module,
          payload: { test: "ok", name: req.file.filename },
        });

        next();

      },
      processResponse({})
    );

    /**
     *
     * Post file 2. Direct success creation.
     *
     */
    this.router.post(
      "/postimagememory",
      addMetadata(this.module, this.log),
      multerMemory.multer.single("image"),
      (req: Request, res: Response, next: any) => {

        res.appianSuccess = new ApiSuccess({
          module: this.module,
          payload: { test: "ok", size: req.file.size }
        });

        next();

      },
      processResponse({})
    );

    /**
     *
     * Post file with parameter. Direct success creation.
     *
     */
    this.router.post(
      "/postimage/:name",
      addMetadata(this.module, this.log),
      multerFile.multer.single("image"),
      (req: Request, res: Response, next: any) => {

        res.appianSuccess = new ApiSuccess({
          module: this.module,
          payload: { test: "ok", name: req.file.filename,
            param: req.params.name }
        });

        next();

      },
      processResponse({})
    );

    /**
     *
     * Complex observable processing. The response get an observable member and
     * the processResponse method subscribes to the observable pipe. In the
     * chain, either throw ApiError or return an IResponsePayload with the
     * payload and logPayload. The processResponse will take care of the
     * response and logging.
     *
     */
    this.router.get(
      "/observable/success/:key",
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        res.appianObservable = rx.timer(1000)
        .pipe(

          rxo.take(1),

          rxo.map((o: any) => {

            // This is a successfull response
            return <IResponsePayload>{
              payload: { a: 44, b: 22 },
              logPayload: { a: 44 }
            };

          })

        )

        next();

      },
      processResponse({})
    );

    /**
     *
     * Complex observable processing. The response get an observable member and
     * the processResponse method subscribes to the observable pipe. In the
     * chain, either throw ApiError or return an IResponsePayload with the
     * payload and logPayload. The processResponse will take care of the
     * response and logging.
     *
     */
    this.router.get(
      "/observable/unexpected/:key",
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        res.appianObservable = rx.timer(1000)
        .pipe(

          rxo.take(1),

          rxo.map((o: any) => {

            // This is an unexpected error
            throw new Error("This is an unexpected error");

            // This is a successfull response, never reached
            return <IResponsePayload>{
              payload: { a: 44, b: 22 },
              logPayload: { a: 44 }
            };

          })

        )

        next();

      },
      processResponse({
        unexpectedErrorMessage: "Internal error, contact Customer Support"
      })
    );

    /**
     *
     * Complex observable processing. The response get an observable member and
     * the processResponse method subscribes to the observable pipe. In the
     * chain, either throw ApiError or return an IResponsePayload with the
     * payload and logPayload. The processResponse will take care of the
     * response and logging.
     *
     */
    this.router.get(
      "/observable/expected/:key",
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        res.appianObservable = rx.timer(1000)
        .pipe(

          rxo.take(1),

          rxo.map((o: any) => {

            // This is an expected error
            throw new ApiError({
              module: this.module,
              error: new Error("expected error"),
              httpStatus: StatusCodes.CONFLICT,
              payload: { a: 0, b: 1, c: 2},
              logPayload: { a: 0 }
            })

            // This is a successfull response, never reached
            return <IResponsePayload>{
              payload: { a: 44, b: 22 },
              logPayload: { a: 44 }
            };

          })

        )

        next();

      },
      processResponse({})
    );

    /**
     *
     * Complex observable processing for persistence testing.
     *
     */
    this.router.post(
      "/persistence/:key",
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        res.appianObservable = this._pg.pgCreateATable$()
        .pipe(

          rxo.concatMap((o: QueryResult) => {

            // This is a successfull response
            return this._pg.pgInsertA$(+req.params.key);

          }),

          rxo.concatMap((o: QueryResult) => {

            // This is a successfull response
            return this._redis.set$("a", req.params.key);

          }),

          rxo.map((o: string) => {

            return <IResponsePayload>{ payload: { a: o } };

          })

        )

        next();

      },
      processResponse({ verbose: false })
    );

    /**
     *
     * Authentication, returns a token.
     *
     */
    this.router.post(
      "/login",
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        const user: string = req.body.user;
        const pass: string = req.body.pass;

        res.appianSuccess = new ApiSuccess({
          payload: { token:
            this._jwtToken.createToken({ user: user, pass: pass }) },
          module: this.module,
        })

        next();

      },
      processResponse({})
    );

    /**
     *
     * Authentication, logs out.
     *
     */
    this.router.post(
      "/logout",
      Auth.bearerAuth(this._jwtToken, this._authentication),
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        // Clear the cookie
        res.clearCookie("sunnsaas",
          { path: "/sunnsaas/authorization/refreshtoken" });

        res.appianSuccess = new ApiSuccess({
          payload: { logout: "ok" },
          module: this.module,
        })

        next();

      },
      processResponse({})
    );

    /**
     *
     * Authenticated entrypoint.
     *
     */
    this.router.get(
      "/auth",
      Auth.bearerAuth(this._jwtToken, this._authentication),
      addMetadata(this.module, this.log),
      (req: Request, res: Response, next: any) => {

        res.appianSuccess = new ApiSuccess({
          payload: { a: 0, auth: req.appianAuth },
          module: this.module,
        })

        next();

      },
      processResponse({})
    );

    /**
     *
     * Define default REST API methods for ORM objects.
     *
     */
    RestOrm.generateDefaultRestRouters<OrmTest>({
      module: "testrouter",

      // Complex logic is possible in the REST methods
      postMethod$: ({ request: req, object: o }) => {
        o.c = req.file.filename;
        return o.pgInsert$(this._pgCon)
      },
      getMethod$: ({ request: req }) => OrmTest.get$(this._pgCon, +req.params.a, +req.params.b),
      patchMethod$: ({ request: req, object: o }) => {
        o.c = req.file.filename;
        o.d = +req.body.d;
        return o.pgUpdate$(this._pgCon)
      },
      deleteMethod$: ({ object: o }) => o.pgDelete$(this._pgCon),
      router: this,
      type: OrmTest,
      baseUrl: "/orm",
      keysUrlParameters: [ ":a", ":b" ],
      keylessPostMethod: false,

      // badRequestErrorPayload: ({ error: e }) =>
      //   { return { error: e.message, type: e.OrmErrorCode } },
      // duplicatedErrorPayload: ({ error: e }) =>
      //   { return { message: "CACA" } },
      // internalErrorPayload: ({ error: e }) =>
      //   { return { error: "internal error", e: e } },
      // notFoundErrorPayload: ({ error: e}) =>
      //   { return { error: "NOT FOUND" } },

      // postIResponsePayload: ({ object: o }) =>
      //   { return <IResponsePayload>{ payload: { a: o.a, b: o.b } } },
      // getIResponsePayload: ({ object: o }) =>
      //   { return <IResponsePayload>{ payload: { a: o.a, b: o.b, ee: o.c+o.d }}},
      // patchIResponsePayload: ({ object: o }) =>
      //   { return <IResponsePayload>{ payload: { a: o.a, b: o.b, ee44: o.c+o.d }}},
      // deleteIResponsePayload: ({ object: o }) =>
      //   { return <IResponsePayload>{ payload: { a: o.a, b: o.b, ehhe44: o.c+o.d }}},

      // prefixMiddlewares: [
      //   // Auth.bearerAuth(this._jwtToken, this._authentication),
      //   addMetadata(this.module, this.log)
      // ],
      // suffixMiddlewares: [
      //   processResponse({ verbose: true,
      //     unexpectedErrorMessage: "Internal error occured, contact support" })
      // ],
      postPrefixMiddlewares: [
        // Auth.bearerAuth(this._jwtToken, this._authentication),
        addMetadata(this.module, this.log),
        multerFile.multer.single("image")
      ],
      patchPrefixMiddlewares: [
        // Auth.bearerAuth(this._jwtToken, this._authentication),
        addMetadata(this.module, this.log),
        multerFile.multer.single("image")
      ],

      // This is a custom object initialization method
      newFunction: (params) => {
        console.log("COMPLEX INIT LOGIC AT newFunction", params);
        return rx.of(new OrmTest(params));
      },
      // Additional params for the newFunction
      newFunctionAdditionalParams: () => { return { u: 99 } }
    });

  }

}
