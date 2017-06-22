import { OAuthService } from 'angular2-oauth2/oauth-service';

export class C8oOAuth{
  constructor(private oauthService: OAuthService){

    // Login-Url
    this.oauthService.loginUrl = "https://steyer-identity-server.azurewebsites.net/identity/connect/authorize"; //Id-Provider?

    // URL of the SPA to redirect the user to after login
    this.oauthService.redirectUri = window.location.origin + "/index.html";

    // The SPA's id. Register SPA with this id at the auth-server
    this.oauthService.clientId = "spa-demo";

    // The name of the auth-server that has to be mentioned within the token
    this.oauthService.issuer = "https://steyer-identity-server.azurewebsites.net/identity";

    // set the scope for the permissions the client should request
    this.oauthService.scope = "openid profile email voucher";

    // set to true, to receive also an id_token via OpenId Connect (OIDC) in addition to the
    // OAuth2-based access_token
    this.oauthService.oidc = true;

    // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
    // instead of localStorage
    this.oauthService.setStorage(sessionStorage);

    // To also enable single-sign-out set the url for your auth-server's logout-endpoint here
    this.oauthService.logoutUrl = "https://steyer-identity-server.azurewebsites.net/identity/connect/endsession?id_token={{id_token}}";

    // This method just tries to parse the token within the url when
    // the auth-server redirects the user back to the web-app
    // It dosn't initiate the login
    this.oauthService.tryLogin({});

  }

  public get token(){
    return this.oauthService.getAccessToken();
  }

  public login() {
    this.oauthService.initImplicitFlow()
  }

  public logoff() {
    this.oauthService.logOut();
  }

  public get name() {
    let claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims.given_name;
  }

  public tryLogin(){
    this.oauthService.tryLogin({
      onTokenReceived: context => {
        //
        // Output just for purpose of demonstration
        // Don't try this at home ... ;-)
        //
        console.debug("logged in");
        console.debug(context);
      },
      validationHandler: context => {
        console.log('validation handler');
      }
    });
  }
}
