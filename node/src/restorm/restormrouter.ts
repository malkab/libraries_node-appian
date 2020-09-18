import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { PgOrm } from "@malkab/rxpg";

import { Request, Response, ApiError, IResponsePayload, ApiRouter, addMetadata, processResponse } from "../core/index";

import { IRestOrm } from "./irestorm";

import { StatusCodes } from 'http-status-codes';
import { request } from 'http';

/**
 *
 * This function generates default API methods to implement POST / GET / PATCH /
 * DELETE workflows on objects.
 *
 * Objects to be created REST methods for must honor a correspondence between:
 *
 * - deconstructed parameters at the object's **constructor**;
 *
 * - a set of those at the object's **patch$** method;
 *
 * - **bodies** for the POST and PATCH requests.
 *
 * Usage patterns:
 *
 * - the xxxIResponsePayload functions allows not only to modulate the default
 *   response of the REST method, but also to perform any postprocessing or side
 *   effect on the create object;
 *
 * - likewise, the xxxMethod$ allows for preprocessing of the objects before
 *   performing the REST operation.
 *
 * @typeParam T                     A type that extends the IRestOrm interface.
 *                                  This object is the one to persist.
 * @param __namedParameters         Parameters to configure the creation of the
 *                                  API entries for REST operations.
 * @param module                    The module this router is being defined at,
 *                                  for logging.
 * @param router                    The router to inject the generated methods
 *                                  into.
 * @param type                      The class of the object to persist.
 * @param postMethod$               The function defining the post operation of
 *                                  the object. Gets the object parameters in
 *                                  the request body and tries to construct an
 *                                  object with them. If successfull, it is
 *                                  written at the persistence using the
 *                                  provided method. The REST API method
 *                                  generated can be with key parameters
 *                                  (/whatever/key1/key2) or without them,
 *                                  providing the user the keys directly at the
 *                                  request body. Returns an Observable.
 * @param getMethod$                The function defining the get operation of
 *                                  the object. Gets the object referenced at
 *                                  the REST method by the key and returns an
 *                                  Observable with the retrieved object.
 * @param patchMethod$              The function defining the patch operation of
 *                                  the object. Gets the object referenced at
 *                                  the REST method by the key, constructs it,
 *                                  tries to modify it with the patch$ function
 *                                  and returns an Observable.
 * @param deleteMethod$             The function defining the delete operation
 *                                  of the object. Gets the object referenced at
 *                                  the REST method by the key a run its delete
 *                                  method, returning an Observable.
 * @param baseUrl                   The base URL to use when defining the entry
 *                                  points of the methods.
 * @param keysUrlParameters         The name of the parameters to be used in the
 *                                  methods that needs them to identify the set
 *                                  of the object's keys. This array of string
 *                                  must match the key parts of the
 *                                  desconstructed parameters of the object's
 *                                  constructor, for example, [ "idA", "idB" ]
 *                                  for a double key object.
 * @param keylessPostMethod         A binary flag to signal if the POST method
 *                                  will use key URL parameters or not. If not,
 *                                  keys must be included in the POST body.
 * @param prefixMiddlewares         Array of Express middlewares to execute
 *                                  before the generated entries.
 * @param suffixMiddlewares         Array of Express middlewares to execute
 *                                  after the generated entries.
 * @param badRequestErrorPayload    The payload response when processing a bad
 *                                  request errors.
 * @param duplicatedErrorPayload    The payload response when processing
 *                                  duplicated request errors.
 * @param internalErrorPayload      The payload response when processing
 *                                  internal error request errors. Although the
 *                                  final API response will depend on the custom
 *                                  error returned by the processResponse suffix
 *                                  middleware (if any), this is what is going
 *                                  to go to the logs.
 * @param notFoundErrorPayload      The payload response when processing not
 *                                  found request errors.
 * @param postIResponsePayload      The payload for successfull responses to
 *                                  POST requests.
 * @param postPrefixMiddlewares     Custom prefix middlewares for POST. If not
 *                                  provided, the **prefixMiddlewares** will be
 *                                  used.
 * @param postSuffixMiddlewares     Custom suffix middlewares for POST. If not
 *                                  provided, the **suffixMiddlewares** will be
 *                                  used.
 * @param getIResponsePayload       The payload for successfull responses to GET
 *                                  requests.
 * @param getPrefixMiddlewares      Custom prefix middlewares for GET. If not
 *                                  provided, the **prefixMiddlewares** will be
 *                                  used.
 * @param getSuffixMiddlewares      Custom suffix middlewares for GET. If not
 *                                  provided, the **suffixMiddlewares** will be
 *                                  used.
 * @param patchIResponsePayload     The payload for successfull responses to
 *                                  PATCH requests.
 * @param patchPrefixMiddlewares    Custom prefix middlewares for PATCH. If not
 *                                  provided, the **prefixMiddlewares** will be
 *                                  used.
 * @param patchSuffixMiddlewares    Custom suffix middlewares for PATCH. If not
 *                                  provided, the **suffixMiddlewares** will be
 *                                  used.
 * @param deleteIResponsePayload    The payload for successfull responses to
 *                                  DELETE requests.
 * @param deletePrefixMiddlewares   Custom prefix middlewares for DELETE. If not
 *                                  provided, the **prefixMiddlewares** will be
 *                                  used.
 * @param deleteSuffixMiddlewares   Custom suffix middlewares for DELETE. If not
 *                                  provided, the **suffixMiddlewares** will be
 *                                  used.
 *
 */
