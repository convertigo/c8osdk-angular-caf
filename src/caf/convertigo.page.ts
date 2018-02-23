import { C8oRouter }                                    from './convertigo.router'
import {NavParams, LoadingController, MenuController}                from 'ionic-angular';
import { DomSanitizer }                                 from '@angular/platform-browser';
import {ChangeDetectorRef, InjectionToken, Injector, Type } from "@angular/core";
import { C8o } from "c8osdkangular";
import * as ts from 'typescript';



export class C8oPage {
    private loader;
    public router: C8oRouter;
    private didLoad;
    private imgCache : Object = new Object();
    private prefixId : string;
    public form = {};
    public c8o : C8o;
    public menuId : string;
    private shown: boolean = false;
    private finish: boolean = false;
    private count: number = 0;
    public didleave: boolean = false;
    public window: Window;

    constructor(public routerProvider : C8oRouter, public navParams: NavParams, public loadingCtrl: LoadingController, public sanitizer : DomSanitizer, public ref: ChangeDetectorRef, public injector: Injector, public menuCtrl: MenuController){
        this.c8o = this.routerProvider.c8o;
        this.routerProvider.storeResponseForView(this.constructor.name, navParams.get("requestable"), navParams.get("data"), this.navParams, navParams.get("didEnter") ,navParams.get("didLeave"));
        this.prefixId = "_C8o" + new Date().getTime().toString();
        //shortcut
        this.router = this.routerProvider;
        this.window = window
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
     * Gets the data from previous called requestable list. can be used in an Angular 2 directive such as
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

    callForm(requestable:string, id: string){
        this.call(requestable, this.form[id]);
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
                        this.loader.dismiss();
                    }
                    resolve();
                }
                reject(error)
            });
        });

    }
    public tick(){
        this.ref.markForCheck();
        if (!this.ref["destroyed"])
            this.ref.detectChanges()
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
     * @param	id              the DocumentID to get the attachment from
     * @param   attachmentName  name of the attachment to display (eg: image.jpg)
     * @param   placeholderUrl  the url to display while we get the attachment (This is an Async process)
     * @param   databaseName    the Qname of a FS database (eg project.fsdatabase) to get the attachment from.
     *
     */
    public getAttachmentUrl(id: string, attachmentName: string, placeholderURL : string, databaseName?: string): Object{
        if(id != null && attachmentName && databaseName){
            databaseName = databaseName.split('.')[1]
            if(this.imgCache[id+"/"+attachmentName] == undefined){
                this.imgCache[id+"/"+attachmentName] = placeholderURL
                this.routerProvider.c8o.get_attachment(id, attachmentName, databaseName).then((response)=>{
                    this.imgCache[id+"/"+attachmentName] = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(response))
                });
            }
            return this.imgCache[id+"/"+attachmentName]
        } else {
            this.c8o.log.error("[MB] getAttachmentUrl Missing parameters...")
        }
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
