import {ApplicationRef, ChangeDetectorRef, InjectionToken, Injector, Type} from "@angular/core";
import {C8oRouter} from "./convertigo.router";
import {LoadingController} from "ionic-angular";
import {Loading} from "ionic-angular/components/loading/loading";
import {C8o} from "c8osdkangular";
import * as ts from 'typescript';
import * as _ from 'lodash';

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
  public c8o : C8o;
  // An application Ref instance
  public appRef: ApplicationRef;
  // A flag that is set to true if the Current page has been leaved
  public didleave: boolean = false;
  // A flag that is set to true if a loader is displayed
  private shown: boolean = false;
  // A flag that is set to true if the current main call is finished
  private finish: boolean = false;
  // A flag that helps to count how much call are running at the same time
  private count: number = 0;
  // A unique loader object for the page that is instantiate whenever we made a call
  private loader: Loading;
  // An object containing cache for images loaded
  private imgCache: Object;
  // A prefix id for this instance
  private prefixId : string;

  /**
   * C8oPageBase: Page Base for C8oPage and app component
   * @param {Injector} injector
   * @param {C8oRouter} routerProvider
   * @param {LoadingController} loadingCtrl
   * @param {ChangeDetectorRef} ref
   */
  constructor(public injector: Injector, public routerProvider : C8oRouter, public loadingCtrl: LoadingController, public ref: ChangeDetectorRef){

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

  // Detach mark from view to avoid error (linked to tick function)
  ngOnDestroy() {
    this.ref.detach();
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
  public getInstance<T>(token: Type<T>|InjectionToken<T>, notFoundValue?: T): T{
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
  public listen(requestables : string[]) : any {
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
  public deleteListen(requestables : string[]) : any {
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
  public listenNavParams(requestable : string) : any {
    return(this.routerProvider.getParamForView(this.constructor.name, requestable));
  }

  /**
   * Calls a Convertigo requestable with parameters as Object
   * @param requestable: the requestable to call (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
   * @param data: the data to send to the requestable (for example {"var1" : "value1, ..., "var2" : "value2}) (default value is null)
   * @param navParams: the navParams to give (default value is null)
   * @param {number} timeout: The timeout before trigger loading controller (default value is 3000)
   * @returns {Promise<any>}
   */
  public call(requestable, data: any = null, navParams : any = null, timeout : number = 3000): Promise<any> {
    if(this.form != {} && data == null){
      data = this.form;
    }
    setTimeout(()=> {
      if(this.finish == false){
        if(this.shown != true){
          this.loader = this.loadingCtrl.create({});
          this.loader.present();
          this.shown = true;
        }
        this.count ++;
      }
    }, timeout);

    return new Promise((resolve, reject) => {
      this.routerProvider.c8oCall(requestable, data, navParams, this).then((response) => {
        this.finish = true;
        if (this.shown == true) {
          this.count--;
          if (this.count == 0) {
            this.shown = false;
            this.loader.dismiss();
          }
        }
        resolve(response);
      }).catch((error) => {
        this.finish = true;
        if (this.shown == true) {
          this.count--;
          if (this.count == 0) {
            this.shown = false;
            this.loader.dismiss();
          }
        }
        reject(error);
      });
    });
  }

  /**
   * Calls a Convertigo requestable with parameters as Object from a given form
   * @param {string} requestable: the requestable to call (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
   * @param {string} id: the id of the form
   * @returns {Promise<any>}
   */
  public callForm(requestable:string, id: string): Promise<any> {
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
   * @param {string} id: the DocumentID to get the attachment from
   * @param {string} attachmentName: name of the attachment to display (eg: image.jpg)
   * @param {string} placeholderURL: the url to display while we get the attachment (This is an Async process)
   * @param {string} databaseName: the Qname of a FS database (ex project.fsdatabase) to get the attachment from.
   * @returns {Object}
   */
  public getAttachmentUrl(id: string, attachmentName: string, placeholderURL : string, databaseName?: string): Object{
    return this.routerProvider.getAttachmentUrl(id, attachmentName, placeholderURL, this.imgCache, databaseName);
  }

  /**
   * Reset Image Cache.
   * @param {string} cacheEntry: Name of the Entry to clear. If not provided, clears all the entries
   */
  public resetImageCache(cacheEntry: string = null ): void {
    if (cacheEntry) {
      delete this.imgCache[cacheEntry];
      return;
    }
    this.imgCache = [];
  }

  /**
   * safeEval a string expression
   * @param key
   */
  public safeEval(key: any) {
    let val;
    try {
      val=eval(ts.transpile(key)).call(this);
    }
    catch(e){}
    return val;
  }

  /**
   * Handles automatically Errors coming from called promises
   * @param {Promise<any>} p The promise returned by a CAF function eg : (click)="resolveError(actionBeans.CallSequenceAction(this,{cacheTtl: 3000, ...},{}))
   * @returns {Promise<any>}
   */
  public resolveError(p: Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      p.then((res) => {
        resolve(res);
      }).catch((err) => {
        this.c8o.log.error("[CAF] Resolve Error : " + err)
        resolve(err);
      });
    });
  }

  /**
   * Get page definition from it's title
   * @param {string} pageTitle
   * @returns {string}
   */
  public getPageByTitle(pageTitle: string): string {
    for (let p of this.routerProvider.pagesArray){
      if (p["title"] == pageTitle) {
        return p.component;
      }
    }
  }

  /**
   * Get page definition from it's name
   * @param {string} pageName
   * @returns {string}
   */
  public getPageByName(pageName: string): string {
    for (let p of this.routerProvider.pagesArray){
      if (p["component"].nameStatic == pageName || p["component"].name == pageName) {
        return p.component;
      }
    }
  }


  /**
   * Helps to safe eval the value of an path into an object or an array
   * @param object: the object to eval
   * @param path: the path to search
   * @returns {any}: the value fetched or undefined
   */
  public resolveArray(object: any, path: string = null): any{
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
