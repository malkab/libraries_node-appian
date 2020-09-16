import * as rx from "rxjs";

/**
 *
 * This is the interface an REST API ORM object must follow.
 *
 */
export interface IRestOrm<T> {

  /**
   *
   * This is the patching function that modifies the values of the object once
   * it is created.
   *
   */
  patch$: (updateParams: any) => rx.Observable<T>;

}
