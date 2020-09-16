import * as rx from "rxjs";

import * as rxo from "rxjs/operators";

import { PgOrm } from "@malkab/rxpg";

import { Request, Response, ApiError, IResponsePayload, ApiRouter, addMetadata, processResponse } from "../core/index";

import { IRestOrm } from "./irestorm";

import { StatusCodes } from 'http-status-codes';

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
 * @typeParam T                     A type that extends the IRestOrm interface.
 *                                  This object is the one to persist.
 * @param __namedParameters         Parameters to configure the creation of the
 *                                  API entries for REST operations.
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
 * @param getIResponsePayload       The payload for successfull responses to GET
 *                                  requests.
 * @param patchIResponsePayload     The payload for successfull responses to
 *                                  PATCH requests.
 * @param deleteIResponsePayload    The payload for successfull responses to
 *                                  DELETE requests.
 *
 */
export function generateDefaultRestRouters<T extends IRestOrm<T>>({
    router,
    type,
    postMethod$,
    getMethod$,
    patchMethod$,
    deleteMethod$,
    baseUrl,
    keysUrlParameters = [ ":id" ],
    keylessPostMethod = true,
    prefixMiddlewares = [
      addMetadata(router.module, router.log)
    ],
    suffixMiddlewares = [
      processResponse({})
    ],
    badRequestErrorPayload = ({
        /** The error producing the response. */
        error,
        /** The object, if any has been able to be generated. */
        object,
        /** The Express request. */
        request,
        /** The Express response. */
        response
      }: {
        error?: any;
        object?: T;
        request?: Request;
        response?: Response;
    } = {}) => request.body,
    duplicatedErrorPayload = ({
        /** The error producing the response. */
        error,
        /** The object, if any has been able to be generated. */
        object,
        /** The Express request. */
        request,
        /** The Express response. */
        response
      }: {
        error?: any;
        object?: T;
        request?: Request;
        response?: Response;
    } = {}) => request.body,
    internalErrorPayload = ({
        /** The error producing the response. */
        error,
        /** The object, if any has been able to be generated. */
        object,
        /** The Express request. */
        request,
        /** The Express response. */
        response
      }: {
        error?: any;
        object?: T;
        request?: Request;
        response?: Response;
    } = {}) => request.body,
    notFoundErrorPayload = ({ error: e, request: req, response: res }) => req.body,
    postIResponsePayload = ({
        /** The generated object.  */
        object = undefined,
        /** The Express request. */
        request = undefined,
        /** The Express response. */
        response = undefined
      }: {
        object?: T;
        request?: Request;
        response?: Response;
    } = {}) => <IResponsePayload>{ payload: object },
    getIResponsePayload = ({
        /** The generated object.  */
        object = undefined,
        /** The Express request. */
        request = undefined,
        /** The Express response. */
        response = undefined
      }: {
        object?: T;
        request?: Request;
        response?: Response;
    } = {}) => <IResponsePayload>{ payload: object },
    patchIResponsePayload = ({
        /** The generated object.  */
        object = undefined,
        /** The Express request. */
        request = undefined,
        /** The Express response. */
        response = undefined
      }: {
        object?: T;
        request?: Request;
        response?: Response;
    } = {}) => <IResponsePayload>{ payload: object },
    deleteIResponsePayload = ({
        /** The generated object.  */
        object = undefined,
        /** The Express request. */
        request = undefined,
        /** The Express response. */
        response = undefined
      }: {
        object?: T;
        request?: Request;
        response?: Response;
    } = {}) => <IResponsePayload>{ payload: object },
  }: {
    /** The router to inject the generated methods. */
    router: ApiRouter;
    /** The class of the object to persist. */
    type: any;
    /**
     * The function defining the post operation of the object. */
    postMethod$: (object: T) => rx.Observable<any>;
    /** The function defining the get operation of the object. */
    getMethod$: (params: any) => rx.Observable<T>;
    /** The function defining the patch operation of the object. */
    patchMethod$: (object: T) => rx.Observable<any>;
    /** The function defining the delete operation of the object. */
    deleteMethod$: (object: T) => rx.Observable<any>;
    /** The base URL to use when defining the entry points of the methods. */
    baseUrl: string;
    /**
     *
     * The name of the parameters to be used in the methods that needs them to
     * identify the set of the object's keys. This array of string must match
     * the key parts of the desconstructed parameters of the object's
     * constructor, for example, [ "idA", "idB" ] for a double key object.
     *
     */
    keysUrlParameters?: string[];
    /**
     *
     * A binary flag to signal if the POST method will use key URL parameters
     * or not. If not, keys must be included in the POST body.
     *
     */
    keylessPostMethod?: boolean;
    /** Array of Express middlewares to execute before the generated entries. */
    prefixMiddlewares?: any[];
    /** Array of Express middlewares to execute after the generated entries. */
    suffixMiddlewares?: any[];
    /** The payload response when processing a bad request errors. */
    badRequestErrorPayload?: ({
      error,
      object,
      request,
      response
    }: {
      error?: any;
      object?: T;
      request?: Request;
      response?: Response;
    }) => any;
    /** The payload response when processing duplicated request errors. */
    duplicatedErrorPayload?: ({
      error,
      object,
      request,
      response
    }: {
      error?: any;
      object?: T;
      request?: Request;
      response?: Response;
    }) => any;
    /**
     *
     * The payload response when processing internal error request errors.
     * Although the final API response will depend on the custom error returned
     * by the processResponse suffix middleware (if any), this is what is going
     * to go to the logs.
     *
     */
    internalErrorPayload?: ({
      error,
      object,
      request,
      response
    }: {
      error?: any;
      object?: T;
      request?: Request;
      response?: Response;
    }) => any;
    /** The payload response when processing not found request errors. */
    notFoundErrorPayload?: ({
      error,
      request,
      response
    }: {
      error?: any;
      request: Request;
      response: Response;
    }) => any;
    /** The payload for successfull responses to POST requests. */
    postIResponsePayload?: ({
      object,
      request,
      response
    }: {
      object: T;
      request?: Request;
      response?: Response;
    }) => IResponsePayload;
    /** The payload for successfull responses to GET requests. */
    getIResponsePayload?: ({
      object,
      request,
      response
    }: {
      object: T;
      request?: Request;
      response?: Response;
    }) => IResponsePayload;
    /** The payload for successfull responses to PATCH requests. */
    patchIResponsePayload?: ({
      object,
      request,
      response
    }: {
      object: T;
      request?: Request;
      response?: Response;
    }) => IResponsePayload;
    /** The payload for successfull responses to POST requests. */
    deleteIResponsePayload?: ({
      object,
      request,
      response
    }: {
      object: T;
      request?: Request;
      response?: Response;
    }) => IResponsePayload;
}): void {

  // Check for keyless POST method parameters
  const postUrlParameters: string[] = keylessPostMethod ? [] : keysUrlParameters;

  /**
   *
   * POST
   *
   */
  router.router.post(
    `/${baseUrl}/${postUrlParameters.join("/")}`,
    ...prefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // The created object from the request.body
      let object: T;

      try {

        // Try to create the object
        object = <T>(new type({ ...request.body, ...request.params }));

      } catch(e) {

        // Error creating the object
        response.appianError = new ApiError({
          error: e,
          httpStatus: StatusCodes.BAD_REQUEST,
          payload: badRequestErrorPayload(
            { error: e, request: request, response: response })
        });

      }

      // Process pipeline
      response.appianObservable = postMethod$(object)
      .pipe(

        // Catch controlled errors
        rxo.catchError((e: any) => {

          // Duplicated keys
          if (e.code === PgOrm.EORMERRORCODES.DUPLICATED) {

            throw new ApiError({
              error: new Error("duplicated"),
              httpStatus: StatusCodes.CONFLICT,
              payload: duplicatedErrorPayload(
                { error: e, object: object, request: request, response: response })
            });

          }

          // Invalid parameters provided by the user
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              error: new Error("bad request"),
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, object: object, request: request, response: response })
            });

          }

          // Any other error: internal error
          throw new ApiError({
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
    ...suffixMiddlewares
  );

  /**
   *
   * GET.
   *
   */
  router.router.get(
    `/${baseUrl}/${keysUrlParameters.join("/")}`,
    ...prefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // Get based on the parameters passed in the URL
      response.appianObservable = getMethod$(request.params)
      .pipe(

        rxo.catchError((e: any) => {

          // User commited an error with data types
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              error: e,
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Requested object not found
          if (e.code === PgOrm.EORMERRORCODES.NOT_FOUND) {

            throw new ApiError({
              error: e,
              httpStatus: StatusCodes.NOT_FOUND,
              payload: notFoundErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Any other error: internal error
          throw new ApiError({
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
    ...suffixMiddlewares,
  );

  /**
   *
   * PATCH
   *
   */
  router.router.patch(
    `/${baseUrl}/${keysUrlParameters.join("/")}`,
    ...prefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // The created object from the request.body
      let object: T;

      // Process pipeline: check if the object exists
      response.appianObservable = getMethod$(request.params)
      .pipe(

        // If it exists, make the patching with the **patch$** method defined at
        // the IRestORM interface
        rxo.concatMap((o: T) => {

          object = o;
          object.patch$({ ...request.params, ...request.body });
          return patchMethod$(object)

        }),

        // Intercept expected errors
        rxo.catchError((e: any) => {

          // User made a mistake with data types
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              error: e,
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, object: null, request: request, response: response })
            });

          }

          // The object does not exists
          if (e.code === PgOrm.EORMERRORCODES.NOT_FOUND) {

            throw new ApiError({
              error: new Error("not found"),
              httpStatus: StatusCodes.NOT_FOUND,
              payload: notFoundErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Internal error
          throw new ApiError({
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
    ...suffixMiddlewares,
  );

  /**
   *
   * DELETE
   *
   */
  router.router.delete(
    `/${baseUrl}/${keysUrlParameters.join("/")}`,
    ...prefixMiddlewares,
    (request: Request, response: Response, next: any) => {

      // The created object from the request.body
      let object: T = undefined;

      // Process pipeline: get the object
      response.appianObservable = getMethod$(request.params)
      .pipe(

        // Make the deletion
        rxo.concatMap((o: T) => {

          object = o;

          return deleteMethod$(object)

        }),

        // Intercept expected errors
        rxo.catchError((e: any) => {

          // The user made a mistake with data types
          if (e.code === PgOrm.EORMERRORCODES.INVALID_OBJECT_PARAMETERS) {

            throw new ApiError({
              error: e,
              httpStatus: StatusCodes.BAD_REQUEST,
              payload: badRequestErrorPayload(
                { error: e, object: null, request: request, response: response })
            });

          }

          // The object does not exists
          if (e.code === PgOrm.EORMERRORCODES.NOT_FOUND) {

            throw new ApiError({
              error: new Error("not found"),
              httpStatus: StatusCodes.NOT_FOUND,
              payload: notFoundErrorPayload(
                { error: e, request: request, response: response })
            });

          }

          // Unexpected error here
          throw new ApiError({
            error: e,
            httpStatus: StatusCodes.INTERNAL_SERVER_ERROR,
            payload: internalErrorPayload(
              { error: e, object: null, request: request, response: response })
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
    ...suffixMiddlewares,
  );

}
