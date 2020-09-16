import * as rx from "rxjs";

import { ApiError } from "./core/apierror";

import { ApiSuccess } from "./core/apisuccess";

import { IResponsePayload } from "./core/iresponsepayload";

import { NodeLogger } from "@malkab/node-logger";

export {};

declare global {

  namespace Express {

    interface Request {
      appianUrl: string;
      appianBody: any;
      appianAuth: any;
    }

    interface route {
      appianPath: string;
    }

    interface Response {
      appianStatus: any;
      appianError: ApiError;
      appianSuccess: ApiSuccess;
      appianObservable: rx.Observable<IResponsePayload>;
      appianModule: string;
      appianLog: NodeLogger;
    }

  }

}
