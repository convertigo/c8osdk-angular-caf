import { App, Nav } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { C8oRouteListener } from './convertigo.routingtable';

import { C8o, C8oLogLevel, C8oException, C8oLocalCache, Priority } from "c8osdkangular";
import { DomSanitizer } from "@angular/platform-browser";
import { C8oPageBase } from "./convertigo.base";

//import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';



/*
 * The C8oRouter class is responsible to route Convertigo responses to the according View. This ensures that navigation is done
 * Automatically from Convertigo server responses and avoids the programmer to handle the navigation by itself
 *
 */
@Injectable()
export class C8oRouter {
    /**
     * An array holding for a view index the data attached to this view.
     */
    private c8oResponses: Array<Object> = null;
    private _routerLogLevel: C8oLogLevel;
    private static C8OCAF_SESSION_STORAGE_DATA = "_c8ocafsession_storage_data";
    private static C8OCAF_SESSION_STORAGE_MODE = "_c8ocafsession_storage_mode";
    private static C8OCAF_SESSION_STORAGE_CLEAR = "_c8ocafsession_storage_clear";
    private storage: any;
    public pagesArray = [];
    public pagesKeyValue = {};
    public sharedObject: any = {};


    constructor(private _c8o: C8o, private app: App, public toastCtrl: ToastController, public sanitizer: DomSanitizer,/* private nativePageTransitions: NativePageTransitions = null*/) {
        //detect if we are in mobile builder mode and get the mode of storage to use
        this._routerLogLevel = C8oLogLevel.DEBUG;
        switch (sessionStorage.getItem(C8oRouter.C8OCAF_SESSION_STORAGE_MODE)) {
            case "local":
                this.storage = localStorage;
                break;
            case "session":
                this.storage = sessionStorage;
                break;
            default:
                this.storage = null;
        }

        // if we are in mobile builder mode
        if (this.storage !== null) {
            if (sessionStorage.getItem(C8oRouter.C8OCAF_SESSION_STORAGE_CLEAR) === "true") {// clear flag
                this.storage.removeItem(C8oRouter.C8OCAF_SESSION_STORAGE_DATA);
                sessionStorage.removeItem(C8oRouter.C8OCAF_SESSION_STORAGE_CLEAR);
            }
            this.c8oResponses = JSON.parse(this.storage.getItem(C8oRouter.C8OCAF_SESSION_STORAGE_DATA));
        }
        // if c8oResponses is null then instanciate an empty array
        if (this.c8oResponses === null) {
            this.c8oResponses = new Array();
        }
    }

    get routerLogLevel(): C8oLogLevel {
        return this._routerLogLevel;
    }

    set routerLogLevel(value: C8oLogLevel) {
        this._routerLogLevel = value;
    }

    public log(message: string) {
        let lvl = "_"+this._routerLogLevel.name;

        if (lvl != "_none") {
            let msg = "[caf] " + message;
            this.c8o.log[lvl](msg)
        }
    }

    /**
     * Will be override by the app routing table
     * See convertigo.routing.table.js
     */
    private routing_table = Array<C8oRouteListener>();

    /**
     *
     * @param route
     * @returns {C8oRouter}
     */
    public addRouteListener(route: C8oRouteListener) {
        this.routing_table.push(route);
        return this;
    }

    /**
     *
     * @returns {C8o}
     */
    public get c8o(): C8o {
        return this._c8o
    }

