import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ConexionBaseDatosService {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router
  ) { }

  ObtenerInformacionConexionPrincipal(){
    return this.http.get<any>(`${environment.url}/base/base-informacion`);
  }

}
