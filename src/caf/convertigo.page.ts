import { C8oRouter }                                    from './convertigo.router'
import {NavParams, LoadingController, MenuController}                from 'ionic-angular';
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
  constructor(routerProvider : C8oRouter, public navParams: NavParams, loadingCtrl: LoadingController, sanitizer: DomSanitizer,
              ref: ChangeDetectorRef,injector: Injector, public menuCtrl: MenuController){

      super(injector, routerProvider, loadingCtrl, ref);
      this.routerProvider.storeResponseForView(this.constructor.name, navParams.get("requestable"), navParams.get("data"), this.navParams, navParams.get("didEnter") ,navParams.get("didLeave"));
  }


  /**
   * Runs when the page has loaded. This event only happens once per page being created. If a page leaves but is cached, then this event will not fire again on a subsequent viewing. The ionViewDidLoad event is good place to put your setup code for the page.
   */
  public ionViewDidLoad(){
      if(!(this.navParams.get("didLoad") == null || this.navParams.get("didLoad") == undefined || this.navParams.get("didLoad") == '')){
          this.navParams.get("didLoad")(this, this.routerProvider.c8o);
      }
  }

  /**
   * Runs when the page is about to enter and become the active page.
   */
  public ionViewWillEnter(){
      let pageMenu = this.menuCtrl.get(this.menuId);
      if(pageMenu){
          this.menuCtrl.enable(true, pageMenu.id);
      }
      if(!(this.navParams.get("willEnter") == null || this.navParams.get("willEnter") == undefined || this.navParams.get("willEnter") == '')){
          this.navParams.get("willEnter")(this, this.routerProvider.c8o);
      }
  }

  /**
   * Runs when the page has fully entered and is now the active page. This event will fire, whether it was the first load or a cached page.
   */
  public ionViewDidEnter(){
      this.didLoad = true;
      if(!(this.navParams.get("didEnter") == null || this.navParams.get("didEnter") == undefined || this.navParams.get("didEnter") == '')){
          this.navParams.get("didEnter")(this, this.routerProvider.c8o);
      }
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
      if(!(this.navParams.get("willLeave") == null || this.navParams.get("willLeave") == undefined || this.navParams.get("willLeave") == '')){
          this.navParams.get("willLeave")(this, this.routerProvider.c8o);
      }
  }

  /**
   * Runs when the page has finished leaving and is no longer the active page.
   */
  public ionViewDidLeave(){
      this.didleave = true;
      if(!(this.navParams.get("didLeave") == null || this.navParams.get("didLeave") == undefined || this.navParams.get("didLeave") == '')){
          this.navParams.get("didLeave")(this, this.routerProvider.c8o);
      }
  }

  /**
   * Runs when the page is about to be destroyed and have its elements removed.
   */
  public ionViewWillUnload(){
      if(!(this.navParams.get("willUnLoad") == null || this.navParams.get("willUnLoad") == undefined || this.navParams.get("willUnLoad") == '')){
          this.navParams.get("willUnLoad")(this, this.routerProvider.c8o);
      }
  }

  /**
   * Runs before the view can enter. This can be used as a sort of "guard" in authenticated views where you need to check permissions before the view can enter
   * Returning true or false allow or not to enter to the view
   */
  public ionViewCanEnter() {
    if(!(this.navParams.get("CanEnter") == null || this.navParams.get("CanEnter") == undefined || this.navParams.get("CanEnter") == '')){
     return this.navParams.get("CanEnter")(this, this.routerProvider.c8o);
    }

  }

  /**
   * Runs before the view can leave. This can be used as a sort of "guard" in authenticated views where you need to check permissions before the view can leave
   * Returning true or false allow or not to leave the view
   */
  public ionViewCanLeave() {
    this.closing = true;
    if(!(this.navParams.get("CanLeave") == null || this.navParams.get("CanLeave") == undefined || this.navParams.get("CanLeave") == '')){
      return  this.navParams.get("CanLeave")(this, this.routerProvider.c8o);
    }
  }
}
