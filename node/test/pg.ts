import { Observable } from "rxjs";

import { RxPg, QueryResult } from '@malkab/rxpg';

/**
 *
 * Persistence methods. This is the only place to use
 * persistence methods and SQL.
 *
 */
export class Pg {

  /**
   *
   * The internal PG instance.
   *
   */
  private _pg: RxPg;

  /**
   *
   * Constructor.
   *
   */
  constructor() {

    this._pg = new RxPg({
      maxPoolSize: 10,
      host: "postgis"
    })

  }

  public pgCreateATable$(): Observable<QueryResult> {

    return this._pg.executeQuery$(`
      drop table if exists a;

      create table a(a integer, b integer);
    `);

  }

  public pgInsertA$(value: number): Observable<QueryResult> {

    return this._pg.executeQuery$(`
      insert into a values (${value}, ${value});
      insert into a values (${value} + 1, ${value} + 1);
    `);

  }

}
