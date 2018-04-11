import { C8oRouter }                                    from './convertigo.router'
import {NavParams, LoadingController, MenuController}                from 'ionic-angular';
import { DomSanitizer }                                 from '@angular/platform-browser';
import {ChangeDetectorRef, Injector} from "@angular/core";
import {C8oPageBase} from "./convertigo.base";
import {C8oCafUtils} from "./convertigo.utils";

export class C8oPage extends C8oPageBase {

    public menuId : string;
    private didLoad;
    private prefixId : string;

    constructor(routerProvider : C8oRouter, public navParams: NavParams, loadingCtrl: LoadingController, sanitizer: DomSanitizer,
                ref: ChangeDetectorRef,injector: Injector, public menuCtrl: MenuController){

        super(injector, routerProvider, loadingCtrl, ref);
        this.routerProvider.storeResponseForView(this.constructor.name, navParams.get("requestable"), navParams.get("data"), this.navParams, navParams.get("didEnter") ,navParams.get("didLeave"));
        this.prefixId = "_C8o" + new Date().getTime().toString();
    }


    public ionViewDidLoad(){
        if(!(this.navParams.get("didLoad") == null || this.navParams.get("didLoad") == undefined || this.navParams.get("didLoad") == '')){
            this.navParams.get("didLoad")(this, this.routerProvider.c8o);
        }
    }

    public ionViewWillEnter(){
        let pageMenu = this.menuCtrl.get(this.menuId);
        if(pageMenu){
            this.menuCtrl.enable(true, pageMenu.id);
        }
        if(!(this.navParams.get("willEnter") == null || this.navParams.get("willEnter") == undefined || this.navParams.get("willEnter") == '')){
            this.navParams.get("willEnter")(this, this.routerProvider.c8o);
        }
    }

    public ionViewDidEnter(){
        this.didLoad = true;
        if(!(this.navParams.get("didEnter") == null || this.navParams.get("didEnter") == undefined || this.navParams.get("didEnter") == '')){
            this.navParams.get("didEnter")(this, this.routerProvider.c8o);
        }
    }

    public ionViewWillLeave(){
        if(!(this.menuId == null || this.menuId == undefined || this.menuId == '')) {
            this.menuCtrl.enable(false, this.menuId);
        }
        if(!(this.navParams.get("willLeave") == null || this.navParams.get("willLeave") == undefined || this.navParams.get("willLeave") == '')){
            this.navParams.get("willLeave")(this, this.routerProvider.c8o);
        }
    }

    public ionViewDidLeave(){
        this.didleave = true;
        if(!(this.navParams.get("didLeave") == null || this.navParams.get("didLeave") == undefined || this.navParams.get("didLeave") == '')){
            this.navParams.get("didLeave")(this, this.routerProvider.c8o);
        }
    }

    public ionViewWillUnload(){
        if(!(this.navParams.get("willUnLoad") == null || this.navParams.get("willUnLoad") == undefined || this.navParams.get("willUnLoad") == '')){
            this.navParams.get("willUnLoad")(this, this.routerProvider.c8o);
        }
    }



  /**
   * @deprecated: Please use C8oCafUtils.wordPlusOne(word: string) instead
   *
   * Concat two words
   * @param {string} word
   * @returns {any}
   */
    public wordPlusOne(word: string): any {
      this.c8o.log.warn("[CAF] @Deprecated: This method will be removed in future versions, please use static method: C8oCafUtils.wordPlusOne(word) instead");
      C8oCafUtils.wordPlusOne(word);
    }

  /**
   * @deprecated: Please use C8oCafUtils.merge(firstObj: Object, secondObj) instead
   *
   * Merge two objects
   * @param {Object} firstObj
   * @param secondObj
   * @returns {Object}
   */
    public merge(firstObj: Object, secondObj): Object{
        this.c8o.log.warn("[CAF] @Deprecated: This method will be removed in future versions, please use static method: C8oCafUtils.merge(firstObj: Object, secondObj) instead");
        return C8oCafUtils.merge(firstObj, secondObj);
    }

  /**
   * @deprecated: Please use C8oCafUtils.Date(year :any, month:any, day:any, hours:any, minutes:any, seconds:any, milliseconds:any) instead
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
    public Date(year :any, month:any, day:any, hours:any, minutes:any, seconds:any, milliseconds:any) {
        this.c8o.log.warn("[CAF] @Deprecated: This method will be removed in future versions, please use static method: C8oCafUtils.Date(year :any, month:any, day:any, hours:any, minutes:any, seconds:any, milliseconds:any) instead");
        return C8oCafUtils.Date(year, month, day, hours, minutes, seconds, milliseconds);
    }
}
