import { ApplicationRef, ChangeDetectorRef, InjectionToken, Injector, Type } from "@angular/core";
import { C8oRouter } from "./convertigo.router";
import { LoadingController, Loading } from "ionic-angular";
import { C8o } from "c8osdkangular";
import * as ts from 'typescript';
import { C8oCafUtils } from "./convertigo.utils";

export class C8oPageBase {

  // Data attached to the main form of the page if its existing
  public form = {};
  // A local Object to be used
  public local: any;
  // A shortcut to window
  public window: Window;
  // A shortcut to use routerProvider
  public router: C8oRouter;
  // A shortcut to use router's shared Object
  public global: any;
  // A shortcut to use router's C8o Object
  public c8o: C8o;
  // An application Ref instance
  public appRef: ApplicationRef;
  // A flag that is set to true if the Current page has been leaved
  public didleave: boolean = false;
  // A flag that is set to true if a loader is displayed
  public shown: boolean = false;
  // A flag that helps to count how much call are running at the same time
  private count: number = 0;
  // A unique loader object for the page that is instantiate whenever we made a call
  public loader: Loading;
  // An object containing cache for images loaded
  private imgCache: Object;
  // A prefix id for this instance
  private prefixId: string;
  // A flag to kwnow if window is closing
  public closing: boolean = false;

  /**
   * C8oPageBase: Page Base for C8oPage and app component
   *
   * @param {Injector} injector
   * @param {C8oRouter} routerProvider
   * @param {LoadingController} loadingCtrl
   * @param {ChangeDetectorRef} ref
   */
  constructor(public injector: Injector, public routerProvider: C8oRouter, public loadingCtrl: LoadingController, public ref: ChangeDetectorRef) {

    // Getting additional Injectors
    this.appRef = this.getInstance(ApplicationRef);

    // Instantiating shortcuts
    this.router = this.routerProvider;
    this.global = this.routerProvider.sharedObject;
    this.c8o = this.routerProvider.c8o;
    this.local = new Object();

    // Instantiating image cache object
    this.imgCache = new Object();

    // Instantiating window
    this.window = window;

    //Instantiating prefix ID
    this.prefixId = "_C8o" + new Date().getTime().toString();
  }

  // Detach mark from view to avoid error (linked to tick function), and disable loader
  ngOnDestroy() {
    this.closing = true;
    this.ref.detach();
    if (this.loader != undefined) {
      this.loader.dismiss()
      .then((res)=>{

      }).catch((err)=>{
        // catching error of dismissing
      })
    }
  }