    /**
     * Execute routing:
     *
     * Routing works by analysing a Convertigo response. Each route is explored. for a given requestable and if the
     * condition for the route matches, then the destination page is pushed or "rooted" in the navConsroller
     *
     * @param reponse       the Convertigo server response
     * @param parameters    the requestable in discrete "__sequence", "__project" property form
     * @param exception     optional exception if it is a failed requestable call
     *
     */
    execute_route(response: any, parameters: Object, exception: Error = null): Promise<any> {
        return new Promise((resolve) => {
            let isException = exception == null ? false : true;
            let requestable: string = (parameters["__project"] == undefined ? "" : parameters["__project"]) + "." + parameters["__sequence"];
            let errors: any = null;
            let activeView: any = null;
            try {
                this.app.getActiveNavs()[0].getViews().slice(-1)[0].component["nameStatic"]
            }
            catch (e) {
                errors = e;
            }
            if (errors == null) {
                try{
                    if (this.app.getActiveNavs()[0].getViews() != undefined && this.app.getActiveNavs()[0].getViews().slice(-1)[0] != undefined) {
                        if (this.app.getActiveNavs()[0].getViews().slice(-1)[0].component.name === "ModalCmp") {
                            activeView = this.app.getActiveNavs()[0].getViews().slice(-1)[0].data.component["nameStatic"];
                        }
                        else {
                            activeView = this.app.getActiveNavs()[0].getViews().slice(-1)[0].component["nameStatic"];
                        }
                    }
                    else {
                        activeView = null;
                    }
                }
                catch(e){
                    activeView = null;
                }
            }
            let navParams: any = (parameters["_navParams"] == {}) ? "" : parameters["_navParams"]
            for (var item of this.routing_table) {
                for (var itemRequestable of item.requestable) {
                    this.log("Exploring route for Requestable '" + itemRequestable + "'");
                    if (itemRequestable == requestable || itemRequestable == "*") {

                        for (var route of (isException == true ? item.routesFail : item.routes)) {
                            // the requestable matches...
                            try {
                                if ((isException == false ? route.condition(response) : route.condition(exception))) {
                                    // Conditions to switch to the page are met....
                                    this.log("Route for Requestable '" + item.requestable + "' matches");
                                    if (route.afterCall != undefined) {
                                        route.afterCall();
                                    }

                                    // test to see if we are already on the target page
                                    if (route.target.page != null) {
                                        if (this.findView(activeView, route.target.page, requestable) && !route.target.alwaysNewPage) {
                                            this.log("Route for Requestable '" + item.requestable + "', the view is already displayed, using curent view");
                                            this.storeResponseForView(activeView, requestable, response, navParams, route.didEnter, route.didLeave);
                                            resolve();
                                        }
                                    }

                                    // We are not already on the page, switch to it using the correct animation options...
                                    if (route.target.action == "push" && !parameters[C8o.ENGINE_PARAMETER_FROM_LIVE]) {
                                        this.push(route.target.page, {
                                            "requestable": requestable,
                                            "data": response,
                                            "navParams": navParams,
                                            "didEnter": route.didEnter,
                                            "didLeave": route.didLeave
                                        }, route.options);
                                        this.log("Page '" + route.target.pagename() + "' pushed");
                                        resolve();
                                        return;

                                    }
                                    if (route.target.action.toString() == "setRoot" && !parameters[C8o.ENGINE_PARAMETER_FROM_LIVE]) {
                                        this.setRoot(route.target.page, {
                                            "requestable": requestable,
                                            "data": response,
                                            "navParams": navParams
                                        }, route.options);
                                        this.log("Page '" + route.target.pagename() + "' set to root");
                                        resolve();
                                        return;
                                    }
                                    if (route.target.action.toString() == "toast") {
                                        let toast = this.toastCtrl.create(route.toastOptions);
                                        toast.present();
                                        resolve();
                                    }
                                    if (activeView == null) {
                                        this.log("Route for Requestable '" + item.requestable + "', the view is already displayed, using _C80_GeneralView view");
                                        this.storeResponseForView("_C80_GeneralView", requestable, response, navParams, route.didEnter, route.didLeave);
                                        resolve();
                                    }
                                    resolve();
                                }
                            }
                            catch (err) {
                                this.c8o.log.warn("Route did not match because of exception", err)
                            }

                        }
                    }
                }
            }

            /* No route found so we stay in the same page
             * We store the response in the current page..
             */
            if (activeView != null) {
                this.storeResponseForView(activeView, requestable, response, navParams, null, null);
            }
            resolve();
        });
    }

