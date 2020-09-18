import { RxPg, PgOrm } from "@malkab/rxpg";

import { RestOrm } from "../src/index";

import * as rx from "rxjs";

/**
 *
 * This is an example on how to implement an object for REST ORM.
 *
 */

export class OrmTest implements PgOrm.IPgOrm<OrmTest>, RestOrm.IRestOrm<OrmTest> {

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
      d
    }: {
      a: number;
      b: number;
      c: string;
      d: number;
  }) {

    // Only the id is set here, at construction time
    this._a = a;
    this._b = b;

    // Call the patch$ function for everything else
    this.patch$({ c: c, d: d });

    // Create ORM methods automatically
    PgOrm.generateDefaultPgOrmMethods(this, {
      restApiErrorMapping: true,
      methods: {
        pgInsert$: {
          sql: "insert into dualkeyobjects values($1, $2, $3, $4);",
          params: () => [ this.a, this.b, this.c, this.d ]
        },
        pgUpdate$: {
          sql: "update dualkeyobjects set c = $1, d = $2 where a = $3 and b = $4;",
          params: () => [ this.c, this.d, this.a, this.b ]
        },
        pgDelete$: {
          sql: "delete from dualkeyobjects where a = $1 and b = $2;",
          params: () => [ this.a, this.b ]
        }
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

  /**
   *
   * The patch$ function.
   *
   */
  public patch$({
      c, d
    }: {
      c: string; d: number;
  }): rx.Observable<OrmTest> {

    this._c = c;
    this._d = d;
    return rx.of(this);

  }

}
