import { C8oRouter }                                    from './convertigo.router'
import {NavParams, LoadingController, MenuController}                from 'ionic-angular';
import { DomSanitizer }                                 from '@angular/platform-browser';
import {ChangeDetectorRef, InjectionToken, Injector, Type } from "@angular/core";
import { C8o } from "c8osdkangular";



export class C8oPage {
    public router;
    public navParams;
    private loader;
    private didLoad;
    private imgCache : Object = new Object();
    private prefixId : string;
    public form = {};
    public c8o : C8o;
    public menuId : string;
    private shown: boolean = false;
    private finish: boolean = false;
    private count: number = 0;

    constructor(public routerProvider : C8oRouter, private navParam: NavParams, public loadingCtrl: LoadingController, private sanitizer : DomSanitizer, private ref: ChangeDetectorRef, private injector: Injector, private menuCtrl: MenuController){
        this.router = routerProvider;
        this.c8o = this.router.c8o;
        this.navParams = (navParam.get("navParams") != undefined && navParam.get("navParams") != null) ? navParam.get("navParams") : "";
        this.router.storeResponseForView(this.constructor.name, navParam.get("requestable"), navParam.get("data"), this.navParams, navParam.get("didEnter") ,navParam.get("didLeave"));
        this.prefixId = "_C8o" + new Date().getTime().toString();
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
        return this.router.getResponseForView(this.constructor.name, requestables);
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
        return(this.router.getParamForView(this.constructor.name, requestable));
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
            this.router.c8oCall(requestable, data, navParams, this).then(() => {
                this.finish = true;
                if (this.shown == true) {
                    this.count--;
                    if (this.count == 0) {
                        this.shown = false;
                        this.loader.dismiss();
                    }
                }
                resolve();
            }).catch(() => {
                this.finish = true;
                if (this.shown == true) {
                    this.count--;
                    if (this.count == 0) {
                        this.loader.dismiss();
                    }
                    resolve();
                }
            });
        });

    }
    public tick(){
        this.ref.markForCheck();
        this.ref.detectChanges()
    }

    ngOnDestroy() {
        //supposed to detach mark from view to avoid 'ViewDestroyedError: Attempt to use a destroyed view: detectChanges' error
        this.ref.detach();
    }

    public ionViewDidLoad(){

        if(!(this.navParam.get("didLoad") == null || this.navParam.get("didLoad") == undefined || this.navParam.get("didLoad") == '')){
            this.navParam.get("didLoad")(this, this.router.c8o);
        }
    }

    public ionViewWillEnter(){
        let pageMenu = this.menuCtrl.get(this.menuId);
        if(pageMenu){
            this.menuCtrl.enable(true, pageMenu.id);
        }
        if(!(this.navParam.get("willEnter") == null || this.navParam.get("willEnter") == undefined || this.navParam.get("willEnter") == '')){
            this.navParam.get("willEnter")(this, this.router.c8o);
        }
    }

    public ionViewDidEnter(){
        this.didLoad = true;
        if(!(this.navParam.get("didEnter") == null || this.navParam.get("didEnter") == undefined || this.navParam.get("didEnter") == '')){
            this.navParam.get("didEnter")(this, this.router.c8o);
        }
    }

    public ionViewWillLeave(){
        if(!(this.menuId == null || this.menuId == undefined || this.menuId == '')) {
            this.menuCtrl.enable(false, this.menuId);
        }
        if(!(this.navParam.get("willLeave") == null || this.navParam.get("willLeave") == undefined || this.navParam.get("willLeave") == '')){
            this.navParam.get("willLeave")(this, this.router.c8o);
        }
    }

    public ionViewDidLeave(){
        if(!(this.navParam.get("didLeave") == null || this.navParam.get("didLeave") == undefined || this.navParam.get("didLeave") == '')){
            this.navParam.get("didLeave")(this, this.router.c8o);
        }
    }

    public ionViewWillUnload(){
        if(!(this.navParam.get("willUnLoad") == null || this.navParam.get("willUnLoad") == undefined || this.navParam.get("willUnLoad") == '')){
            this.navParam.get("willUnLoad")(this, this.router.c8o);
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
     * Get attachment data url a requestable response
     *
     * @param	requestables, target requestable list to listen to and build attachment urls (examples : "Myproject.MySequence" or "fs://MyLocalDataBase.get")
     * @param	attachmentName , the name of the attachment to get
     *
     */
    public getAttachmentUrl(id: string, attachmentName: string, placeholderURL : string, databaseName?: string): Object{

        if(id != null){
            if(this.imgCache[id+"/"+attachmentName] == undefined){
                this.imgCache[id+"/"+attachmentName] = placeholderURL
                this.router.c8o.get_attachment(id, attachmentName, databaseName).then((response)=>{
                    this.imgCache[id+"/"+attachmentName] = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(response))
                });
            }
        }
        return this.imgCache[id+"/"+attachmentName]
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
        for (let p of this.router.pagesArray){
            if (p["title"] == pageTitle) {
                return p.component;
            }
        }
    }

    public getPageByName(pageName: string) {
        for (let p of this.router.pagesArray){
            if (p["component"].nameStatic == pageName || p["component"].name) {
                return p.component;
            }
        }
    }

}
