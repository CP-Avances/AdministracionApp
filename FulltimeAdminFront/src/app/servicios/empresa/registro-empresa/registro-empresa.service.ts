import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class RegistroEmpresaService {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router
  ) { }

  ActualizarEmpresaFormUno(datos: any){
    return this.http.put(`${environment.url}/empresa/actualizar-empresa-form-uno`, datos);
  }
}
