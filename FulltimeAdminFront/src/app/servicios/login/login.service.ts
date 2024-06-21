import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        public router: Router) { }

    //VALIDAR CREDENCIALES SUPERUSUARIO
    ValidarCredenciales(data: any){
        return this.http.post<any>(`${environment.url}/login`, data);
    }

    logout() {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/'], { relativeTo: this.route, skipLocationChange: false });
    }

    getToken() {
        return localStorage.getItem('token');
    }

    loggedIn() {
        return !!localStorage.getItem('token');
    }



}