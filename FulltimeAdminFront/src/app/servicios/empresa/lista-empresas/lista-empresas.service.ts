import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ListaEmpresasService {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router
  ) { }

  ObtenerInformacionEmpresasRegistradas(){
    return this.http.get<any>(`${environment.url}/empresa/empresas`);
  }

  ObtenerInformacionEmpresaPorId(id_empresa: number){
    return this.http.get(`${environment.url}/empresa/verEmpresa/${id_empresa}`);
  }

}
