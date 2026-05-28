import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  url: string;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(
    private http: HttpClient
  ) { }

  BuscarDatosBasePorId(id_empresa: number){
    return this.http.get(`${environment.url}/base-empresa/buscar-empresas/${id_empresa}`);
  }

  ActualizarBase(data: any){
    return this.http.put<any>(`${environment.url}/base-empresa/actualizar-empresas/`, data);
  }

  InsertarBase(data: any){
    return this.http.post<any>(`${environment.url}/base-empresa/registro-base-empresas`, data);
  }

}
