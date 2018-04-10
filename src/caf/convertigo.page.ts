import { C8oRouter }                                    from './convertigo.router'
import {NavParams, LoadingController, MenuController}                from 'ionic-angular';
import { DomSanitizer }                                 from '@angular/platform-browser';
import {ApplicationRef, ChangeDetectorRef, InjectionToken, Injector, Type} from "@angular/core";
import { C8o } from "c8osdkangular";
import * as ts from 'typescript';
import {C8oBase} from "./convertigo.base";



export class C8oPage extends C8oBase{
    public router: C8oRouter;
    private didLoad;
    private imgCache : Object = new Object();
    private prefixId : string;

    public c8o : C8o;
    public menuId : string;

    public didleave: boolean = false;
    public window: Window;
    public global;
    private local: any = {};
    private appRef: ApplicationRef;

    constructor(public injector: Injector, public routerProvider : C8oRouter, public loadingCtrl: LoadingController, public navParams: NavParams,  public sanitizer : DomSanitizer, public ref: ChangeDetectorRef, public menuCtrl: MenuController){

        super(injector, routerProvider, loadingCtrl);


        this.c8o = this.routerProvider.c8o;
        this.routerProvider.storeResponseForView(this.constructor.name, navParams.get("requestable"), navParams.get("data"), this.navParams, navParams.get("didEnter") ,navParams.get("didLeave"));
        this.prefixId = "_C8o" + new Date().getTime().toString();

        //shortcuts
        this.router = this.routerProvider;
        this.window = window
        this.appRef = this.getInstance(ApplicationRef);
        this.global = this.router.sharedObject;
        this.appRef = this.getInstance(ApplicationRef);
    }









    public tick(){
        this.ref.markForCheck();
        if (!this.ref["destroyed"]) {
            this.ref.detectChanges();
            this.appRef.tick();
        }
    }

    ngOnDestroy() {
        //supposed to detach mark from view to avoid 'ViewDestroyedError: Attempt to use a destroyed view: detectChanges' error
        this.ref.detach();
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

    public virtualListen(arg: any){
        if(arg == undefined){
            return [];
        }
        else{
            return arg;
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
        return this.router.getAttachmentUrl(id, attachmentName, placeholderURL, this.imgCache, databaseName);
    }

     /**
     * Reset Image Cache.
     *
     *
     *
     * @param cacheEntry : the name of the Entry to clear. If not provided, clears all the entries
     *
     */
    public resetImageCache(cacheEntry: string= null ) {
        if (cacheEntry) {
            delete this.imgCache[cacheEntry]
            return;
        }
        this.imgCache = []
    }

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

    public safeEval(key: any, origin: string) {
        let val;
        try {
            val=eval(ts.transpile(key));
        }
        catch(e){

        }
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