export function generateDefaultRestRouters<T extends IRestOrm<T>>({
    module,
    router,
    type,
    postMethod$,
    getMethod$,
    patchMethod$,
    deleteMethod$,
    baseUrl = "",
    keysUrlParameters = [ ":id" ],
    keylessPostMethod = true,
    prefixMiddlewares = [ addMetadata(router.module, router.log) ],
    suffixMiddlewares = [ processResponse({}) ],
    badRequestErrorPayload =
      ({ error: error, object: object, request: request, response: response }) =>
      request.body,
    duplicatedErrorPayload =
      ({ error: error, object: object, request: request, response: response }) =>
      request.body,
    internalErrorPayload =
      ({ error: error, object: object, request: request, response: response }) =>
      request.body,
    notFoundErrorPayload =
      ({ error: error, object: object, request: request, response: response }) =>
      request.body,
    postIResponsePayload =
      ({ object: object, request: request, response: response }) =>
      <IResponsePayload>{ payload: object },
    postPrefixMiddlewares,
    postSuffixMiddlewares,
    getIResponsePayload =
      ({ object: object, request: request, response: response }) =>
      <IResponsePayload>{ payload: object },
    getPrefixMiddlewares,
    getSuffixMiddlewares,
    patchIResponsePayload =
      ({ object: object, request: request, response: response }) =>
      <IResponsePayload>{ payload: object },
    patchPrefixMiddlewares,
    patchSuffixMiddlewares,
    deleteIResponsePayload =
      ({ object: object, request: request, response: response }) =>
      <IResponsePayload>{ payload: object },
    deletePrefixMiddlewares,
    deleteSuffixMiddlewares
  }: {
    module: string;
    router: ApiRouter;
    type: any;
    postMethod$: ({ object, request, response }:
      { object: T, request?: Request, response?: Response }) =>
      rx.Observable<any>;
    getMethod$: ({ request, response }:
      { request: Request, response?: Response }) => rx.Observable<T>;
    patchMethod$: ({ object, request, response }:
      { object: T, request?: Request, response?: Response }) =>
      rx.Observable<any>;
    deleteMethod$: ({ object, request, response }:
      { object: T, request?: Request, response?: Response }) =>
      rx.Observable<any>;
    baseUrl?: string;
    keysUrlParameters?: string[];
    keylessPostMethod?: boolean;
    prefixMiddlewares?: any[];
    suffixMiddlewares?: any[];
    badRequestErrorPayload?: ({ error, object, request, response }:
      { error: any; object?: T; request: Request; response: Response; }) => any;
    duplicatedErrorPayload?: ({ error, object, request, response }:
      { error: any; object: T; request: Request; response: Response; }) =>
      any;
    internalErrorPayload?: ({ error, object, request, response }:
      { error: any; object?: T, request: Request; response: Response; }) =>
      any;
    notFoundErrorPayload?: ({ error, object, request, response }:
      { error: any; object?: T, request: Request; response: Response; }) => any;
    postIResponsePayload?: ({ object, request, response }:
      { object: T; request: Request; response: Response; }) =>
      IResponsePayload;
    postPrefixMiddlewares?: any[];
    postSuffixMiddlewares?: any[];
    getIResponsePayload?: ({ object, request, response }:
      { object: T; request: Request; response: Response; }) =>
      IResponsePayload;
    getPrefixMiddlewares?: any[];
    getSuffixMiddlewares?: any[];
    patchIResponsePayload?: ({ object, request, response }:
      { object: T; request: Request; response: Response; }) =>
      IResponsePayload;
    patchPrefixMiddlewares?: any[];
    patchSuffixMiddlewares?: any[];
    deleteIResponsePayload?: ({ object, request, response }:
      { object: T; request: Request; response: Response; }) =>
      IResponsePayload;
    deletePrefixMiddlewares?: any[];
    deleteSuffixMiddlewares?: any[];
}): void {

  // Check for keyless POST method parameters
  const postUrlParameters: string[] = keylessPostMethod ? [] :
    keysUrlParameters;

  // Check for custom pre and suffix middlewares
  const postFinalPrefixMiddlewares: any [] =
    postPrefixMiddlewares ? postPrefixMiddlewares : prefixMiddlewares;
  const postFinalSuffixMiddlewares: any [] =
    postSuffixMiddlewares ? postSuffixMiddlewares : suffixMiddlewares;
  const getFinalPrefixMiddlewares: any [] =
    getPrefixMiddlewares ? getPrefixMiddlewares : prefixMiddlewares;
  const getFinalSuffixMiddlewares: any [] =
    getSuffixMiddlewares ? getSuffixMiddlewares : suffixMiddlewares;
  const patchFinalPrefixMiddlewares: any [] =
    patchPrefixMiddlewares ? patchPrefixMiddlewares : prefixMiddlewares;
  const patchFinalSuffixMiddlewares: any [] =
    patchSuffixMiddlewares ? patchSuffixMiddlewares : suffixMiddlewares;
  const deleteFinalPrefixMiddlewares: any [] =
    deletePrefixMiddlewares ? deletePrefixMiddlewares : prefixMiddlewares;
  const deleteFinalSuffixMiddlewares: any [] =
    deleteSuffixMiddlewares ? deleteSuffixMiddlewares : suffixMiddlewares;

  /**
   *
   * POST
   *
   */
  router.router.post(
    `${baseUrl}/${postUrlParameters.join("/")}`,
    ...postFinalPrefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // The created object from the request.body
      let object: T = <any>undefined;

      try {

        // Try to create the object
        object = <T>(new type({ ...request.body, ...request.params }));

      } catch(e) {

        // Error creating the object
        response.appianError = new ApiError({
          module: module,
          error: e,
          httpStatus: StatusCodes.BAD_REQUEST,
          payload: badRequestErrorPayload(
            { error: e, request: request, response: response })
        });

      }

      // Process pipeline
      response.appianObservable =
      postMethod$({ object: object, request: request, response: response })
      .pipe(

        // Catch controlled errors
        rxo.catchError((e: any) => {

          // Duplicated keys
          if (e.code === PgOrm.EORMERRORCODES.DUPLICATED) {

            throw new ApiError({
              module: module,
              error: new Error("duplicated"),
              httpStatus: StatusCodes.CONFLICT,
              payload: duplicatedErrorPayload(
                { error: e, object: object, request: request, response: response })
            });

          }

          // Invalid parameters provided by the user
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              module: module,
              error: new Error("bad request"),
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, object: object, request: request, response: response })
            });

          }

          // Any other error: internal error
          throw new ApiError({
            module: module,
            error: new Error("internal error"),
            httpStatus: StatusCodes.INTERNAL_SERVER_ERROR,
            payload: internalErrorPayload(
              { error: e, object: object, request: request, response: response })
          });

        }),

        // Successfull response
        rxo.map((o: any) => {

          return postIResponsePayload(
            { object: object, request: request, response: response });

        })

      )

      next();

    },
    ...postFinalSuffixMiddlewares
  );

  /**
   *
   * GET.
   *
   */
  router.router.get(
    `${baseUrl}/${keysUrlParameters.join("/")}`,
    ...getFinalPrefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // Get based on the parameters passed in the URL
      response.appianObservable = getMethod$({ request: request, response: response })
      .pipe(

        rxo.catchError((e: any) => {

          // User commited an error with data types
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              module: module,
              error: e,
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Requested object not found
          if (e.code === PgOrm.EORMERRORCODES.NOT_FOUND) {

            throw new ApiError({
              module: module,
              error: e,
              httpStatus: StatusCodes.NOT_FOUND,
              payload: notFoundErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Any other error: internal error
          throw new ApiError({
            module: module,
            error: e,
            httpStatus: StatusCodes.INTERNAL_SERVER_ERROR,
            payload: internalErrorPayload(
              { error: e, request: request, response: response })
          });

        }),

        // Push a successfull response
        rxo.map((object: any) => {

          return getIResponsePayload(
            { object: object, request: request, response: response });

        })

      )

      next();

    },
    ...getFinalSuffixMiddlewares
  );

  /**
   *
   * PATCH
   *
   */
  router.router.patch(
    `${baseUrl}/${keysUrlParameters.join("/")}`,
    ...patchFinalPrefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // The created object from the request.body
      let object: T;

      // Process pipeline: check if the object exists
      response.appianObservable = getMethod$({ request: request, response: response })
      .pipe(

        // If it exists, make the patching with the **patch$** method defined at
        // the IRestORM interface
        rxo.concatMap((o: T) => {

          object = o;
          object.patch$({ ...request.params, ...request.body });
          return patchMethod$({ object: object, request: request, response: response })

        }),

        // Intercept expected errors
        rxo.catchError((e: any) => {

          // User made a mistake with data types
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              module: module,
              error: e,
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // The object does not exists
          if (e.code === PgOrm.EORMERRORCODES.NOT_FOUND) {

            throw new ApiError({
              module: module,
              error: new Error("not found"),
              httpStatus: StatusCodes.NOT_FOUND,
              payload: notFoundErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Internal error
          throw new ApiError({
            module: module,
            error: e,
            httpStatus: StatusCodes.INTERNAL_SERVER_ERROR,
            payload: internalErrorPayload(
              { error: e, object: undefined, request: request, response: response })
          });

        }),

        // Push the successfull response
        rxo.map((o: any) => {

          return patchIResponsePayload(
            { object: object, request: request, response: response });

        })

      )

      next();

    },
    ...patchFinalSuffixMiddlewares
  );

  /**
   *
   * DELETE
   *
   */
  router.router.delete(
    `${baseUrl}/${keysUrlParameters.join("/")}`,
    ...deleteFinalPrefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // The created object from the request.body
      let object: T;

      // Process pipeline: get the object
      response.appianObservable = getMethod$({ request: request, response: response })
      .pipe(

        // Make the deletion
        rxo.concatMap((o: T) => {

          object = o;

          return deleteMethod$({ object: object, request: request, response: response })

        }),

        // Intercept expected errors
        rxo.catchError((e: any) => {

          // The user made a mistake with data types
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              module: module,
              error: e,
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // The object does not exists
          if (e.code === PgOrm.EORMERRORCODES.NOT_FOUND) {

            throw new ApiError({
              module: module,
              error: new Error("not found"),
              httpStatus: StatusCodes.NOT_FOUND,
              payload: notFoundErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Unexpected error here
          throw new ApiError({
            module: module,
            error: e,
            httpStatus: StatusCodes.INTERNAL_SERVER_ERROR,
            payload: internalErrorPayload(
              { error: e, request: request, response: response })
          });

        }),

        // Push a successfull response
        rxo.map((o: any) => {

          return deleteIResponsePayload(
            { object: object, request: request, response: response });

        })

      )

      next();

    },
    ...patchFinalSuffixMiddlewares
  );

}
