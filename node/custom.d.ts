import * as rx from "rxjs";

import { ApiError } from "./src/core/apierror";

import { ApiSuccess } from "./src/core/apisuccess";

import { IResponsePayload } from "./src/core/iresponsepayload";

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
      appianLog?: NodeLogger;
    }

  }

}
