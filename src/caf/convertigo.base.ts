import {ApplicationRef, ChangeDetectorRef, InjectionToken, Injector, Type} from "@angular/core";
import {C8oRouter} from "./convertigo.router";
import {LoadingController} from "ionic-angular";
import {Loading} from "ionic-angular/components/loading/loading";
import {C8o} from "c8osdkangular";
import * as ts from 'typescript';

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
   * @return An instance of the given token, or an error if not found
   */
  public getInstance<T>(token: Type<T>|InjectionToken<T>, notFoundValue?: T): T{
    return this.injector.get(token, notFoundValue);
  }



  /**
   * Gets the data from previous called requestable list. can be used in an Angular 5 directive such as
   *
   *   *ngFor="let category of listen(['fs://.view']).rows" or
   *   *ngFor="let Page2 of listen(['fs://.view', 'fs://.view#search']).rows"
   *
   * The data for the first requestable to match is returned
   *
   * @return the data for one of the requestables in the list.
   */
  public listen(requestables : string[]) : any {
    return this.routerProvider.getResponseForView(this.constructor.name, requestables);
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
   *
   * @param	requestable the requestable to call (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
   * @param	data , the data to send to the requestable (for example {"var1" : "value1, ..., "var2" : "value2})
   *
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
   *
   * @param	requestable, the requestable to call (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
   * @param	id, the id of the form
   *
   */
  public callForm(requestable:string, id: string) {
    this.call(requestable, this.form[id]);
  }

  /**
   * Mark, the current view in to check state, then detect changes and tick the application ref
   *
   */
  public tick(){
    this.ref.markForCheck();
    if (!this.ref["destroyed"]) {
      this.ref.detectChanges();
      this.appRef.tick();
    }
  }

  /**
   * Get attachment data url a requestable response to be displayed
   *
   * @param id             the DocumentID to get the attachment from
   * @param attachmentName  name of the attachment to display (eg: image.jpg)
   * @param placeholderURL  the url to display while we get the attachment (This is an Async process)
   * @param databaseName    the Qname of a FS database (ex project.fsdatabase) to get the attachment from.
   *
   */
  public getAttachmentUrl(id: string, attachmentName: string, placeholderURL : string, databaseName?: string): Object{
    return this.routerProvider.getAttachmentUrl(id, attachmentName, placeholderURL, this.imgCache, databaseName);
  }

  /**
   * Reset Image Cache.
   *
   * @param cacheEntry : Name of the Entry to clear. If not provided, clears all the entries
   *
   */
  public resetImageCache(cacheEntry: string= null ) {
    if (cacheEntry) {
      delete this.imgCache[cacheEntry]
      return;
    }
    this.imgCache = []
  }

  /**
   * safeEval a string expression
   * @param key
   */
  public safeEval(key: any) {
    let val;
    try {
      val=eval(ts.transpile(key));
    }
    catch(e){}
    return val;
  }

  /**
   * Handles automatically Errors coming from called promises
   * @param p The promise returned by a CAF function eg : (click)="resolveError(actionBeans.CallSequenceAction(this,{cacheTtl: 3000, ...},{}))
   */
  public resolveError(p: Promise<any>):Promise<any> {
    return new Promise((resolve, reject) => {
      p.then((res) => {
        resolve(res);
      }).catch((err) => {
        this.c8o.log.error("[MB] Resolve Error : " + err)
        resolve(err);
      });
    });
  }
}