  /**
   * Retrieves an instance from the injector based on the provided token.
   * If not found:
   * - Throws an error if no `notFoundValue` that is not equal to
   * Injector.THROW_IF_NOT_FOUND is given
   * - Returns the `notFoundValue` otherwise
   *
   * @param token: Type<T>|InjectionToken<T>,  A token with the needed type
   * @param notFoundValue: T
   *
   * @returns An instance of the given token, or an error if not found
   */
  public getInstance<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T): T {
    return this.injector.get(token, notFoundValue);
  }

  /**
   Gets the data from previous called requestable list. can be used in an Angular 5 directive such as
   *
   *   *ngFor="let category of listen(['fs://.view']).rows" or
   *   *ngFor="let Page2 of listen(['fs://.view', 'fs://.view#search']).rows"
   *
   * @param {string[]} requestables: an array of requestables (string)
   * @returns {any}: the data for the first requestable to match is returned
   */
  public listen(requestables: string[]): any {
    return this.routerProvider.getResponseForView(this.constructor.name, requestables);
  }
  /**
   Delete the data from previous called requestable list. can be used in an Angular 5 directive such as
   *
   *   *ngFor="let category of listen(['fs://.view']).rows" or
   *   *ngFor="let Page2 of listen(['fs://.view', 'fs://.view#search']).rows"
   *
   * @param {string[]} requestables: an array of requestables (string)
   * @returns {boolean}: true if succeed
   */
  public deleteListen(requestables: string[]): any {
    return this.routerProvider.deleteResponseForView(this.constructor.name, requestables);
  }


  /**
   * Gets the data from previous called requestable list. can be used in an Angular 2 directive such as
   *
   *   *ngFor="let category of listen(['fs://.view']).rows" or
   *   *ngFor="let Page2 of listen(['fs://.view', 'fs://.view#search']).rows"
   *
   * The data for the first requestable to match is returned
   *
   * @return the data for one of the requestables in the list.
   */
  public listenNavParams(requestable: string): any {
    return (this.routerProvider.getParamForView(this.constructor.name, requestable));
  }

  /**
   * Calls a Convertigo requestable with parameters as Object
   *
   * @param requestable: the requestable to call (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
   * @param data: the data to send to the requestable (for example {"var1" : "value1, ..., "var2" : "value2}) (default value is null)
   * @param navParams: the navParams to give (default value is null)
   * @param {number} timeout: The timeout before trigger loading controller (default value is 3000)
   * @returns {Promise<any>}
   */
  public call(requestable, data: any = null, navParams: any = null, timeout: number = 3000, noLaoding: boolean = false): Promise<any> {
    // A flag that is set to true if the current main call is finished
    let finish: boolean = false;
    if (this.form != {} && data == null) {
      data = this.form;
    }
    if (!noLaoding) {
      setTimeout(() => {
        if (finish == false) {
          if (this.shown != true) {
            this.loader = this.loadingCtrl.create({});
            if (!this.closing) {
              this.loader.present()
              this.shown = true;
            }
          }
          this.count++;
        }
      }, timeout);
    }


    return new Promise((resolve, reject) => {
      this.routerProvider.c8oCall(requestable, data, navParams, this)
        .then((response) => {
          if (!noLaoding) {
            finish = true;
            if (this.shown == true) {
              this.count--;
              if (this.count == 0) {
                this.shown = false;
                if(this.loader != undefined){
                  this.loader.dismiss()
                  .then((res)=>{

                  }).catch((err)=>{
                    // catching error of dismissing
                  })
                }
              }
            }
          }
          resolve(response);

        }).catch((error) => {
          if (!noLaoding) {
            finish = true;
            if (this.shown == true) {
              this.count--;
              if (this.count == 0) {
                this.shown = false;
                if(this.loader != undefined){
                  this.loader.dismiss()
                  .then((res)=>{

                  }).catch((err)=>{
                    // catching error of dismissing
                  })
                }
              }
            }
          }
          reject(error);
        });
    });
  }

  /**
   * Calls a Convertigo requestable with parameters as Object from a given form
   *
   * @param {string} requestable: the requestable to call (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
   * @param {string} id: the id of the form
   * @returns {Promise<any>}
   */
  public callForm(requestable: string, id: string): Promise<any> {
    return this.call(requestable, this.form[id]);
  }

  /**
   * Mark, the current view in to check state, then detect changes and tick the application ref
   *
   */
  public tick(): void {
    this.ref.markForCheck();
    if (!this.ref["destroyed"]) {
      this.ref.detectChanges();
      this.appRef.tick();
    }
  }

  /**
   * Get attachment data url a requestable response to be displayed
   *
   * @param {string} id: the DocumentID to get the attachment from
   * @param {string} attachmentName: name of the attachment to display (eg: image.jpg)
   * @param {string} placeholderURL: the url to display while we get the attachment (This is an Async process)
   * @param {string} databaseName: the Qname of a FS database (ex project.fsdatabase) to get the attachment from.
   * @returns {Object}
   */
  public getAttachmentUrl(id: string, attachmentName: string, placeholderURL: string, databaseName?: string): Object {
    return this.routerProvider.getAttachmentUrl(id, attachmentName, placeholderURL, this.imgCache, databaseName);
  }

  /**
   * Reset Image Cache.
   *
   * @param {string} cacheEntry: Name of the Entry to clear. If not provided, clears all the entries
   */
  public resetImageCache(cacheEntry: string = null): void {
    if (cacheEntry) {
      delete this.imgCache[cacheEntry];
      return;
    }
    this.imgCache = [];
  }

  /**
   * safeEval a string expression
   *
   * @param key
   */
  public safeEval(key: any) {
    let val;
    try {
      val = eval(ts.transpile(key)).call(this);
    }
    catch (e) { }
    return val;
  }

  /**
   * Handles automatically Errors coming from called promises
   *
   * @param {Promise<any>} p The promise returned by a CAF function eg : (click)="resolveError(actionBeans.CallSequenceAction(this,{cacheTtl: 3000, ...},{}))
   * @returns {Promise<any>}
   */
  public resolveError(p: Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      p.then((res) => {
        resolve(res);
      }).catch((err) => {
        this.c8o.log.error("[CAF] Resolve Error : " ,err)
        resolve(err);
      });
    });
  }

  /**
   * Get page definition from it's title
   *
   * @param {string} pageTitle
   * @returns {string}
   */
  public getPageByTitle(pageTitle: string): string {
    for (let p of this.routerProvider.pagesArray) {
      if (p["title"] == pageTitle) {
        return p.component;
      }
    }
  }

  /**
   * Get page definition from it's name
   *
   * @param {string} pageName
   * @returns {string}
   */
  public getPageByName(pageName: string): string {
    for (let p of this.routerProvider.pagesArray) {
      if (p["component"].nameStatic == pageName || p["component"].name == pageName) {
        return p.component;
      }
    }
  }


  /**
   * Helps to safe eval the value of an path into an object or an array
   * This is a shortcut to acess to static function of C8oCafUtils
   *
   * @param object: the object to eval
   * @param path: the path to search
   * @returns {any}: the value fetched or undefined
   */
  public resolveArray(object: any, path: string = null): any {
    return C8oCafUtils.resolveArray(object, path);
  }


  /**
  * Concat two words
  * @param {string} word
  * @returns {any}
  */
  public wordPlusOne(word: string): any {
    //this.c8o.log.warn("[CAF] @Deprecated: This method will be removed in future versions, please use static method: C8oCafUtils.wordPlusOne(word) instead");
    C8oCafUtils.wordPlusOne(word);
  }

  /**
  * Merge two objects
  * @param {Object} firstObj
  * @param secondObj
  * @returns {Object}
  */
  public merge(firstObj: Object, secondObj): Object {
    //this.c8o.log.warn("[CAF] @Deprecated: This method will be removed in future versions, please use static method: C8oCafUtils.merge(firstObj: Object, secondObj) instead");
    return C8oCafUtils.merge(firstObj, secondObj);
  }

  /**
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
  public Date(year: any, month: any, day: any, hours: any, minutes: any, seconds: any, milliseconds: any) {
    //this.c8o.log.warn("[CAF] @Deprecated: This method will be removed in future versions, please use static method: C8oCafUtils.Date(year :any, month:any, day:any, hours:any, minutes:any, seconds:any, milliseconds:any) instead");
    return C8oCafUtils.Date(year, month, day, hours, minutes, seconds, milliseconds);
  }

  /**
   * This functions is helpfull to know if a string version is greater than another
   * @param v1 string version
   * @param v2 string version
   * @param separator separator between subversions default value is "."
   * 
   * @returns true if v1 < v2 otherwise returns false
   */
  public compare(v1:string, v2: string, separator: string = "."){
    let v1Tab: Array<string> = v1.split(separator);
    let v2Tab: Array<string> = v2.split(separator);
    for(let i in v1Tab){
      let v1Num = +v1Tab[i];
      let v2Num = +v2Tab[i];
      if(v1Num < v2Num){
        return true;
      }
      else if(v1Num > v2Num){
        return false;
      }
    }
    return false;
  }
}