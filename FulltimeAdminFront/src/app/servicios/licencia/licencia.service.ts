import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LicenciaService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(
    private http: HttpClient
  ) { }

  BuscarDatosLicenciaPorIdEmpresa(id_empresa: number) {
    return this.http.get(`${environment.url}/licencia/licencias-empresas/${id_empresa}`);
  }

  ActualizarLicencia(data: any) {
    return this.http.put<any>(`${environment.url}/licencia/actualizar-licencia`, data);
  }

  InsertarLicencia(data: any) {
    return this.http.post<any>(`${environment.url}/licencia/registro-licencia`, data);
  }


  // MODULOS DEL SISTEMA
  leerModulos() {
    return this.http.get<any>(`${environment.url}/modulos/buscar-modulos`);
  }

  BuscarmodulosActivos(id_empresa: number) {
    return this.http.get(`${environment.url}/modulos/modulos-activos/${id_empresa}`);
  }

  registrarLicenciaModulos(datos: {
    id_licencia: number;
    modulos: {
      id_modulo: number;
      activo: boolean;
    }[];
  }) {
    return this.http.put<any>(`${environment.url}/modulos/licencia-modulos/guardar`, datos);
  }

  BuscarTodosModulosActivos(id_empresa: number) {
    return this.http.get(`${environment.url}/modulos/modulos-licencia/${id_empresa}`);
  }


  // LIMITES DE USUARIOS
  RegistrarLicenciaLimite(datos: {
    id_licencia: number;
    usuarios_web_max: number;
    usuarios_app_max: number;
    relojes_max: number;
    storage_mb_max: number;
  }) {
    return this.http.post<any>(`${environment.url}/limite-usuarios/registrar`, datos);
  }

  ActualizarLicenciaLimite(datos: {
    id_licencia_limite: number;
    id_licencia: number;
    usuarios_web_max: number;
    usuarios_app_max: number;
    relojes_max: number;
    storage_mb_max: number;
  }) {
    return this.http.put<any>(`${environment.url}/limite-usuarios/actualizar`, datos);
  }

  BuscarLimiteLicenciaActiva(id_empresa: number) {
    return this.http.get<any[]>(`${environment.url}/limite-usuarios/limites-activos/${id_empresa}`);
  }

  BuscarTodosLimitesLicencia(id_empresa: number) {
    return this.http.get<any[]>(`${environment.url}/limite-usuarios/limites-totales/${id_empresa}`);
  }

  // ACTUALIZACION DE STORAGE

  GuardarLicenciaStorageUso(datos: {
    id_licencia: number;
    storage_mb_usado: number;
    origen_calculo: string;
    fecha_registro?: string | null;
    calculo_exitoso: boolean;
    mensaje_error?: string | null;
    observacion?: string | null;
  }) {
    return this.http.put<any>(`${environment.url}/storage-uso/guardar`, datos);
  }

  BuscarStorageLicenciaActiva(id_empresa: number) {
    return this.http.get<any[]>(`${environment.url}/storage-uso/activa/${id_empresa}`);
  }

  BuscarTodosStorageLicencia(id_empresa: number) {
    return this.http.get<any[]>(`${environment.url}/storage-uso/todos/${id_empresa}`);
  }

  CalcularStorageEmpresa(codigo_empresa: string) {
    return this.http.post<any>(
      `${environment.url}/storage-uso/calcular-storage-empresa`,
      { codigo_empresa }
    );
  }

  // MOVIMIENTOS DE LICENCIA
  BuscarMovimientosLicencia(
    id_empresa: number,
    filtros?: {
      fecha_inicio?: string | null;
      fecha_fin?: string | null;
      id_licencia?: number | null;
      entidad_afectada?: string | null;
      tipo_movimiento?: string | null;
      usuario_registra?: string | null;
      campo_modificado?: string | null;
    }
  ) {
    const params: any = {};

    if (filtros?.fecha_inicio) {
      params.fecha_inicio = filtros.fecha_inicio;
    }

    if (filtros?.fecha_fin) {
      params.fecha_fin = filtros.fecha_fin;
    }

    if (filtros?.id_licencia) {
      params.id_licencia = filtros.id_licencia;
    }

    if (filtros?.entidad_afectada) {
      params.entidad_afectada = filtros.entidad_afectada;
    }

    if (filtros?.tipo_movimiento) {
      params.tipo_movimiento = filtros.tipo_movimiento;
    }

    if (filtros?.usuario_registra) {
      params.usuario_registra = filtros.usuario_registra;
    }

    if (filtros?.campo_modificado) {
      params.campo_modificado = filtros.campo_modificado;
    }

    return this.http.get<any[]>(
      `${environment.url}/licencia-movimientos/${id_empresa}`,
      { params }
    );
  }

}
