import {InjectionToken, Injector, Type} from "@angular/core";
import {C8oRouter} from "./convertigo.router";
import {LoadingController} from "ionic-angular";

export class C8oBase {

  // Data attached to the main for of teh page if its existing
  public form = {};
  // A flag that is set to true if a loader is displayed
  private shown: boolean = false;
  // A flag that is set to true if the current main call is finished
  private finish: boolean = false;
  // A flag that helps to count how much call are running at the same time
  private count: number = 0;

  private loader;

  constructor(public injector: Injector, public routerProvider : C8oRouter, public loadingCtrl: LoadingController){

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
    //this.router.getResponseForView('_C80_GeneralView', ['fs://fs_monmobile.view');
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
          this.loader = this.loadingCtrl.create({
          });
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
        reject(error)
      });
    });

  }

  /**
   * Calls a Convertigo requestable with parameters as Object from a given form
   *
   * @param	requestable the requestable to call (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
   * @param	id , the id of the form
   *
   */
  callForm(requestable:string, id: string){
    this.call(requestable, this.form[id]);
  }













}
