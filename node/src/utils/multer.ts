import * as multer from "multer";

import * as utilPath from "path";

import { NodeUtilsHashing, NodeUtilsFiles } from "@malkab/node-utils";

/**
 * 
 * This class handles a Multer middleware.
 * 
 */
export class Multer{

  /**
   * 
   * Storage path.
   * 
   */
  private _storagePath: string;

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
  constructor(storagePath: string, originalName: boolean = false) {

    this._storagePath = storagePath;

    // If exists, fails
    try {

      NodeUtilsFiles.mkdirSync(storagePath);

    } catch(e) {

      console.log(`Multer: folder ${storagePath} already exists`);

    }

    // Create a Multer
    this._multer = multer({
      
      storage: multer.diskStorage({

        destination: (req: any, file: any, cb: any) => {
  
          cb(null, this._storagePath);
      
        },
      
        filename: (req: any, file: any, cb: any) => {

          if (originalName === false) {

            const fileData = utilPath.parse(file.originalname);

            cb(null, `${NodeUtilsHashing.genUid()}${fileData.ext}`);

          } else {

            cb(null, file.originalname);

          }
      
        }

      })

    })

  }

}