    /**
     * Calls a Convertigo requestable. When the response comes back we execute the routes to switch to the target page
     *
     * @param requestable as a "project.sequence" of as "fs://database.verb"
     * @param data for the call
     *
     */
    c8oCall(requestable: string, parameters?: Object, navParams?: any, page?: C8oPageBase): Promise<any> {
        return new Promise((resolve, reject) => {
            if (parameters["__localCache_priority"] != undefined && (parameters["__localCache_priority"] == "priority_server" || parameters["__localCache_priority"] == "priority_local")) {
                let localCache_priority;
                if (parameters["__localCache_priority"] == "priority_server") {
                    localCache_priority = Priority.SERVER;
                }
                else {
                    localCache_priority = Priority.LOCAL;
                }
                parameters[C8oLocalCache.PARAM] = new C8oLocalCache(localCache_priority, parameters["__localCache_ttl"]);
                delete parameters["__localCache_priority"];
                delete parameters["__localCache_ttl"];
            }
            this.c8o.callJsonObject(requestable, parameters)
                .then((response: any, parameters: Object) => {
                    parameters['_navParams'] = navParams;
                    this.execute_route(response, parameters)
                        .then(() => {
                            // check for live tag in order to order to page to reload new results ..
                            page.tick()
                            resolve(response);
                        });
                    return null;
                })
                .fail((exception: C8oException, parametersF: Object) => {
                    this.c8o.log.error("Error occured when calling " + requestable + ":" + exception.stack)
                    this.execute_route(requestable, parametersF, exception)
                        .then(() => {
                            reject(exception);
                        })
                        .catch(() => {
                            reject(exception);
                        });
                });
        });

    }


    /**
     * When a page is navigated to, it will get the response data passed in the Push() or setRoot() and will call this
     * method to store this data indexed by this page instance. This way each page can retrieve data from its instance index
     * to use Angular binding to its HTML.
     *
     *   @view          the view index where the data will be stored
     *   @requestable   the requestable from where this data was responded
     *   @data          the data
     */
    public storeResponseForView(view: any, requestable: string, data: any, navParams: any, didEnter: any, didLeave: any) {
        let pushFlag = true;
        for (var i = 0; i < this.c8oResponses.length; i++) {
            if (this.c8oResponses[i]["view"] == view && this.c8oResponses[i]["requestable"] == requestable) {
                this.c8oResponses[i]["data"] = data;
                this.c8oResponses[i]["navParams"] = navParams;
                this.c8oResponses[i]["DidEnter"] = didEnter;
                this.c8oResponses[i]["DidLeave"] = didLeave;
                pushFlag = false;
                break;
            }
        }
        if(pushFlag){
            this.c8oResponses.push({
                "view": view,
                "requestable": requestable,
                "data": data,
                "navParams": navParams
            });
        }
        
        // if we are in mobile builder mode
        if (this.storage !== null) {
            //delete rootNavCtrl present in navParams to prevent from cyclic JSON issues
            for (let val in this.c8oResponses) {
                try {
                    if (this.c8oResponses[val]["navParams"]["data"]["rootNavCtrl"] instanceof Nav) {

                        delete this.c8oResponses[val]["navParams"]["data"]["rootNavCtrl"];
                    }
                }
                catch (err) {

                }

            }
            // storage for c8ocaf refresh keep state data
            try {
                this.storage.setItem(C8oRouter.C8OCAF_SESSION_STORAGE_DATA, JSON.stringify(this.c8oResponses));
            }
            catch(e){
                
            }
            
        }
    }

