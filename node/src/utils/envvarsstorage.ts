/**
 * 
 * This class handle the read and storage of app-global variables that
 * are initialised from env vars.
 * 
 */
export class EnvVarsStorage {

  // The storage
  private _envVarsStorage: { [ key: string ]: any };

  get envVarsStorage() {

    return this._envVarsStorage;

  }

  get e() {

    return this._envVarsStorage;

  }

  /**
   * 
   * Constructor
   * 
   */
  constructor(...envVarsNames: string[]) {

    this._envVarsStorage = {};

    envVarsNames.map((x) => {

      if (process.env[x] === null || process.env[x] === undefined) {

        throw(`ENV VAR ${x} not set`);

      } else {

        this._envVarsStorage[x] = process.env[x];

      }

    });

  }

}