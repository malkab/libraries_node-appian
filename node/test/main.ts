import { HttpServer, EnvVarsStorage, JwtToken } from "../src/index";

import { NodeLogger } from "@malkab/node-logger";

import { TestRouter } from "./testrouter";

import { Pg } from "./pg";

import { Redis } from './redis';

import { RxPg } from "@malkab/rxpg"

/**
 *
 * An env vars storage.
 *
 */
let envVarsStorage: EnvVarsStorage;

try {
  envVarsStorage = new EnvVarsStorage(

    // CONFIGURATION: ADD HERE ENV VARS TO BE
    // READ FROM THE CONTAINER
    "NODE_ENV",
    "NODE_MEMORY"

  );
} catch(e) {

    console.log((`INITIALIZATION ERROR: ${e}`));

    process.exit(1);

}

/**
 *
 * A logger.
 *
 */
const log: NodeLogger = new NodeLogger({});

/**
 *
 * Logger tests. Logger can be called standalone, like the following
 * entries, or it can be called with an express HTTP Response, in
 * which case a lot of info will come from it. This way of logging
 * is mostly used at automatic HTTP processing at the httpserver module,
 * method processResponse.
 *
 */
log.logDebug({
  methodName: "logDebug",
  moduleName: "main",
  message: "message"
});

log.logWarn({
  methodName: "logWarn",
  moduleName: "main",
  message: "message",
  payload: { a: 0, b: 1 }
});

log.logError({
  methodName: "logError",
  moduleName: "main",
  message: "message",
  payload: { a: 0, b: 1 }
});

// This is a bare log entry
log.logInfo({
  methodName: "logInfo",
  moduleName: "main",
  message: "message"
});

// This has payload
log.logInfo({
  methodName: "logDebug",
  moduleName: "main",
  message: "message",
  payload: { a: 0, b: 1 }
});

/**
 *
 * Persistence.
 *
 */
// Tiny module with SQL logic
const pg: Pg = new Pg();
const redis: Redis = new Redis();

// A connection
const pgConn = new RxPg({
  maxPoolSize: 10,
  host: "postgis"
})

/**
 *
 * Create a token.
 *
 */
const token: JwtToken = new JwtToken("secrest", "1h");

/**
 *
 * The HTTP server.
 *
 */
new HttpServer({

  statics: [
    {
      localPath: "/test_data",
      urlBaseRoot: "/test_data"
    }
  ],

  routes: [

    new TestRouter({
      pg: pg,
      pgCon: pgConn,
      redis: redis,
      urlBaseRoot: "/route",
      log: log,
      jwtToken: token
    })

  ]

})

/**
 *
 * Example of ORM object
 *
 */
// import { OrmTest } from "./ormtest";

// import * as rx from "rxjs";

// const o: OrmTest = new OrmTest({ a: 0, b: 1, c: "a", d: 2 });

// rx.concat(
//   o.pgInsert$(pgConn),
//   o.patch$({ c: "b", d: 3 }),
//   o.pgUpdate$(pgConn),
//   OrmTest.get$(pgConn, o.a, o.b),
//   o.pgDelete$(pgConn),
// )
// .subscribe(

//   (o: any) => { console.log("next", o) },

//   (e: any) => { console.log("error", e) },

//   () => { console.log("completed") }

// )
