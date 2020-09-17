import { TsUtilsFormattedOutput } from "@malkab/ts-utils";

import * as bodyParser from "body-parser";

import * as cookieParser from "cookie-parser";

import * as cors from "cors";

import express from "express";

import * as fs from "fs";

import * as http from "http";

import { StatusCodes } from "http-status-codes";

import * as morgan from "morgan";

import { ApiError } from "./apierror";

import { ApiRouter } from "./apirouter";

import { IStatic } from "./istatic";

import { NodeLogger } from '@malkab/node-logger';

import { Response, Request } from "express";

import { ApiSuccess } from './apisuccess';

import { IResponsePayload } from './iresponsepayload';

import * as lodash from "lodash";

import { AddressInfo } from 'net';

/**
 *
 * The Express class, the entry point.
 *
 */
export class HttpServer {

  /**
   *
   * The Express server.
   *
   */
  public server: http.Server;

  /**
   *
   * The Express application.
   *
   */
  private _app: express.Application;

  /**
   *
   * The port.
   *
   */
  private _port: number;

  /**
   *
   * The port.
   *
   */
  get port(): number {
    return this._port;
  }

  /**
   *
   * URL limit.
   *
   */
  private _urlLimit: string;

  /**
   *
   * Output formatter.
   *
   */
  private _fo: TsUtilsFormattedOutput;

  /**
   *
   * The log file path.
   *
   */
  private _requestLogFilePath: string;

  /**
   *
   * Constructor.
   *
   * @param __namedParameters     HTTP server options.
   * @param port                  **Optional**. The server port, defaults to
   *                              **8080**.
   * @param urlLimit              **Optional**. The size of the URL, defaults to
   *                              **2mb**.
   * @param routes                **Optional**. The set of {@link ApiRouter}
   *                              based classes that defines the server's
   *                              routes.
   * @param statics               **Optional**. The set of statics to be served
   *                              by the server.
   * @param requestLogFilePath    **Optional**. The request log file path,
   *                              defaults to **\/logs\/httpaccess.csv**.
   *
   */
  constructor({
    port = 8080,
    urlLimit = "2mb",
    routes,
    statics,
    requestLogFilePath = "/logs/httpaccess.csv"
  }: {
    port?: number;
    urlLimit?: string;
    routes?: ApiRouter[];
    statics?: IStatic[];
    requestLogFilePath?: string;
  }) {

    // HTTP request log file path
    this._requestLogFilePath = requestLogFilePath;

    // The output formatter
    this._fo = new TsUtilsFormattedOutput({});

    // The port
    this._port = port;
    this._urlLimit = urlLimit;
    this._app = express() as express.Application;

    // Configure express and logging stuff
    this._expressConfiguration();

    // Use Cookie Parser
    this._app.use(cookieParser.default());

    // Configure routes
    if (routes) {

      this._apiRoutes(routes);

    }

    // Configure statics
    if (statics) {

      this._configureStatics(statics);

    }

    // Final configure
    this._app.set("port", this._port);
    this.server = http.createServer(this._app);
    this.server.listen(this._port);
    this.server.on("error", this._onError);
    this.server.on("listening", this._onListening);

  }

