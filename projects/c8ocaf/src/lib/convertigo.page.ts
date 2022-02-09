import { C8oRouter }                                    from './convertigo.router'
import {LoadingController, MenuController}                from '@ionic/angular';
import { DomSanitizer }                                 from '@angular/platform-browser';
import {ChangeDetectorRef, Injectable, Injector} from "@angular/core";
import {C8oPageBase} from "./convertigo.base";

@Injectable()
export class C8oPage extends C8oPageBase {

  // A Menu ID for this instance
  public startMenuId :string;
  public endMenuId :string;
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
    }

  /**
   * Closes menu in a given page instance
   * @param that instance of the page
   */
 	async closeMenu(that) {
    try{
      await that.menuCtrl.close();
      that.menuCtrl.isOpen()
    }
    catch(e: any){
      this.c8o.log.error("[CAF] closeMenu has encountered an error  : ", e);
    }
	}
	
  /**
   * Enables menu in a given page instance
   * @param that instance of the page
   * @returns success: boolean
   */
  async enableMenus(that) {
    try{
      if (!(that.startMenuId == null || that.startMenuId == undefined || that.startMenuId == '')) {
        await that.menuCtrl.enable(true, that.startMenuId);
      }
      if (!(that.endMenuId == null || that.endMenuId == undefined || that.endMenuId == '')) {
        await that.menuCtrl.enable(true, that.endMenuId);
      }
      return true;
    }
    catch(e: any){
      this.c8o.log.error("[CAF] enableMenus has encountered an error  : ", e);
      return false;
    }
  }

  /**
   * Runs when the page is about to enter and become the active page.
   */
  public ionViewWillEnter(){
      this.closeMenu(this);
      this.enableMenus(this);
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
   * Runs when the page has finished leaving and is no longer the active page.
   */
  public ionViewDidLeave(){
    this.didleave = true;
  }

  /**
   * Fired once during component initialization. This event can be used to initialize local members and make calls into services that only need to be done once.
   */
  ngOnInit() {
    this.closing = false;
  } 

  /**
   * Fired right before Angular destroys the view. Useful for cleanup like unsubscribing from observables.
   */
  override ngOnDestroy() {
    super.ngOnDestroy();
    this.closing = true;
  }
}
