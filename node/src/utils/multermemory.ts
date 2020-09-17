import multer from "multer";

/**
 *
 * This class handles a Multer middleware in memory.
 *
 */
export class MulterMemory{

  /**
   *
   * Multer.
   *
   */
  private _multer: any;

  /**
   *
   * Multer
   *
   */
  get multer(): any {

    return this._multer;

  }

  /**
   *
   * Constructor.
   *
   */
  constructor() {

    // Create a Multer
    this._multer = multer({

      storage: multer.memoryStorage()

    })

  }

}
