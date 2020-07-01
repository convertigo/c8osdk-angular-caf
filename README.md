[![NPM](https://nodei.co/npm/c8ocaf.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/c8ocaf/)

# Workspace Convertigo Angular Framework (CAF) [![npm version](https://img.shields.io/npm/v/c8ocaf.svg)](https://www.npmjs.com/package/c8ocaf) #


- [Workspace Convertigo Angular Framework (CAF) ![npm version](https://www.npmjs.com/package/c8ocaf)](#workspace-convertigo-angular-framework-caf-img-srchttpsimgshieldsionpmvc8ocafsvg-altnpm-version)
  - [Documentation](#documentation)
    - [CAF Forms](#caf-forms)
  - [Technical Documentation](#technical-documentation)
    - [c8o-sdkangular-caf](#c8o-sdkangular-caf)
    - [Build c8o-sdkangular-caf](#build-c8o-sdkangular-caf)
    - [Publishing package](#publishing-package)
    - [Branches](#branches)

## Documentation ##

### Overview ###

  CAF brings to Angular / Ionic 5 the same functionalities that CTF (Convertigo Templating Framework)  brings to JQuery.  The goal is to add Convertigo back end support directly in to the Ionic HTML templates without having to program complex TypeScript. For example calling a Convertigo sequence from a button is as simple as that:
  
  	<button ion-button full (click)="call('.Login')">Click Me</button>
  
  CAF will automatically handle the sequence call, using the configured endpoint. Displaying data from a Sequence response, for example assuming that sequence returns a 
  
  	{
  		"login": "some data"
  	}
  
  Object, is as simple as that:
  
  	<ion-item>{{listen([".Login"])?.login}}</ion-item>
  
  See? No other TypeScript to Write !
  
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

## Technical Documentation ##

### c8o-sdkangular-caf

c8o-sdkangular-caf project is located into `projects/c8ocaf`

### Build c8o-sdkangular-caf

From root, run `ng build c8ocaf` to build the project. The build artifacts will be stored in the `dist/c8ocaf` directory. Use the `--prod` flag for a production build.

### Publishing package

Run `cd dist/c8ocaf` and then `npm run publish`. Use the `--beta` flag for a beta publish.

If you are not logged in with npm run `npm adduser` creadentials are stored in Google Drive file `Comptes pour développeurs Convertigo`

### Branches

From now, there are two pricipales branches
* master that holds `Ionic 3 version`
* ionic-5 that holds `Ionic 5 version`
