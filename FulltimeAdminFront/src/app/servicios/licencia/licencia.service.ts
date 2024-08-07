import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

@Injectable({
  providedIn: 'root'
})
export class LicenciaService {

  url: string;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(
    private http: HttpClient
  ) { }

  BuscarDatosLicenciaPorIdEmpresa(id_empresa: number){
    return this.http.get(`${environment.url}/licencia/licencias-empresas/${id_empresa}`);
  }

  ActualizarLicencia(data: any){
    return this.http.put<any>(`${environment.url}/licencia/actualizar-licencia/`, data);
  }

}
