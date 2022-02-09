import * as _ from 'lodash';

export class C8oCafUtils{

  /**
   *
   * Creates a new Date Object, useful when called from a template as new operator is not allowed
   *
   * @param year
   * @param month
   * @param day
   * @param hours
   * @param minutes
   * @param seconds
   * @param milliseconds
   * @returns {Date}
   * @constructor
   */
  public static Date(year :any, month:any, day:any, hours:any, minutes:any, seconds:any, milliseconds:any): Date {
    if (year && month && day && hours && minutes && seconds && milliseconds)
    // all arguments are there , so use the Complete Date() constructor with 7 arguments
      return new Date(year, month, day, hours, minutes, seconds, milliseconds)
    if (year)
    // Only one , so it can be Date(millisecs) or Date(DateString)
      return new Date(year)
    // No Arguments, so use Date()
    return new Date()
  }


  /**
   * Merge two objects
   * @param {Object} firstObj
   * @param secondObj
   * @returns {Object}
   */
  public static merge(firstObj: Object, secondObj): Object{
    return Object.assign(firstObj, secondObj);
  }


  /**
   * Concat two words
   * @param {string} word
   * @returns {any}
   */
  public static wordPlusOne(word: string): any {
    if (word != undefined) {
      let word1 = word.slice(0, -1)
      let word2 = C8oCafUtils.getNextLetter(word)
      return word1 + word2;
    }
    else {
      return {};
    }
  }

  /**
   * Javascript method charCodeAt 0
   * @param {String} char: the char to be changed
   * @returns {String}
   */
  public static getNextLetter(char: String): String {
    let code: number = char.charCodeAt(0);
    code ++;
    return String.fromCharCode(code);
  }

    /**
     * Helps to safe eval the value of an path into an object or an array
     * @param object: the object to eval
     * @param path: the path to search
     * @returns {any}: the value fetched or undefined
     */
    public static resolveArray(object: any, path: string = null): any{
        try{
            if(_.has(object, path)){
                return _.get(object, path);
            }else{
                return undefined;
            }
        }
        catch(err){
            return undefined;
        }
    }

}
