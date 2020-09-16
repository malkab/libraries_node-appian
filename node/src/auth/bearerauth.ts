import { JwtToken } from "./jwttoken";

import { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

/**
 *
 * This Express middleware authenticates using JWT token attached to the Bearer
 * header. For this it needs a JwtToken object used to encrypt the incoming
 * token and a function that will match the contents of the token with whatever
 * it is used to validate the user's info and that returns a convenient object
 * that will be injected into the Express Request member appianAuth.
 *
 * @param token             The Access Token used to encrypt, coming from the
 *                          client.
 * @param validatorFunc     The function used to validate the content of the
 *                          token. Will return an Observable<any>, where any is
 *                          anything but null if the validation was successfull
 *                          or null if not.
 * @param additionalParams  Additional params to be supplied to the
 *                          validatorFunc to do its work.
 *
 */
export function bearerAuth(
  token: JwtToken,
  validatorFunc: (params: any) => any,
  additionalParams: any = {}
): (req: Request, res: Response, next: any) => void {

  return (req: Request, res: Response, next: any) => {

    // Get bearer token
    let t: any = req.header("Authorization");

    // Check there was a token in bearer
    if (t !== undefined) {

      // Split the token from "Bearer"
      t = t.split(" ")[1];

      // Try to verify, if not, UNAUTHORIZED
      try {

        t = token.verifyToken(t);

        validatorFunc({ token: t, ...additionalParams })
        .subscribe(

          // Something was received from the validator func
          (validation: any) => {

            // Check validation is not null
            if (validation !== null) {

              req.appianAuth = validation;

              next();

            } else {

              // Not validated by the function, exit
              res.sendStatus(StatusCodes.UNAUTHORIZED);

            }

          },

          // The validatorFunc outputs an error
          (error: any) => {

            res.sendStatus(StatusCodes.UNAUTHORIZED);

          }

        );

      } catch(e) {

        res.sendStatus(StatusCodes.UNAUTHORIZED);

      }

    } else {

      // If not, automatically return UNAUTHORIZED without further
      // explanations
      res.sendStatus(StatusCodes.UNAUTHORIZED);

    }

  }

}
