import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'

export type DatosCrearBaseDatos = {
  id_empresa: number;
  empresa_codigo: string;
  nombre_base: string;
  usuario_registra: string;
};

export type DatosEjecutarScriptsInicializacion = {
  id_empresa: number;
  empresa_codigo: string;
  nombre_base: string;
  usuario_registra: string;
  script_tablas: File;
  script_vistas: File;
  script_datos_iniciales: File;
};

@Injectable({
  providedIn: 'root'
})

export class ConexionBaseDatosService {

  constructor(
    private http: HttpClient,
    public router: Router
  ) { }

  ObtenerInformacionConexionPrincipal() {
    return this.http.get<any>(`${environment.url}/base/base-informacion`);
  }


  // PROCESO DE INICIALIZACION DE BASE DE DATOS
  CrearBaseDatos(datos: DatosCrearBaseDatos) {
    return this.http.post<any>(`${environment.url}/inicializacion-bd/crear-base`, datos);
  }

  EjecutarScriptsInicializacion(datos: DatosEjecutarScriptsInicializacion) {
    const formData = new FormData();

    formData.append('id_empresa', String(datos.id_empresa));
    formData.append('empresa_codigo', datos.empresa_codigo);
    formData.append('nombre_base', datos.nombre_base);
    formData.append('usuario_registra', datos.usuario_registra);

    formData.append('script_tablas', datos.script_tablas, datos.script_tablas.name);
    formData.append('script_vistas', datos.script_vistas, datos.script_vistas.name);
    formData.append(
      'script_datos_iniciales',
      datos.script_datos_iniciales,
      datos.script_datos_iniciales.name
    );

    return this.http.post<any>(`${environment.url}/inicializacion-bd/ejecutar-scripts`, formData);
  }

  ObtenerHistorialInicializacion(id_empresa: number) {
    return this.http.get<any[]>(`${environment.url}/inicializacion-bd/historial/${id_empresa}`);
  }

}
