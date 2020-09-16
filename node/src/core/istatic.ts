/**
 * 
 * This is an interface for defining Express statics, that is,
 * folders served "as is" by the API.
 * 
 */
export interface IStatic {

  urlBaseRoot: string;
  localPath: string;

}
