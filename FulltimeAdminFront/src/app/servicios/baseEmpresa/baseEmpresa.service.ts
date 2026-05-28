import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class BaseEmpresaService {

    constructor(
        private http: HttpClient,
        public router: Router
    ) { }

    ObtenerInformacionBases() {
        return this.http.get<any>(`${environment.url}/base-empresa/base-empresas-informacion`);
    }

}