    /**
     * When a page(view) is displayed it will call this method to retreive the data that was stored for this view
     *
     * @param view: the view we must restore data from
     * @param {string[]} requestables: an array of requestables from where the data was responded
     * @returns {any}: data to fetch
     */
    public getResponseForView(view: any, requestables: string[]): any {
        try {
            if (requestables != undefined) {
                for (let requestable of requestables) {
                    for (let item of this.c8oResponses) {
                        if (item["view"] == view && item["requestable"] == requestable) {
                            return (item["data"]);
                        }
                        if (item["requestable"] == requestable) {
                            return (item["data"]);
                        }
                    }
                }
                return (new Object());
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    /**
     * When a page(view) is displayed it will call this method to delete the data that was stored for this view
     *
     * @param view: the view we must restore data from
     * @param {string[]} requestables: an array of requestables from where the data was responded
     * @returns {boolean} true if a value has been deleted.
     */
    public deleteResponseForView(view: any, requestables: string[]): boolean {
        try {
            if (requestables != undefined) {
                requestables.forEach((requestable) => {
                    this.c8oResponses.forEach((item, index) => {
                        if (item["view"] == view && item["requestable"] == requestable) {
                            delete this.c8oResponses[index]["data"];
                            return true;
                        }
                        if (item["requestable"] == requestable) {
                            delete this.c8oResponses[index]["data"];
                            return true;
                        }
                    });
                });
                return false;
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    /**
     * When a page(view) is displayed it will call this method to retreive the data that was stored for this view
     *
     *   @param         the view we must restore data from
     *   @requestables  a requestable from where the data was responded
     *
     *   @return        the data
     */
    public getParamForView(view: any, requestable: string): any {

        for (var item of this.c8oResponses) {
            if (item["view"] == view && item["requestable"] == requestable)
                return (item["navParams"]);
        }

        return (new Object());
    }


    /**
     * Check if the current view is the same as the one we should route to
     *
     *   @param         activeView, the view we must search
     *   @param         targetView, the view we should route to
     *   @requestable   The requestable for this view
     *
     *   @return        true if the view is found
     */
    public findView(view: any, targetView: any, requestable: string): boolean {
        if (targetView != undefined) {
            if (view == targetView || view == targetView["nameStatic"]) {
                return true;
            }
            return false;
        }
        else {
            return false;
        }
    }

    /**
     * Utility routine to push on the nav stack a view with data to be passed to the view
     *
     * @param       the view
     * @param       data to be passed to the view
     * @options     transition options
     */
    public push(view: any, data: any, options: Object): Promise<any> {
        /*let optionsTrans: NativeTransitionOptions = {
            direction: 'right',
            duration: 300
           };
        this.nativePageTransitions.slide(optionsTrans);*/
        return this.app.getActiveNavs()[0].push(view, data, options);
    }

    /**
     * Utility routine to pop on the nav stack a view with data to be passed to the view
     *
     */
    public pop(): Promise<any> {
        /*let optionsTrans: NativeTransitionOptions = {
            direction: 'left',
            duration: 300
           };
        this.nativePageTransitions.slide(optionsTrans);*/
        return this.app.getActiveNavs()[0].pop();
    }

    /**
     * Utility routine to root a view on the nav stack with data to be passed to the view
     *
     * @param       the view
     * @param       data to be passed to the view
     */
    public setRoot(view: any, data: any, options: Object): Promise<any> {
        /*let optionsTrans: NativeTransitionOptions = {
            direction: 'right',
            duration: 300
           };
        this.nativePageTransitions.slide(optionsTrans);*/
        return this.app.getActiveNavs()[0].setRoot(view, data, options);
    }

    /**
     * Client Side OAuth Login. Calling this method will display the OAuth provider's
     * login page. When the users authentifies, the login page will be closed and a
     * Server sequence will be called with the acess token provided. The server is responsible
     * for validating the token and to return some user information. The server also uses
     * Set_Authenticated_User step to flag the curent session authenticated.
     *
     * This is a generic client OAuth. each OAuth provider has a specific url to call to trigger
     * the OAuth implicit flow. Here are somme common providers URLs:
     *
     * - Microsoft Azure V2.0 endpoint
     *      url : https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=<your registred app client id>&response_type=id_token+token&scope=openid%20https%3A%2F%2Fgraph.microsoft.com%2FUser.Read&response_mode=fragment&state=12345&nonce=678910
     *      redirectUri : "https://login.live.com/oauth20_desktop.srf"
     *
     * Notes :
     *  This function requires the cordova-plugin-inappbrowser.
     *  This will only work for cordova installed apps.
     *
     * @param url                   The OAuth provider url
     * @param redirectUri           The redirect URI to check
     * @param loginSequence         The server Sequence to be launched to login (Project.Sequence)
     * @param checkTokenSequence    The server Sequence to be used to check if user session is already autenticated (Project.Sequence)
     */
    public doOAuthLogin(url: String, redirectUri: String, loginSequence: string, checkTokenSequence: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let win;
            var isABoringBrowser = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && navigator.userAgent.indexOf('CriOS') == -1 && navigator.userAgent.indexOf('FxiOS') == -1;
            if(isABoringBrowser && window["cordova"] == undefined){
                win = window.open('about:blank',"cafLogin", "location=no, clearsessioncache=yes, clearcache=yes");
            }
            this.c8o.callJson(checkTokenSequence).then((data, params) => {
                if (data["notoken"] == "true") {
                    this.openOAuthLogin(url, redirectUri).then((parsedResponse) => {
                        this.c8o.log.debug("Parsed response is : " + JSON.stringify(parsedResponse));

                        this.c8o.callJsonObject(loginSequence, parsedResponse)
                            .then((data: any) => {
                                if (data["login"] != "ko") {
                                    resolve(data);
                                }
                                else {
                                    reject(data);
                                }
                                return null;
                            }).fail((err) => {
                                reject(err);
                            })
                    }).catch((err) => {
                        reject(err);
                    })
                }
                else {
                    if(isABoringBrowser){
                        win.close();
                    }
                    resolve(data);
                    return null;
                }
            }).fail((err) => {
                reject(err);
            });


        });
    }

    public openOAuthLogin(url: String, redirectUri: String, isABoringBrowser?, win?): Promise<any> {
        return new Promise((resolve, reject) => {
            if (window["cordova"] != undefined) {
                url += "&redirect_uri=" + redirectUri
                const browserRef = window["cordova"].InAppBrowser.open(
                    url,
                    "_blank",
                    "location=no, clearsessioncache=yes, clearcache=yes"
                );
                let responseParams: string;
                let parsedResponse: Object = {};
                browserRef.addEventListener("loadstart", (evt) => {
                    this.c8o.log.debug("Auth Page loaded")
                    if ((evt.url).indexOf(redirectUri) === 0) {
                        browserRef.removeEventListener("exit", (evt) => { });
                        this.c8o.log.debug("Exit Listener removed")
                        browserRef.close();
                        if (evt.url.indexOf("#") != -1)     // Microsoft Azure
                            responseParams = ((evt.url).split("#")[1]).split("&");
                        else                            // LinkedIN
                            responseParams = ((evt.url).split("?")[1]).split("&");

                        for (var i = 0; i < responseParams.length; i++) {
                            parsedResponse[responseParams[i].split("=")[0]] = responseParams[i].split("=")[1];
                        }
                        if ((parsedResponse["access_token"] !== undefined &&
                            parsedResponse["access_token"] !== null) || (parsedResponse["code"] !== undefined &&
                                parsedResponse["code"] !== null)) {
                            resolve(parsedResponse);
                        } else {
                            this.c8o.log.error("oAuthClient : oAuth authentication error:" + evt.url)
                            reject("oAuth authentication error");
                        }
                    }
                });
                browserRef.addEventListener("exit", function (evt) {
                    this.c8o.log.debug("Auth Page closed")
                });
            }
            else {
                url += "&redirect_uri=" + redirectUri;
                if(isABoringBrowser){
                    win.location = url;
                }
                else{
                    window.open(url.toString(), "cafLogin", "location=no, clearsessioncache=yes, clearcache=yes");
                }
                window.addEventListener('message', (parsedResponse) => {
                    if (parsedResponse.data["access_token"] != undefined &&
                        parsedResponse.data["access_token"] != null) {
                        resolve(parsedResponse.data);
                    }
                    /* 
                    Disabled because of bug with captchas (ref #27)
                    else {
                        this.c8o.log.error("oAuthClient : oAuth authentication error");
                        reject("oAuth authentication error");
                    }*/
                });
            }
        });
    }

    /**
     * Get attachment data url a requestable response to be displayed
     *
     * @param	id              the DocumentID to get the attachment from
     * @param   attachmentName  name of the attachment to display (eg: image.jpg)
     * @param   placeholderUrl  the url to display while we get the attachment (This is an Async process)
     * @param   imgCache        An array that contains cache.
     * @param   databaseName    the Qname of a FS database (eg project.fsdatabase) to get the attachment from.
     *
     */
    public getAttachmentUrl(id: string, attachmentName: string, placeholderURL: string, imgCache: Object, databaseName?: string): Object {
        if (id != null && attachmentName && databaseName) {

            databaseName = databaseName.indexOf(".") != -1 ? databaseName.split('.')[1] :  databaseName;
            // If no place holder has been defined, define one White 1x1 pixel.
            placeholderURL = placeholderURL ? placeholderURL : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
            if (imgCache[id + "/" + attachmentName] == undefined) {
                imgCache[id + "/" + attachmentName] = placeholderURL
                this.c8o.get_attachment(id, attachmentName, databaseName).then((response) => {
                    imgCache[id + "/" + attachmentName] = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(response))
                }).catch((err) => {
                    // this.c8o.log.error("Error getting attachment name: " + attachmentName, err)
                });
            }
            return imgCache[id + "/" + attachmentName]
        } else {
            if (!imgCache["c8o__errorslogs"]) {
                imgCache["c8o__errorslogs"] = true;
                this.c8o.log.error("[MB] getAttachmentUrl Missing parameters...");
            }
            return "";
        }
    }
}
