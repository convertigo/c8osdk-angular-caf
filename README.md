[![NPM](https://nodei.co/npm/c8ocaf.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/c8ocaf/)

# Convertigo Angular Framework (CAF) [![npm version](https://img.shields.io/npm/v/c8ocaf.svg)](https://www.npmjs.com/package/c8ocaf) #

  CAF brings to Angular / Ionic 2 the same functionalities that CTF (Convertigo Templating Framework)  brings to JQuery.  The goal is to add Convertigo back end support directly in to the Ionic HTML templates without having to program complex TypeScript. For example calling a Convertigo sequence from a button is as simple as that:
  
  	<button ion-button full (click)="call('.Login')">Click Me</button>
  
  CAF will automatically handle the sequence call, using the configured endpoint. Displaying data from a Sequence response, for example assuming that sequence returns a 
  
  	{
  		"login": "some data"
  	}
  
  Object, is as simple as that:
  
  	<ion-item>{{listen([".Login"])?.login}}</ion-item>
  
  See? No other TypeScript to Write !
  
  ## CAF Forms ##
  CAF also handles forms easily. To submit a form to a Convertigo sequence (for example "Login") just use:
  
  	<form (ngSubmit)="call('.Login')">
  		....
  		<input type="text" [(ngModel)]="form.user">
  		....
  		<input type="text" [(ngModel)]="form.password">
  		...
  		<button type="submit">
  	</form>
  
  The login sequence will be called and automatically will receive a 'user' and a 'password' variable populated by the user input.
  
  ## CAF routing table ##
  CAF also helps by providing a page navigation routing table just as CTF doses. The concept is to configure in the table the pages that must be displayed when a Convertigo Sequence response is received by the mobile app.
  
  CAF routing table is built using CAF TypeScript Objects so you can use IDE completion to write your routing.
  
  The template provides a sample routing table you may use and extend for your app. The routing table is held in the app.component.ts file :
  
  	this.router.addRouteListener(new C8oRouteListener([".Login"])           // When a response comes from ".Login" requestable,
      	.addRoute(
              new C8oRoute(
                  (data:any)=>{                                               // and that login == "ok",
                      return data.login == "ok" ? true : false
                  },
                  tableOptions                                                // Use optional routing tables options defined higher,
              )
              .setTarget("root", Page1)                                       // and route( set as root on stack to display page) to Page1.
          )
          .addRoute(
              new C8oRoute(
                  (data:any)=>{
                      return data.login == "ko"                               // If instead login == "ko",
                  }
              )
              .setTarget("toast")                                             // Display a Toast with the following options.
              .setToastMesage("Your login or password is incorrect")
              .setToastDuration(5000)
              .setToastPosition("bottom")
          )
          .addFailedRoute(                                                    // When a requestable fails (Network error for example),
              new C8oRoute(
                  (exception:any)=>{
                      return true                                             // In any case,
                  }
              )
              .setTarget("toast")                                             // Display a Toast with the following options.
              .setToastMesage("No network connection")
              .setToastDuration(5000)
              .setToastPosition("bottom")
          )
      )
  
  CAF is still under development but 1.0.x brings most of the functionnalities. Please use support forum as documentation is not yet ready.
  

