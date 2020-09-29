import { RxPg, PgOrm } from "@malkab/rxpg";

import * as rx from "rxjs";

/**
 *
 * This is an example on how to implement an object for REST ORM.
 *
 */

export class OrmTest implements PgOrm.IPgOrm<OrmTest> {

  // Placeholder for the required functions at the IPgPersistence interface
  // These will be created automatically by a helper at construction time
  public pgInsert$: (pg: RxPg) => rx.Observable<OrmTest>;
  public pgUpdate$: (pg: RxPg) => rx.Observable<OrmTest>;
  public pgDelete$: (pg: RxPg) => rx.Observable<OrmTest>;

  /**
   *
   * Object members.
   *
   */
  get a(): number { return this._a }
  get b(): number { return this._b }
  get c(): string { return this._c }
  set c(c: string) { this._c = c }
  get d(): number { return this._d }
  set d(d: number) { this._d = d }

  private _a: number;
  private _b: number;
  private _c: string;
  private _d: number;

  /**
   *
   * Constructor.
   *
   */
  constructor({
      a,
      b,
      c,
      d,
      u
    }: {
      a: number;
      b: number;
      c: string;
      d: number;
      u?: number;
  }) {

    if (a > 10 ) throw new Error("a can't be higher that 10");

    // Only the id is set here, at construction time
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;

    // Additional parameter
    console.log("COMPLEX LOGIC AT CONSTRUCTOR", u);

    // Create ORM methods automatically
    PgOrm.generateDefaultPgOrmMethods(this, {
      pgInsert$: {
        sql: "insert into dualkeyobjects values($1, $2, $3, $4) returning *;",
        params: () => [ this.a, this.b, this.c, this.d ]
      },
      pgUpdate$: {
        sql: "update dualkeyobjects set c = $1, d = $2 where a = $3 and b = $4 returning *;",
        params: () => [ this.c, this.d, this.a, this.b ]
      },
      pgDelete$: {
        sql: "delete from dualkeyobjects where a = $1 and b = $2 returning *;",
        params: () => [ this.a, this.b ]
      }
    })

  }

  /**
   *
   * Get, static.
   *
   */
  public static get$(pg: RxPg, a: number, b: number): rx.Observable<OrmTest> {

    return PgOrm.select$({
      pg: pg,
      sql: `
        select
          a as a, b as b, c as c, d as d
        from dualkeyobjects
        where a = $1 and b = $2;`,
      params: () => [ a, b ],
      type: OrmTest
    })

  }

}