  /**
   *
   * Express configuration.
   *
   */
  private _expressConfiguration() {

    this._app.use(bodyParser
      .urlencoded({ limit: this._urlLimit, extended: true })
    );

    this._app.use(bodyParser
      .json({ limit: this._urlLimit })
    );

    //cors settings
    this._app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
      res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE,OPTIONS");
      next();
    });

    this._app.use(cors.default());

    // Morgan settings
    const accessLogStream =
      fs.createWriteStream(this._requestLogFilePath, { flags: 'a' })

    // To file
    this._app.use(morgan.default(
      "':remote-addr',':remote-user',':date[iso]',':method',':url',':http-version',':status',':response-time[digits]',':res[content-length]',':referrer',':user-agent'",
      { stream: accessLogStream }
    ));

    // To console, only if NODE_ENV is different from production
    if (process.env.NODE_ENV !== 'production') {

      this._app.use(morgan.default(
        ":date[iso] :method :url :status :response-time[digits]ms :res[content-length]b"
      ));

    }

    // catch 404 and forward to error handler
    this._app.use(
      function(
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) {
        var error = new Error("Not Found");
        err.status = 404;
        next(err);
      }
    );

  }

  /**
   *
   * Configure and add routes.
   */
  private _apiRoutes(apiRouter: ApiRouter[]): void {

    // Add router
    apiRouter.map((x) => {

      this._app.use(x.urlBaseRoot, x.router);

    })

  }

  /**
   *
   * Configure and add statics.
   *
   */
  private _configureStatics(statics: IStatic[]): void {

    statics.map((x) => {

      this._app.use(
        x.urlBaseRoot,
        express.static(x.localPath)
      );

    });

  }

  /**
   *
   * On listening event.
   *
   */

  private _onListening = () => {

    const addr: AddressInfo = this.server.address() as AddressInfo;

    const bind = typeof addr ===
      "string" ? `pipe ${addr}` : `port ${addr.port}`;

    console.log(this._fo.log(`Listening on ${bind}`));

  }

  /**
   *
   * On error event.
   *
   */
  private _onError = (error: any) => {

    if (error.syscall !== "listen") {

      throw error;

    }

    const bind = typeof this._port ===
      "string" ? `Pipe ${this._port}` : `Port ${this._port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {

      case "EACCES":

        console.log(
          this._fo.logError(`${bind} requires elevated privileges`));

        process.exit(1);

        break;

      case "EADDRINUSE":

        console.log(this._fo.logError(`${bind} is already in use`));

        process.exit(1);

        break;

      default:

        throw error;

    }

  }

}

/**
 *
 * Process an HTTP error, detecting if it is an expected one described
 * by the IHttpError interface or a non expected one. This is used
 * to provide as cohesive a response to errors throughout the API
 * as possible.
 *
 * The output format is something like:
 *
 * ```JSON
 * {
 *    "error": {
 *      "analysisrun": {
 *        "error": {
 *          "status": 406,
 *          "statusText": "Not Acceptable",
 *          "message": "unknown Analysis ID b_scenario_334"
 *          "expected": true,
 *          "payload": {
 *            "analysisId": "b_scenario_334"
 *          }
 *        }
 *      },
 *      "url": "/operation/run/b_scenario_3",
 *      "path": "/operation/run/:analysisId",
 *      "body": {}
 *    }
 * }
 * ```
 *
 * @param httpResponse            The Express HTTP response object
 *                                of the router (tipically the
 *                                res parameter).
 * @param httpRequest             The Express HTTP request object
 *                                of the router (tipically the
 *                                req parameter).
 * @param error                   The error.
 * @param log                     **Optional**. If there is a log object, the
 *                                error will be logged to the error channel.
 * @param doNotEchoBody           **Optional**. Do not echo the body, for
 *                                example when dealing with sensitive info
 *                                like passwords.
 * @param doNotEchoErrorPayload   **Optional**. Do not echo the error's payload,
 *                                for example when dealing with sensitive
 *                                info like passwords.
 *
 */
export function httpError({
    httpResponse,
    httpRequest,
    error,
    log,
    doNotEchoBody = false,
    doNotEchoErrorPayload = false,
    unexpectedErrorMessage = "unexpected error"
  }: {
    httpResponse: Response;
    httpRequest: Request;
    error: ApiError;
    log?: NodeLogger;
    doNotEchoBody?: boolean;
    doNotEchoErrorPayload?: boolean;
    unexpectedErrorMessage?: string;
}):
any {

  let res: any = {
    error: {
      error: error.message,
      ...error.payload
    },
    url: httpRequest.url,
    path: httpRequest.route.path,
    body: httpRequest.body
  };

  // If the error code is 500, hide the error and substitute
  // it for the user
  if (error.httpStatus === StatusCodes.INTERNAL_SERVER_ERROR) {
    res.error = unexpectedErrorMessage;
  }

  // Drop payload if requested
  if (doNotEchoErrorPayload) {
    delete res.error.payload;
  }

  if (doNotEchoBody || lodash.isEmpty(res.body)) {
    delete res.body;
  }

  // Log, if log
  if (log !== undefined) {

    log.logError({
      message: error.error.message,
      methodName: httpRequest.route.path,
      moduleName: httpResponse.appianModule,
      payload: { error: error.logPayload, httpStatus: error.httpStatus }
    })

  }

  return httpResponse.status(error.httpStatus).json(res);

}

/**
 *
 * Process an HTTP success (200) response, to provide as cohesive
 * a response throughout the API as possible.
 *
 * The output format is something like:
 *
 * ```JSON
 * {
 *    "success": {
 *      "analysisrun": {
 *        "success": {
 *          "analysisId": "b_scenario_3"
 *        }
 *      },
 *      "url": "/operation/run/b_scenario_3",
 *      "path": "/operation/run/:analysisId",
 *      "body": {}
 *    }
 * }
 * ```
 *
 * The **apiEntryNameIdentifier** should be something identifing the
 * entry, like for example **analysisrun** fof an entry
 * /operation/run/:analysisId
 *
 * @param success                 The success data.
 * @param httpResponse            The Express HTTP response object
 *                                of the router (tipically the
 *                                res parameter).
 * @param httpRequest             The Express HTTP request object
 *                                of the router (tipically the
 *                                req parameter).
 * @param log                     If there is a log object, the error will be
 *                                logged to the error channel.
 * @param doNotEchoBody           Do not echo the body, for example
 *                                when dealing with sensitive info
 *                                like passwords.
 *
 */
export function httpSuccess({
    success,
    httpResponse,
    httpRequest,
    log,
    verbose = true
  }: {
    success: ApiSuccess;
    httpResponse: Response;
    httpRequest: Request;
    log?: NodeLogger;
    verbose?: boolean;
}): any {

  let res: any;

  // Verbose or not verbose?
  if(!verbose) {

    res = {
      ...success.payload
    };

  } else {

    res = {
      success: success.payload,
      url: httpRequest.url,
      path: httpRequest.path
    }

  }

  // Log if log
  if (log !== undefined) {

    log.logInfo({
      methodName: httpRequest.route.path,
      moduleName: success.module,
      message: "ok",
      payload: { success: success.logPayload, httpStatus: StatusCodes.OK }
    })

  }

  return httpResponse.status(200).json(res);

}

/**
 *
 * Final processing or responses.
 *
 */
export function processResponse({
    unexpectedErrorMessage = "unexpected error",
    verbose = false
  }: {
    unexpectedErrorMessage?: string;
    verbose?: boolean
}): (req: Request, res: Response) => void {

  return (req: Request, res: Response): void => {

    if (res.appianError !== undefined) {

      // Verbose?
      if (verbose) { console.log(res.appianError); }

      httpError({
        error: res.appianError,
        httpRequest: req,
        httpResponse: res,
        log: res.appianLog,
        unexpectedErrorMessage: unexpectedErrorMessage
      });

    } else if (res.appianSuccess !== undefined) {

      // Verbose?
      if (verbose) { console.log(res.appianSuccess); }

      httpSuccess({
        success: res.appianSuccess,
        httpRequest: req,
        httpResponse: res,
        log: res.appianLog
      });

    } else if (res.appianObservable !== undefined) {

      res.appianObservable
      .subscribe(
        (responsePayload: IResponsePayload) => {

          // Verbose?
          if (verbose) { console.log(responsePayload); }

          // Make logPayload = payload if not present
          if (responsePayload.logPayload === undefined) {
            responsePayload.logPayload = responsePayload.payload;
          }

          httpSuccess({
            httpRequest: req,
            httpResponse: res,
            log: res.appianLog,
            success: new ApiSuccess({
              module: res.appianModule,
              payload: responsePayload.payload,
              logPayload: responsePayload.logPayload
            })
          })

        },

        (error: any) => {

          // Verbose?
          if (verbose) { console.log(error); }

          httpError({
            error: errorFactory(error, res.appianModule),
            httpRequest: req,
            httpResponse: res,
            log: res.appianLog,
            unexpectedErrorMessage: unexpectedErrorMessage
          })

        }

      )

    } else {

      throw new Error(`No appianSuccess, appianError, nor appianObservable was defined for response ${req.route.path}`)

    }

  }

}

/**
 *
 * This function process a generic error. If the error is of type ApiError
 * (identified by having the mandatory module property), it it just returned. If
 * not, it returns a new ApiError that encapsulates the error with a generic
 * description. This is used for automatic error management by the
 * {@link processResponse}. The **httpStatus** property of the generated
 * **ApiError** will be INTERNAL_SERVER_ERROR. No payload added.
 *
 * @param error       The error to process.
 * @param module      An optional module name. Defaults to null.
 * @returns           An ApiError that is the same as the input in case it was
 *                    an ApiError or a new ApiError encapsulating the error with
 *                    an standard description. The ApiError is identified by the
 *                    mandatory module property.
 *
 */
export function errorFactory(
  error: ApiError | Error,
  module: string
): ApiError {

  // Check if parameter is an ApiError
  if ((<ApiError>error).module === undefined) {
    return new ApiError({
      module: module,
      error: error,
      httpStatus: StatusCodes.INTERNAL_SERVER_ERROR
    })
  } else {
    return <ApiError>error;
  }

}

/**
 *
 * This Express middleware loads in the response object some
 * metadata for automatic response processing:
 *
 * - module name
 *
 */
export function addMetadata(module: string, log?: NodeLogger):
(req: Request, res: Response, next: any) => void {

  return (req: Request, res: Response, next: any) => {

    res.appianModule = module;

    res.appianLog = log;

    next();

  }

}
