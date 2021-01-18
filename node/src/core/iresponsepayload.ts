/**
 *
 * This interface packages a payload and a logPayload for
 * automatic responses to be handle by observables at
 * {@link processResponse} at the httpserver module.
 *
 */
export interface IResponsePayload {
  /**
   *
   * Full payload, mandatory.
   *
   */
  payload: any;
  /**
   *
   * Log payload, a subset of larger payload, optional.
   *
   */
  logPayload?: any;
  /**
   *
   * Download as JSON file? Provide a file name.
   *
   */
  fileName?: string;
  /**
   *
   * Download a binary file from disk, specify a path.
   *
   */
  downloadFile?: string;
  /**
   *
   * To be used with downloadFile, this parameters changes the name of the file
   * to be downloaded. Will default to downloadFile itself if not present.
   *
   */
  downloadName?: string;
}
