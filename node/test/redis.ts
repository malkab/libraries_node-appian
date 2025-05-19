import { RxRedis } from "@sunntics/rxredis";

import { Observable } from "rxjs";

/**
 *
 * A Redis persistence test. Use Redis commands only here.
 *
 */
export class Redis {

  /**
   *
   * The internal Redis instance.
   *
   */
  private _redis: RxRedis;

  /**
   *
   * Constructor.
   *
   */
  constructor() {

    this._redis = new RxRedis({
      url: "redis://redis"
    });

  }

  /**
   *
   * Set test.
   *
   */
  public set$(key: string, value: any): Observable<string> {

    return this._redis.set$(key, value);

  }

}