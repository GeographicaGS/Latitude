import { Injectable, Inject } from '@angular/core';
import { Headers, Response, RequestOptions, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class AuthenticationService {

  data;
  password;
  _renewGapSeconds = 200;
  apiBaseUrl: string;
  interval: any;
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
    if (config.renewUrl && config.renewUrl) {
      this.renewUrl = config.renewUrl;
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

  login(username: string, password: string, hashToMd5: boolean = true) {
    if (hashToMd5) {
      this.password = <string>Md5.hashStr(password);
    }

    const headers = new Headers();
    headers.append(this.userHeader, username);
    headers.append(this.passwordHeader, this.password);
    const options = new RequestOptions({ headers: headers });
    return this.http.get(`${this.apiBaseUrl}${this.authUrl}`, options)
      .map((response: Response) => {
        return this.initUser(response.json());
      });
  }

  renew() {
    let environment:any = {};
    const headers = new Headers();
    const options = new RequestOptions({headers: headers});
    options.headers.set('Authorization', this.getUser().token);
    this.http.get(`${this.apiBaseUrl}${this.renewUrl}`, options)
      .map((res: Response) => res.json())
        .subscribe(
          (res) => {
            return this.initUser(res);
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
    localStorage.setItem('currentUser', JSON.stringify(this.data));
  }

  setRenewer() {
    const diff = <any>new Date(this.data.expires) - <any>new Date();
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setTimeout(() => {
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
    return (<any>new Date(data.expires) - <any>new Date()) > 0;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }
}
