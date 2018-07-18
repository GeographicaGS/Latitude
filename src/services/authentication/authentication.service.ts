import { Injectable, Inject } from '@angular/core';
import { Headers, Response, RequestOptions, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

// TODO: Move money format related functions to its own service

@Injectable()
export class AuthenticationService {

  data;
  _renewGapSeconds = 200;
  apiBaseUrl: string;
  renewTimer: any;
  userHeader = 'x-auth-email';
  passwordHeader = 'x-auth-password';
  renewUrl = '/auth/token/renew';
  authUrl = '/auth/token';

  constructor(
    @Inject('config') private config: any,
    private http: Http,
    private router: Router
  ) {
    if (config.authHeaders && config.authHeaders.user) {
      this.userHeader = config.authHeaders.user;
    }
    if (config.authHeaders && config.authHeaders.password) {
      this.passwordHeader = config.authHeaders.password;
    }
    if (config.renewUrl) {
      this.renewUrl = config.renewUrl;
    }
    if (config.authUrl) {
      this.authUrl = config.authUrl;
    }
    if (config.apiBaseUrl) {
      this.apiBaseUrl = config.apiBaseUrl;
      if (this.isLoggedIn()) {
        this.data = this.getUser();
        this.setRenewer();
      }
    } else {
      throw new Error('LatitudeModule -> AuthenticationService needs to get an apiBaseUrl in the config object');
    }
  }

  login(username: string, password: string) {
    const headers = new Headers();
    headers.append(this.userHeader, username);
    headers.append(this.passwordHeader, password);
    const options = new RequestOptions({ headers: headers });
    return this.http.get(`${this.apiBaseUrl}${this.authUrl}`, options)
      .map((response: Response) => {
        return this.initUser(response.json());
      });
  }

  renew() {
    const headers = new Headers();
    const options = new RequestOptions({headers: headers});
    const token = this.getUser().token;
    options.headers.set('Authorization', token);
    this.http.get(`${this.apiBaseUrl}${this.renewUrl}`, options)
      .map((res: Response) => res.json())
      .subscribe(
        (json) => {
          return this.initUser(json);
        },
        (error) => {
          this.router.navigate(['/login']);
        }
      );
  }

  initUser(response: Response) {
    const user = <any>response;
    if (user && user.token) {
      this.data = user;
      this.setUser();
      this.setRenewer();
    }
    return user;
  }

  getUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  setUser()  {
    this.data.expires = new Date().getTime() + (this.data.expires_in) * 1000;
    this.data.user.moneyFormatOptions = this.getMoneyFormatOptions(this.data.user);
    localStorage.setItem('currentUser', JSON.stringify(this.data));
  }

  setRenewer() {
    const diff = Number(new Date(this.data.expires)) - Number(new Date());
    if (this.renewTimer) {
      clearTimeout(this.renewTimer);
    }
    this.renewTimer = setTimeout(() => {
      this.renew();
    }, diff - this._renewGapSeconds * 1000);
  }

  isManager() {
    let response = false;
    const user = this.getUser();
    if (user) {
      response = this.isLoggedIn() === true &&  (user.user.manager ===  true || user.user.admin === true);
    }
    return response;
  }

  isAdmin() {
    let response = false;
    const user = this.getUser();
    if (user) {
      response = this.isLoggedIn() === true &&  user.user.admin === true;
    }
    return response;
  }

  isLoggedIn() {
    const data = this.getUser();
    if (!data) {
      return false;
    }
    return (Number(new Date(data.expires)) - Number(new Date())) > 0;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  private getUnits(user) {
    let response = '€';
    if (user.country === 'uk') {
      response = '£';
    } else if (user.country === 'us') {
      response = '$';
    }
    return response;
  }

  private getMoneyFormatOptions(user) {
    let options = {};
    if (user.country === 'uk') {
      options['reversedUnit'] = true;
    } else if (user.country === 'us') {
      options['reversedUnit'] = true;
    }
    options['units'] = this.getUnits(user);
    return options;
  }
}
