import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    if (this.loginService.loggedIn()) {
      return true;
    }

    if (route.data?.['log']) {
      return true;
    }

    localStorage.clear();
    sessionStorage.clear();

    sessionStorage.setItem('redireccionar', state.url);

    return this.router.createUrlTree(['/login']);
  }

}
