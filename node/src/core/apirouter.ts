import { Router } from "express";

import { NodeLogger } from '@malkab/node-logger';

/**
 *
 * This is the base class for creating API routers.
 * This class must be extended by the classes at the routers folder to
 * define new route modules.
 *
 * All router modules inherit an ApiServices with all the app-wide
 * services definitions.
 *
 */
export class ApiRouter {

  /**
   *
   * The API root the routes of this module attach to.
   *
   */
  protected _urlBaseRoot: string;

  get urlBaseRoot(): string { return this._urlBaseRoot; }

  /**
   *
   * The router.
   *
   */
  public router: Router;

  /**
   *
   * Info log method.
   *
   */
  protected _log: NodeLogger | undefined;

  /**
   *
   * Info log method.
   *
   */
  get log(): NodeLogger | undefined {
    return this._log ? this._log : undefined; }

  /**
   *
   * The module name, for errors.
   *
   */
  protected _module: string;

  get module(): string { return this._module; }

  /**
   *
   * Constructor.
   *
   * @param __namedParameters     ApiRouter options.
   * @param log                   **Optional**. A Log object for automatically
   *                              log HTTP responses via the
   *                              {@link processResponse} handler.
   * @param urlBaseRoot           **Optional**. The URL base root. Defaults to
   *                              **\/**.
   * @param module                The module name, to be used in errors
   *                              consistently.
   *
   */
  constructor({
    urlBaseRoot = "/",
    log,
    module
  }: {
    urlBaseRoot?: string;
    log?: NodeLogger;
    module: string;
  }) {

    this._urlBaseRoot = urlBaseRoot;
    this.router = Router();
    this._log = log ? log : undefined;
    this._module = module;

  }

  /**
   *
   * The router configuration. Configure routes here.
   *
   */
  protected _configureRouter(): void {
    throw `CRITICAL ERROR: undefined routes for router ${this._urlBaseRoot}, add protected _configureRouter() method`;
  }

}
