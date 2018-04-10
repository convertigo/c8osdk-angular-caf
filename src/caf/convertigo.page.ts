import { C8oRouter }                                    from './convertigo.router'
import {NavParams, LoadingController, MenuController}                from 'ionic-angular';
import { DomSanitizer }                                 from '@angular/platform-browser';
import {ApplicationRef, ChangeDetectorRef, InjectionToken, Injector, Type} from "@angular/core";
import {C8oPageBase} from "./convertigo.base";



export class C8oPage extends C8oPageBase{

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

    public getPageByTitle(pageTitle: string) {
      for (let p of this.routerProvider.pagesArray){
        if (p["title"] == pageTitle) {
          return p.component;
        }
      }
    }

    public getPageByName(pageName: string) {
      for (let p of this.routerProvider.pagesArray){
        if (p["component"].nameStatic == pageName || p["component"].name == pageName) {
          return p.component;
        }
      }
    }

    public virtualListen(arg: any){
        if(arg == undefined){
            return [];
        }
        else{
            return arg;
        }
    }

    /**
     * Javascript method charCodeAt 0
     * @param {String} index: the index
     * @returns {String}
     */
    public getNextLetter(char: String): String {
      let code: number = char.charCodeAt(0);
      code ++;
      return String.fromCharCode(code);
    }

    public wordPlusOne(word: string): any {
        if (word != undefined) {
            let word1 = word.slice(0, -1)
            let word2 = this.getNextLetter(word)
            return word1 + word2;
        }
        else {
            return {};
        }
    }
    public merge(firstObj: Object, secondObj): Object{
        return Object.assign(firstObj, secondObj);
    }

   /**
     * Creates a new Date Object, useful when called from a template as new operator is not allowed
     */
    public Date(year :any, month:any, day:any, hours:any, minutes:any, seconds:any, milliseconds:any) {
        if (year && month && day && hours && minutes && seconds && milliseconds)
            // all arguments are there , so use the Complete Date() constructor with 7 arguments
            return new Date(year, month, day, hours, minutes, seconds, milliseconds)
        if (year)
            // Only one , so it can be Date(millisecs) or Date(DateString)
            return new Date(year)

        // No Arguments, so use Date()
        return new Date()
    }
}
