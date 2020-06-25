import { C8oRouter }                                    from './convertigo.router'
import {LoadingController, MenuController}                from '@ionic/angular';
import { DomSanitizer }                                 from '@angular/platform-browser';
import {ChangeDetectorRef, Injector} from "@angular/core";
import {C8oPageBase} from "./convertigo.base";

export class C8oPage extends C8oPageBase {

  // A Menu ID for this instance
  public menuId : string;
  private didLoad;

  /**
   * C8oPage : An Class inherited from C8oPageBase that give us more page specific methods
   * @param {C8oRouter} routerProvider
   * @param {NavParams} navParams
   * @param {LoadingController} loadingCtrl
   * @param {DomSanitizer} sanitizer
   * @param {ChangeDetectorRef} ref
   * @param {Injector} injector
   * @param {MenuController} menuCtrl
   */
  constructor(routerProvider : C8oRouter, loadingCtrl: LoadingController, sanitizer: DomSanitizer,
              ref: ChangeDetectorRef,injector: Injector, public menuCtrl: MenuController){

      super(injector, routerProvider, loadingCtrl, ref);
      //this.routerProvider.storeResponseForView(this.constructor.name, navParams.get("requestable"), navParams.get("data"), this.navParams, navParams.get("didEnter") ,navParams.get("didLeave"));
    }

  /**
   * Runs when the page is about to enter and become the active page.
   */
  public ionViewWillEnter(){
      this.closing = false;
      let pageMenu = this.menuCtrl.get(this.menuId);
      if(pageMenu){
          this.menuCtrl.enable(true, this.menuId);
      }
  }

  /**
   * Runs when the page has fully entered and is now the active page. This event will fire, whether it was the first load or a cached page.
   */
  public ionViewDidEnter(){
      this.didLoad = true;
      /* Handle Piwik Matomo if present */
      if (window["_paq"]) {
        window["_paq"].push(['setDocumentTitle', this.constructor.name]);
        window["_paq"].push(['trackPageView']);
      }
  }

  /**
   * Runs when the page is about to leave and no longer be the active page.
   */
  public ionViewWillLeave(){
      if(!(this.menuId == null || this.menuId == undefined || this.menuId == '')) {
          this.menuCtrl.enable(false, this.menuId);
      }
      
  }

  /**
   * Runs when the page has finished leaving and is no longer the active page.
   */
  public ionViewDidLeave(){
    this.didleave = true;
    this.closing = true;
  }
}
