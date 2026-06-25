// IMPORTAR LIBRERIAS
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';
import { EditarEmpresaComponent } from '../editar-empresa/editar-empresa.component';
import { BaseService } from 'src/app/servicios/base/base.service';
import { RegistroBaseComponent } from '../../base/registro-base/registro-base.component';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegistroLicenciaComponent } from '../../licencia/registro-licencia/registro-licencia.component';
import { MatRadioChange } from '@angular/material/radio';
import { WebAccessService } from 'src/app/servicios/web-access/web-access.service';
import moment from 'moment';
import { InicializarBaseComponent } from '../../base/inicializar-base/inicializar-base.component';

type ModuloLicencia = {
  id_licencia_modulo: number;
  id_licencia: number;
  estado: string;
  id_modulo: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fecha_activacion: string | null;
  fecha_desactivacion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
};

type GrupoModulosLicencia = {
  id_licencia: number;
  estado: string;
  modulos: ModuloLicencia[];
};

type LicenciaLimite = {
  id_licencia_limite: number;
  id_licencia: number;
  estado: string;
  fecha_activacion: string;
  fecha_desactivacion: string;
  fecha_activacion_formateada?: string;
  fecha_desactivacion_formateada?: string;
  usuarios_web_max: number;
  usuarios_app_max: number;
  relojes_max: number;
  storage_mb_max: number;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
};

type LicenciaStorageUso = {
  id_storage_uso: number;
  id_licencia: number;
  estado: string;
  fecha_activacion: string;
  fecha_desactivacion: string;
  fecha_activacion_formateada?: string;
  fecha_desactivacion_formateada?: string;
  storage_mb_usado: number;
  origen_calculo: string;
  fecha_registro: string;
  fecha_registro_formateada?: string;
  fecha_calculo: string;
  fecha_calculo_formateada?: string;
  calculo_exitoso: boolean;
  mensaje_error: string | null;
  observacion: string | null;
};

@Component({
  selector: 'app-ver-empresa',
  templateUrl: './ver-empresa.component.html',
  styleUrl: './ver-empresa.component.css'
})

export class VerEmpresaComponent implements OnInit, AfterViewInit {

  @ViewChild('tabla2') tabla2: ElementRef;
  @ViewChild('pestana') pestana!: MatTabGroup;

  ip: string | null;
  idEmpresa: string; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPRESA SELECCIONADA PARA VER DATOS
  datoActual: any = []; //DATOS ACTUALES DE LA EMPRESA

  // VARIABLES PARA DETECTAR EVENTO DE PESTAÑA
  empresa_base: number = 0;
  empresa_web_access: number = 0;
  empresa_modulos: number = 0;

  // VARIABLES DE ALMACENAMIENTO DE DATOS CONSULTADOS
  baseEmpresa: any = [];
  licenciaEmpresa: any = [];
  licenciaPageSize = 5;
  licenciaPageIndex = 0;
  licenciaPageSizeOptions: number[] = [5];
  modulosLicencia: ModuloLicencia[] = [];
  modulosLicenciaAgrupados: GrupoModulosLicencia[] = [];

  modulosPageSize = 5;
  modulosPageIndex = 0;
  modulosPageSizeOptions: number[] = [5];

  cargando_modulos_ = false;
  licencia_actual = 0;
  empresaUno: any = [];

  //VER EMPRESA
  descripcionEmpresa: string;
  codigoEmpresa: string;
  direccionEmpresa: string;
  numeroRelojesEmpresa: string;
  estadoEmpresa: boolean;
  zonaHorariaEmpresa: string;
  instalacionEmpresa: string;

  //VER BASE EMPRESA
  idEmpresaBdd: string;
  idBaseEmpresa: string;
  empresaBddNombre: string;
  empresaBddHost: string;
  empresaBddPuerto: string;
  empresaBddDescripcion: string;
  empresaBddContrasena: string;
  empresaBddUsuario: string;

  //VER LICENCIA EMPRESA
  idEmpresaLicencia: number;
  empresaLicenciaLlavePublica: string;
  empresaLicenciaFechaActivacion: any;
  empresaLicenciaFechaDesactivacion: any;
  empresaLicenciaObservacion: string;
  empresaLicenciaEstado: string;

  get licenciasPaginadas(): any[] {
    const inicio = this.licenciaPageIndex * this.licenciaPageSize;
    const fin = inicio + this.licenciaPageSize;

    return this.licenciaEmpresa.slice(inicio, fin);
  }

  get modulosLicenciaPaginados(): GrupoModulosLicencia[] {
    const inicio = this.modulosPageIndex * this.modulosPageSize;
    const fin = inicio + this.modulosPageSize;

    return this.modulosLicenciaAgrupados.slice(inicio, fin);
  }

  //BASES Y LICENCIAS
  agregar_base_: boolean = false;
  editar_base_: boolean = false;
  modificar_base_: boolean = false;

  modificar_licencia_: boolean = false;
  editar_licencia_: boolean = false;
  agregar_licencia_: boolean = false;

  modificar_modulos_: boolean = false;
  editar_modulos_: boolean = false;

  modificar_acceso_: boolean = false;
  editar_acceso_: boolean = false;

  pagina_base: any = '';
  base_editar: any = [];
  licencia_editar: any = [];
  modulos_editar: any = [];
  acceso_editar: any = [];

  valorAccesoWeb: boolean;

  // LIMITES USUARIOS
  limitesLicencia: LicenciaLimite[] = [];

  limitePageSize = 5;
  limitePageIndex = 0;
  limitePageSizeOptions: number[] = [5];

  cargando_limites_ = false;
  agregar_limite_ = false;
  editar_limite_ = false;
  registrar_limite_ = false;
  modificar_limite_ = false;

  limite_editar: LicenciaLimite | null = null;
  licencia_limite_actual = 0;

  get limitesPaginados(): LicenciaLimite[] {
    const inicio = this.limitePageIndex * this.limitePageSize;
    const fin = inicio + this.limitePageSize;

    return this.limitesLicencia.slice(inicio, fin);
  }

  // STORAGE USO
  storageLicencia: LicenciaStorageUso[] = [];

  storagePageSize = 5;
  storagePageIndex = 0;
  storagePageSizeOptions: number[] = [5];

  cargando_storage_ = false;
  agregar_storage_ = false;
  modificar_storage_ = false;

  storage_editar: LicenciaStorageUso | null = null;
  licencia_storage_actual = 0;

  get storagePaginado(): LicenciaStorageUso[] {
    const inicio = this.storagePageIndex * this.storagePageSize;
    const fin = inicio + this.storagePageSize;

    return this.storageLicencia.slice(inicio, fin);
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private informacion: ListaEmpresasService,
    private restBase: BaseService,
    private restLicencia: LicenciaService,
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public validar: ValidacionesService,
    private toastr: ToastrService,
    private restWebAccess: WebAccessService
  ) { }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.idEmpresa = id)
      )
      .subscribe(() => {
        this.LeerDatosIniciales();
        this.SeleccionarPestana(0);
        this.InicializarVariablesTab(0);
      });
  }

  ngAfterViewInit(): void {
    // VERIFICAR QUE ESTA DEFINIDA LA PESTAÑA
    if (!this.pestana) {
    } else {
      this.SeleccionarPestana(0);
    }
  }

  // METODO PARA CAMBIAR DE PESTAÑA
  SeleccionarPestana(index: number): void {
    if (this.pestana) {
      this.pestana.selectedIndex = index;
    }
  }

  // METODO PARA INICIALIZAR LAS VARIABLES
  InicializarVariablesTab(valor: number) {
    // CONTADORES
    this.empresa_base = valor;
    this.empresa_modulos = valor;
    this.empresa_web_access = valor;
    //PESTAÑAS
    this.baseEmpresa = [];
  }

  // METODO PARA LEER DATOS ACTUALES
  LeerDatosIniciales() {
    this.datoActual = [];
    this.informacion.ObtenerInformacionEmpresaPorId(parseInt(this.idEmpresa)).subscribe(res => {
      this.datoActual = res;

      this.empresaUno = this.datoActual;
      this.descripcionEmpresa = this.empresaUno[0].empresa_descripcion;
      this.codigoEmpresa = this.empresaUno[0].empresa_codigo;
      this.numeroRelojesEmpresa = this.empresaUno[0].numero_relojes;
      this.estadoEmpresa = this.empresaUno[0].estado;
      this.zonaHorariaEmpresa = this.empresaUno[0].zona_horaria;
      this.instalacionEmpresa = this.empresaUno[0].instalacion;

      this.ObtenerBaseEmpresa(this.idEmpresa);
      this.ObtenerLicenciaEmpresa(this.idEmpresa);
      this.ObtenerTodosModulosLicencia(this.idEmpresa);

      this.editar_modulos_ = true;
      this.editar_acceso_ = true;
    });
  }

  // METODO PARA DETECTAR EVENTO DE PESTAÑA
  DetectarEventoTab(event: MatTabChangeEvent) {
    if (event.tab.textLabel === 'bases') {
      if (this.empresa_base === 0) {

        this.empresa_base = 1;
      }
    }
    else if (event.tab.textLabel === 'modulos') {
      if (this.empresa_modulos === 0) {

        this.empresa_modulos = 1;
      }
    }
    else if (event.tab.textLabel === 'web_access') {
      if (this.empresa_web_access === 0) {
        this.empresa_web_access = 1;
      }
    }
  }

  // METODO EDICION DE REGISTRO DE EMPRESA
  AbirVentanaEditarEmpresa(dataEmpley: any) {
    this.ventana.open(EditarEmpresaComponent, { data: dataEmpley, width: '800px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.LeerDatosIniciales();
        }
      })
  }

  //VER INFORMACIÓN DE LA EMPRESA
  VerEmpresa() {
    this.empresaUno = [];
    this.empresaUno = this.datoActual;
  }

  // METODO DE EDICION DE BASES
  AbrirVentanaEditarBase(dataBase: any) {
    this.editar_base_ = false;
    this.modificar_base_ = true;
    this.base_editar = dataBase;
    this.pagina_base = 'ver-empresa';
  }

  // MOSTRAR VENTANA EDICION DE BASE
  VerBaseEdicion(value: boolean) {
    this.modificar_base_ = value;
    this.editar_base_ = false;
    this.agregar_base_ = false;
  }

  // MOSTRAR VENTANA EDICION DE LICENCIA
  VerLicenciaEdicion(value: boolean) {
    this.modificar_licencia_ = value;
    this.editar_licencia_ = false;
    this.agregar_licencia_ = false;
  }

  // MOSTRAR VENTANA EDICION DE MODULOS
  VerModulosEdicion(value: boolean) {
    this.modificar_modulos_ = value;
    this.editar_modulos_ = false;
  }

  // MOSTRAR VENTANA EDICION DE MODULOS
  VerAccesoEdicion(value: boolean) {
    this.modificar_acceso_ = value;
    this.editar_acceso_ = false;
  }

  // METODO DE EDICION DE BASES
  AbrirVentanaEditarLicencia(dataLicencia: any) {
    this.editar_licencia_ = false;
    this.modificar_licencia_ = true;
    this.licencia_editar = dataLicencia;
    this.pagina_base = 'ver-empresa';
  }

  // METODO DE EDICION DE MODULOS
  AbrirVentanaEditarModulos(idEmpresa: string, idLicencia: number): void {
    this.editar_modulos_ = false;
    this.modificar_modulos_ = true;
    this.modulos_editar = idEmpresa;
    this.licencia_actual = idLicencia;
    this.pagina_base = 'ver-empresa';
  }

  // METODO DE EDICION DE ACCESO
  AbrirVentanaEditarAcceso(dataAcceso: any) {
    this.editar_acceso_ = false;
    this.modificar_acceso_ = true;
    this.acceso_editar = dataAcceso;
    this.pagina_base = 'ver-empresa';
  }

  ObtenerBaseEmpresa(id_empresa: string) {
    let id_empresa_mod = Number(id_empresa);

    this.baseEmpresa = [];
    this.restBase.BuscarDatosBasePorId(id_empresa_mod).subscribe(res => {
      this.baseEmpresa = res;

      this.idEmpresaBdd = this.baseEmpresa[0].id_empresa_bdd;
      this.idBaseEmpresa = this.baseEmpresa[0].id_empresa;
      this.empresaBddNombre = this.baseEmpresa[0].empresa_bdd_nombre;
      this.empresaBddHost = this.baseEmpresa[0].empresa_bdd_host;
      this.empresaBddPuerto = this.baseEmpresa[0].empresa_bdd_puerto;
      this.empresaBddDescripcion = this.baseEmpresa[0].empresa_bdd_descripcion;
      this.empresaBddContrasena = this.baseEmpresa[0].empresa_bdd_contrasena;
      this.empresaBddUsuario = this.baseEmpresa[0].empresa_bdd_usuario;

      this.editar_base_ = true;
      this.agregar_base_ = false;
    },
      err => {
        this.editar_base_ = false;
        this.agregar_base_ = true;
      });
  }

  ObtenerLicenciaEmpresa(id_empresa: string): void {
    const id_empresa_mod = Number(id_empresa);

    this.licenciaEmpresa = [];
    this.licenciaPageIndex = 0;
    this.licencia_limite_actual = 0;
    this.agregar_limite_ = false;

    this.restLicencia.BuscarDatosLicenciaPorIdEmpresa(id_empresa_mod).subscribe({
      next: (res: any) => {
        this.licenciaEmpresa = Array.isArray(res)
          ? res.map((licencia) => ({
            ...licencia,
            fecha_activacion_formateada: this.validar.FormatearFecha(
              licencia.fecha_activacion,
              'YYYY-MM-DD',
              this.validar.dia_abreviado
            ),
            fecha_desactivacion_formateada: this.validar.FormatearFecha(
              licencia.fecha_desactivacion,
              'YYYY-MM-DD',
              this.validar.dia_abreviado
            )
          }))
          : [];

        const licenciaActiva = this.licenciaEmpresa.find((licencia) =>
          licencia.estado === 'ACTIVA'
        );

        this.agregar_licencia_ = !licenciaActiva;
        this.editar_licencia_ = this.licenciaEmpresa.length > 0;

        if (this.licenciaEmpresa.length > 0) {
          const licenciaActual = licenciaActiva ?? this.licenciaEmpresa[0];

          this.empresaLicenciaEstado = licenciaActual.estado;
          this.empresaLicenciaObservacion = licenciaActual.observacion;
          this.idEmpresaLicencia = licenciaActual.id_licencia;
          this.empresaLicenciaLlavePublica = licenciaActual.llave_publica;
          this.empresaLicenciaFechaActivacion = licenciaActual.fecha_activacion_formateada;
          this.empresaLicenciaFechaDesactivacion = licenciaActual.fecha_desactivacion_formateada;

          this.licencia_limite_actual = licenciaActiva?.id_licencia ?? 0;
          this.licencia_storage_actual = licenciaActiva?.id_licencia ?? 0;
        }

        this.ObtenerTodosLimitesLicencia(this.idEmpresa);
        this.ObtenerTodosStorageLicencia(this.idEmpresa);
      },
      error: () => {
        this.licenciaEmpresa = [];
        this.licenciaPageIndex = 0;
        this.editar_licencia_ = false;
        this.agregar_licencia_ = true;
        this.licencia_limite_actual = 0;
        this.licencia_storage_actual = 0;
        this.ObtenerTodosStorageLicencia(this.idEmpresa);
        this.ObtenerTodosLimitesLicencia(this.idEmpresa);
      }
    });
  }

  ManejarPaginaLicencias(event: PageEvent): void {
    this.licenciaPageIndex = event.pageIndex;
    this.licenciaPageSize = event.pageSize;
  }

  TrackByLicencia(index: number, licencia: any): number {
    return licencia.id_licencia || index;
  }

  AbrirVentanaCrearBase(): void {
    this.ventana.open(RegistroBaseComponent, { width: '900px', data: this.idEmpresa }).
      afterClosed().subscribe(item => {
        this.LeerDatosIniciales();
        this.editar_base_ = true;
      }
      );
  }

  AbrirVentanaCrearLicencia(): void {
    this.ventana.open(RegistroLicenciaComponent, {
      width: '900px',
      data: this.idEmpresa
    }).afterClosed().subscribe(() => {
      this.LeerDatosIniciales();
      this.editar_licencia_ = true;
    });
  }

  //CAMBIAR VALOR DE VARIABLE QUE CONTROLA ACCESO WEB
  CambiarEstadoAccesoWeb(event: MatRadioChange) {
    this.valorAccesoWeb = event.value;
  }

  //FUNCION DE CAPTURA DE VALOR DE ACCESO
  GuardarAccesoWeb() {
    if (this.valorAccesoWeb !== undefined && this.idEmpresaBdd !== undefined) {
      let datos = {
        id_empresa_bdd: this.idEmpresaBdd,
        web_access: this.valorAccesoWeb
      }
      this.restWebAccess.ActualizarAccessoWeb(datos).subscribe(
        (response: any) => {
          if (response.message === 'Registros actualizados.') {
            this.toastr.success('Operación exitosa.', 'Acceso actualizado.', {
              timeOut: 6000,
            });
          }
        },
        error => {
          this.toastr.error('Verifique base de datos.', 'Upss!!! algo salió mal.', {
            timeOut: 6000,
          });
        }
      );
    } else {
      this.toastr.error('Seleccione una opción o verifique base de datos', 'Upss!!! algo salió mal.', {
        timeOut: 6000,
      });
    }
  }

  ObtenerTodosModulosLicencia(id_empresa: string): void {
    const idEmpresaNumero = Number(id_empresa);

    if (!idEmpresaNumero) {
      this.modulosLicencia = [];
      this.modulosLicenciaAgrupados = [];
      return;
    }

    this.cargando_modulos_ = true;
    this.modulosPageIndex = 0;

    this.restLicencia.BuscarTodosModulosActivos(idEmpresaNumero).subscribe({
      next: (res: unknown) => {
        const modulos = Array.isArray(res) ? res as ModuloLicencia[] : [];

        this.modulosLicencia = modulos;
        this.modulosLicenciaAgrupados = this.AgruparModulosPorLicencia(modulos);
        this.cargando_modulos_ = false;
      },
      error: () => {
        this.modulosLicencia = [];
        this.modulosLicenciaAgrupados = [];
        this.cargando_modulos_ = false;
      }
    });
  }

  private AgruparModulosPorLicencia(modulos: ModuloLicencia[]): GrupoModulosLicencia[] {
    const grupos = new Map<number, GrupoModulosLicencia>();

    for (const modulo of modulos) {
      const idLicencia = Number(modulo.id_licencia);

      if (!grupos.has(idLicencia)) {
        grupos.set(idLicencia, {
          id_licencia: idLicencia,
          estado: modulo.estado,
          modulos: []
        });
      }

      grupos.get(idLicencia)?.modulos.push(modulo);
    }

    return Array.from(grupos.values());
  }

  ManejarPaginaModulos(event: PageEvent): void {
    this.modulosPageIndex = event.pageIndex;
    this.modulosPageSize = event.pageSize;
  }

  TrackByGrupoLicencia(index: number, grupo: GrupoModulosLicencia): number {
    return grupo.id_licencia || index;
  }

  TrackByModuloLicencia(index: number, modulo: ModuloLicencia): number {
    return modulo.id_licencia_modulo || modulo.id_modulo || index;
  }

  ObtenerIconoModulo(codigo: string): string {
    const iconos: Record<string, string> = {
      PERMISOS: 'assignment',
      VACACIONES: 'beach_access',
      HORAS_EXTRAS: 'schedule',
      HORA_EXTRA: 'schedule',
      GEOLOCALIZACION: 'location_on',
      GEOLOCALIZACIÓN: 'location_on',
      TIMBRE_WEB: 'fingerprint',
      TIMBRE_VIRTUAL: 'fingerprint',
      APP_MOVIL: 'phone_iphone',
      APLICACION_MOVIL: 'phone_iphone',
      APLICACIÓN_MÓVIL: 'phone_iphone',
      ACCION_PERSONAL: 'badge',
      ACCIÓN_PERSONAL: 'badge',
      ALIMENTACION: 'restaurant',
      ALIMENTACIÓN: 'restaurant'
    };

    return iconos[codigo?.toUpperCase()] ?? 'apps';
  }

  ObtenerLicenciaActivaId(): number {
  const licenciaActiva = this.licenciaEmpresa.find((licencia: any) =>
    licencia.estado === 'ACTIVA'
  );

  return Number(licenciaActiva?.id_licencia ?? 0);
}

AbrirConfiguracionModulosLicenciaActiva(): void {
  const idLicenciaActiva = this.ObtenerLicenciaActivaId();

  if (!idLicenciaActiva) {
    this.toastr.warning('No existe una licencia activa para configurar módulos.', 'Atención', {
      timeOut: 6000,
    });
    return;
  }

  this.VerModulosEdicion(false);
  this.AbrirVentanaEditarModulos(this.idEmpresa, idLicenciaActiva);
}

  // METODOS DE LIMITES DE USUARIOS
  ObtenerTodosLimitesLicencia(id_empresa: string): void {
    const idEmpresaNumero = Number(id_empresa);

    if (!idEmpresaNumero) {
      this.limitesLicencia = [];
      this.agregar_limite_ = false;
      return;
    }

    this.cargando_limites_ = true;
    this.limitePageIndex = 0;

    this.restLicencia.BuscarTodosLimitesLicencia(idEmpresaNumero).subscribe({
      next: (res: unknown) => {
        const limites = Array.isArray(res) ? res as LicenciaLimite[] : [];

        this.limitesLicencia = limites.map((limite) => ({
          ...limite,
          fecha_activacion_formateada: this.validar.FormatearFecha(
            limite.fecha_activacion,
            'YYYY-MM-DD',
            this.validar.dia_abreviado
          ),
          fecha_desactivacion_formateada: this.validar.FormatearFecha(
            limite.fecha_desactivacion,
            'YYYY-MM-DD',
            this.validar.dia_abreviado
          )
        }));

        this.DefinirPermisoAgregarLimite();
        this.cargando_limites_ = false;
      },
      error: () => {
        this.limitesLicencia = [];
        this.DefinirPermisoAgregarLimite();
        this.cargando_limites_ = false;
      }
    });
  }

  private DefinirPermisoAgregarLimite(): void {
    const licenciaActiva = this.licenciaEmpresa.find((licencia: any) =>
      licencia.estado === 'ACTIVA'
    );

    const limiteActivoRegistrado = this.limitesLicencia.some((limite) =>
      limite.estado === 'ACTIVA'
    );

    this.licencia_limite_actual = licenciaActiva?.id_licencia ?? 0;
    this.agregar_limite_ = Boolean(licenciaActiva) && !limiteActivoRegistrado;
  }

  ManejarPaginaLimites(event: PageEvent): void {
    this.limitePageIndex = event.pageIndex;
    this.limitePageSize = event.pageSize;
  }

  TrackByLimiteLicencia(index: number, limite: LicenciaLimite): number {
    return limite.id_licencia_limite || index;
  }

  AbrirRegistroLimiteUsuarios(): void {
    if (!this.licencia_limite_actual) {
      this.toastr.warning('No existe una licencia activa para registrar límites.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.registrar_limite_ = true;
    this.modificar_limite_ = false;
    this.editar_limite_ = false;
    this.pagina_base = 'ver-empresa';
  }

  AbrirEdicionLimiteUsuarios(limite: LicenciaLimite): void {
    this.limite_editar = limite;
    this.modificar_limite_ = true;
    this.registrar_limite_ = false;
    this.editar_limite_ = false;
    this.pagina_base = 'ver-empresa';
  }

  CerrarFormularioLimites(refrescar: boolean): void {
    this.registrar_limite_ = false;
    this.modificar_limite_ = false;
    this.editar_limite_ = true;

    if (refrescar) {
      this.LeerDatosIniciales();
    }
  }

  // METODOS DE STORAGE USO
  ObtenerTodosStorageLicencia(id_empresa: string): void {
    const idEmpresaNumero = Number(id_empresa);

    if (!idEmpresaNumero) {
      this.storageLicencia = [];
      this.agregar_storage_ = false;
      return;
    }

    this.cargando_storage_ = true;
    this.storagePageIndex = 0;

    this.restLicencia.BuscarTodosStorageLicencia(idEmpresaNumero).subscribe({
      next: (res: unknown) => {
        const storage = Array.isArray(res) ? res as LicenciaStorageUso[] : [];

        this.storageLicencia = storage.map((item) => ({
          ...item,
          fecha_activacion_formateada: this.validar.FormatearFecha(
            item.fecha_activacion,
            'YYYY-MM-DD',
            this.validar.dia_abreviado
          ),
          fecha_desactivacion_formateada: this.validar.FormatearFecha(
            item.fecha_desactivacion,
            'YYYY-MM-DD',
            this.validar.dia_abreviado
          ),
          fecha_registro_formateada: this.validar.FormatearFecha(
            item.fecha_registro,
            'YYYY-MM-DD',
            this.validar.dia_abreviado
          ),
          fecha_calculo_formateada: this.validar.FormatearFecha(
            item.fecha_calculo,
            'YYYY-MM-DD',
            this.validar.dia_abreviado
          )
        }));

        this.DefinirPermisoAgregarStorage();
        this.cargando_storage_ = false;
      },
      error: () => {
        this.storageLicencia = [];
        this.DefinirPermisoAgregarStorage();
        this.cargando_storage_ = false;
      }
    });
  }

  private DefinirPermisoAgregarStorage(): void {
    const licenciaActiva = this.licenciaEmpresa.find((licencia: any) =>
      licencia.estado === 'ACTIVA'
    );

    const storageActivoRegistrado = this.storageLicencia.some((storage) =>
      storage.estado === 'ACTIVA'
    );

    this.licencia_storage_actual = licenciaActiva?.id_licencia ?? 0;
    this.agregar_storage_ = Boolean(licenciaActiva) && !storageActivoRegistrado;
  }

  ManejarPaginaStorage(event: PageEvent): void {
    this.storagePageIndex = event.pageIndex;
    this.storagePageSize = event.pageSize;
  }

  TrackByStorageLicencia(index: number, storage: LicenciaStorageUso): number {
    return storage.id_storage_uso || index;
  }

  AbrirFormularioStorage(storage: LicenciaStorageUso | null): void {
    if (!this.licencia_storage_actual && !storage) {
      this.toastr.warning('No existe una licencia activa para registrar storage.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.storage_editar = storage;
    this.modificar_storage_ = true;
    this.agregar_storage_ = false;
    this.pagina_base = 'ver-empresa';
  }

  CerrarFormularioStorage(refrescar: boolean): void {
    this.modificar_storage_ = false;
    this.storage_editar = null;

    if (refrescar) {
      this.LeerDatosIniciales();
    }
  }

  // METODO PARA INCIALIZAR BASE DE DATOS
  AbrirVentanaInicializarBase(): void {
    if (!this.idEmpresa || !this.codigoEmpresa) {
      this.toastr.warning('No se pudo identificar la empresa.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    if (!this.empresaBddNombre) {
      this.toastr.warning('Primero debe registrar la base de datos de la empresa.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.ventana.open(InicializarBaseComponent, {
      width: '950px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        id_empresa: Number(this.idEmpresa),
        empresa_codigo: this.codigoEmpresa,
        empresa_descripcion: this.descripcionEmpresa,
        nombre_base: this.empresaBddNombre
      }
    }).afterClosed().subscribe((refrescar: boolean) => {
      if (refrescar) {
        this.LeerDatosIniciales();
      }
    });
  }

  /** ****************************************************************************************** **
   ** **                               PARA LA GENERACION DE PDFs                             ** **                                           *
   ** ****************************************************************************************** **/
  GenerarPdf(action = 'open') {
    if (!this.descripcionEmpresa || !this.codigoEmpresa) {
      this.toastr.warning('La información de la empresa aún no se encuentra cargada.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    const documentDefinition = this.GetDocumentDefinicion();

    switch (action) {
      case 'open':
        pdfMake.createPdf(documentDefinition).open();
        break;
      case 'print':
        pdfMake.createPdf(documentDefinition).print();
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  GetDocumentDefinicion() {
    return {
      pageOrientation: 'landscape',
      pageSize: 'A4',
      pageMargins: [25, 55, 25, 45],

      watermark: {
        text: 'Administración Fulltime',
        color: 'blue',
        opacity: 0.06,
        bold: true,
        italics: false
      },

      header: {
        margin: [25, 15, 25, 0],
        columns: [
          {
            text: 'REPORTE HISTÓRICO DE EMPRESA',
            fontSize: 10,
            bold: true,
            color: '#0f4c81'
          },
          {
            text: 'Impreso por: admin desde: ' + (this.ip ?? ''),
            fontSize: 8,
            opacity: 0.45,
            alignment: 'right'
          }
        ]
      },

      footer: function (currentPage: any, pageCount: any) {
        const f = moment();
        const fecha = f.format('YYYY-MM-DD');
        const hora = f.format('HH:mm:ss');

        return {
          margin: [25, 0, 25, 10],
          columns: [
            {
              text: 'Fecha: ' + fecha + ' Hora: ' + hora,
              opacity: 0.45,
              fontSize: 8
            },
            {
              text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
              alignment: 'right',
              opacity: 0.45,
              fontSize: 8
            }
          ]
        };
      },

      content: [
        this.PdfTituloPrincipal(),

        { text: '1. INFORMACIÓN GENERAL DE LA EMPRESA', style: 'sectionHeader' },
        this.PresentarDataPDFEmpresa(),

        { text: '2. BASE DE DATOS ASOCIADA', style: 'sectionHeader' },
        this.PresentarDataPDFbaseEmpresa(),

        { text: '3. HISTORIAL DE LICENCIAS', style: 'sectionHeader' },
        this.PresentarDataPDFLicenciasHistorial(),

        { text: '4. MÓDULOS POR LICENCIA', style: 'sectionHeader' },
        this.PresentarDataPDFModulosLicencia(),

        { text: '5. LÍMITES POR LICENCIA', style: 'sectionHeader' },
        this.PresentarDataPDFLimitesLicencia(),

        { text: '6. USO DE STORAGE POR LICENCIA', style: 'sectionHeader' },
        this.PresentarDataPDFStorageLicencia()
      ],

      info: {
        title: 'Reporte_Empresa_' + this.descripcionEmpresa,
        author: 'admin',
        subject: 'Historial completo de empresa',
        keywords: 'Empresa, Base de datos, Licencias, Modulos, Limites, Storage'
      },

      styles: {
        tituloPrincipal: {
          fontSize: 15,
          bold: true,
          color: '#0f4c81',
          margin: [0, 0, 0, 4]
        },
        subtituloPrincipal: {
          fontSize: 9,
          color: '#475569',
          margin: [0, 0, 0, 14]
        },
        sectionHeader: {
          fontSize: 11,
          bold: true,
          color: '#0f4c81',
          margin: [0, 16, 0, 7]
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          alignment: 'center',
          color: '#ffffff',
          fillColor: '#0f4c81',
          margin: [2, 4, 2, 4]
        },
        tableCell: {
          fontSize: 8,
          alignment: 'left',
          margin: [2, 3, 2, 3]
        },
        tableCellCenter: {
          fontSize: 8,
          alignment: 'center',
          margin: [2, 3, 2, 3]
        },
        estadoActivo: {
          fontSize: 8,
          bold: true,
          color: '#047857'
        },
        estadoInactivo: {
          fontSize: 8,
          bold: true,
          color: '#b91c1c'
        },
        textoPequeno: {
          fontSize: 7,
          color: '#475569'
        }
      },

      defaultStyle: {
        fontSize: 8
      }
    };
  }

  private PdfTituloPrincipal() {
    return {
      stack: [
        {
          text: (this.descripcionEmpresa ?? 'EMPRESA').toUpperCase(),
          style: 'tituloPrincipal'
        },
        {
          text: 'Código: ' + (this.codigoEmpresa ?? '-') +
            ' | ID Empresa: ' + (this.idEmpresa ?? '-') +
            ' | Instalación: ' + (this.instalacionEmpresa ?? '-'),
          style: 'subtituloPrincipal'
        }
      ]
    };
  }

  private ValorPDF(valor: any): string {
    if (valor === null || valor === undefined || valor === '') {
      return '-';
    }

    return String(valor);
  }

  private EstadoPDF(estado: any) {
    const texto = this.ValorPDF(estado);

    return {
      text: texto,
      style: texto === 'ACTIVA' || texto === 'Activo' || texto === 'true'
        ? 'estadoActivo'
        : 'estadoInactivo'
    };
  }

  private BooleanPDF(valor: boolean): string {
    return valor ? 'Sí' : 'No';
  }

  PresentarDataPDFEmpresa() {
    return {
      table: {
        widths: ['18%', '22%', '18%', '22%', '20%'],
        body: [
          [
            { text: 'ID EMPRESA', style: 'tableHeader' },
            { text: 'CÓDIGO', style: 'tableHeader' },
            { text: 'ESTADO', style: 'tableHeader' },
            { text: 'ZONA HORARIA', style: 'tableHeader' },
            { text: 'INSTALACIÓN', style: 'tableHeader' }
          ],
          [
            { text: this.ValorPDF(this.idEmpresa), style: 'tableCellCenter' },
            { text: this.ValorPDF(this.codigoEmpresa), style: 'tableCellCenter' },
            { text: this.estadoEmpresa ? 'Activa' : 'Inactiva', style: 'tableCellCenter' },
            { text: this.ValorPDF(this.zonaHorariaEmpresa), style: 'tableCellCenter' },
            { text: this.ValorPDF(this.instalacionEmpresa), style: 'tableCellCenter' }
          ]
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  PresentarDataPDFbaseEmpresa() {
    if (!this.baseEmpresa || this.baseEmpresa.length === 0) {
      return { text: 'No existe base de datos registrada para esta empresa.', style: 'textoPequeno' };
    }

    return {
      table: {
        widths: ['22%', '22%', '22%', '10%', '24%'],
        body: [
          [
            { text: 'DESCRIPCIÓN', style: 'tableHeader' },
            { text: 'NOMBRE BASE', style: 'tableHeader' },
            { text: 'HOST', style: 'tableHeader' },
            { text: 'PUERTO', style: 'tableHeader' },
            { text: 'USUARIO', style: 'tableHeader' }
          ],
          [
            { text: this.ValorPDF(this.empresaBddDescripcion), style: 'tableCell' },
            { text: this.ValorPDF(this.empresaBddNombre), style: 'tableCell' },
            { text: this.ValorPDF(this.empresaBddHost), style: 'tableCell' },
            { text: this.ValorPDF(this.empresaBddPuerto), style: 'tableCellCenter' },
            { text: this.ValorPDF(this.empresaBddUsuario), style: 'tableCell' }
          ]
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  PresentarDataPDFLicenciasHistorial() {
    if (!this.licenciaEmpresa || this.licenciaEmpresa.length === 0) {
      return { text: 'No existen licencias registradas.', style: 'textoPequeno' };
    }

    const body = [
      [
        { text: 'ID', style: 'tableHeader' },
        { text: 'ESTADO', style: 'tableHeader' },
        { text: 'LLAVE PÚBLICA', style: 'tableHeader' },
        { text: 'ACTIVACIÓN', style: 'tableHeader' },
        { text: 'DESACTIVACIÓN', style: 'tableHeader' },
        { text: 'OBSERVACIÓN', style: 'tableHeader' }
      ],
      ...this.licenciaEmpresa.map((licencia: any) => [
        { text: this.ValorPDF(licencia.id_licencia), style: 'tableCellCenter' },
        this.EstadoPDF(licencia.estado),
        { text: this.ValorPDF(licencia.llave_publica), style: 'tableCell' },
        { text: this.ValorPDF(licencia.fecha_activacion_formateada), style: 'tableCellCenter' },
        { text: this.ValorPDF(licencia.fecha_desactivacion_formateada), style: 'tableCellCenter' },
        { text: this.ValorPDF(licencia.observacion), style: 'tableCell' }
      ])
    ];

    return {
      table: {
        headerRows: 1,
        widths: ['6%', '10%', '38%', '13%', '13%', '20%'],
        body
      },
      layout: 'lightHorizontalLines'
    };
  }

  PresentarDataPDFModulosLicencia() {
    if (!this.modulosLicenciaAgrupados || this.modulosLicenciaAgrupados.length === 0) {
      return { text: 'No existen módulos configurados por licencia.', style: 'textoPequeno' };
    }

    const contenido: any[] = [];

    this.modulosLicenciaAgrupados.forEach((grupo) => {
      contenido.push({
        text: 'Licencia ID: ' + grupo.id_licencia + ' | Estado: ' + grupo.estado,
        bold: true,
        fontSize: 9,
        color: '#0f4c81',
        margin: [0, 8, 0, 4]
      });

      const body = [
        [
          { text: 'CÓDIGO', style: 'tableHeader' },
          { text: 'MÓDULO', style: 'tableHeader' },
          { text: 'DESCRIPCIÓN', style: 'tableHeader' },
          { text: 'ACTIVO', style: 'tableHeader' },
          { text: 'FECHA ACTIVACIÓN', style: 'tableHeader' },
          { text: 'FECHA DESACTIVACIÓN', style: 'tableHeader' }
        ],
        ...grupo.modulos.map((modulo) => [
          { text: this.ValorPDF(modulo.codigo), style: 'tableCellCenter' },
          { text: this.ValorPDF(modulo.nombre), style: 'tableCell' },
          { text: this.ValorPDF(modulo.descripcion), style: 'tableCell' },
          { text: this.BooleanPDF(modulo.activo), style: 'tableCellCenter' },
          {
            text: modulo.fecha_activacion
              ? this.validar.FormatearFecha(modulo.fecha_activacion, 'YYYY-MM-DD', this.validar.dia_abreviado)
              : '-',
            style: 'tableCellCenter'
          },
          {
            text: modulo.fecha_desactivacion
              ? this.validar.FormatearFecha(modulo.fecha_desactivacion, 'YYYY-MM-DD', this.validar.dia_abreviado)
              : '-',
            style: 'tableCellCenter'
          }
        ])
      ];

      contenido.push({
        table: {
          headerRows: 1,
          widths: ['12%', '20%', '32%', '8%', '14%', '14%'],
          body
        },
        layout: 'lightHorizontalLines'
      });
    });

    return {
      stack: contenido
    };
  }

  PresentarDataPDFLimitesLicencia() {
    if (!this.limitesLicencia || this.limitesLicencia.length === 0) {
      return { text: 'No existen límites registrados por licencia.', style: 'textoPequeno' };
    }

    const body = [
      [
        { text: 'ID LICENCIA', style: 'tableHeader' },
        { text: 'ESTADO', style: 'tableHeader' },
        { text: 'ACTIVACIÓN', style: 'tableHeader' },
        { text: 'DESACTIVACIÓN', style: 'tableHeader' },
        { text: 'USUARIOS WEB', style: 'tableHeader' },
        { text: 'USUARIOS APP', style: 'tableHeader' },
        { text: 'RELOJES', style: 'tableHeader' },
        { text: 'STORAGE MB', style: 'tableHeader' }
      ],
      ...this.limitesLicencia.map((limite) => [
        { text: this.ValorPDF(limite.id_licencia), style: 'tableCellCenter' },
        this.EstadoPDF(limite.estado),
        { text: this.ValorPDF(limite.fecha_activacion_formateada), style: 'tableCellCenter' },
        { text: this.ValorPDF(limite.fecha_desactivacion_formateada), style: 'tableCellCenter' },
        { text: this.ValorPDF(limite.usuarios_web_max), style: 'tableCellCenter' },
        { text: this.ValorPDF(limite.usuarios_app_max), style: 'tableCellCenter' },
        { text: this.ValorPDF(limite.relojes_max), style: 'tableCellCenter' },
        { text: this.ValorPDF(limite.storage_mb_max), style: 'tableCellCenter' }
      ])
    ];

    return {
      table: {
        headerRows: 1,
        widths: ['10%', '10%', '13%', '13%', '13%', '13%', '10%', '18%'],
        body
      },
      layout: 'lightHorizontalLines'
    };
  }

  PresentarDataPDFStorageLicencia() {
    if (!this.storageLicencia || this.storageLicencia.length === 0) {
      return { text: 'No existen registros de uso de storage.', style: 'textoPequeno' };
    }

    const body = [
      [
        { text: 'ID LICENCIA', style: 'tableHeader' },
        { text: 'ESTADO', style: 'tableHeader' },
        { text: 'STORAGE USADO MB', style: 'tableHeader' },
        { text: 'ORIGEN', style: 'tableHeader' },
        { text: 'FECHA REGISTRO', style: 'tableHeader' },
        { text: 'FECHA CÁLCULO', style: 'tableHeader' },
        { text: 'RESULTADO', style: 'tableHeader' },
        { text: 'OBSERVACIÓN / ERROR', style: 'tableHeader' }
      ],
      ...this.storageLicencia.map((storage) => [
        { text: this.ValorPDF(storage.id_licencia), style: 'tableCellCenter' },
        this.EstadoPDF(storage.estado),
        { text: this.ValorPDF(storage.storage_mb_usado) + ' MB', style: 'tableCellCenter' },
        { text: this.ValorPDF(storage.origen_calculo), style: 'tableCellCenter' },
        { text: this.ValorPDF(storage.fecha_registro_formateada), style: 'tableCellCenter' },
        { text: this.ValorPDF(storage.fecha_calculo_formateada), style: 'tableCellCenter' },
        {
          text: storage.calculo_exitoso ? 'Exitoso' : 'Con error',
          style: storage.calculo_exitoso ? 'estadoActivo' : 'estadoInactivo'
        },
        {
          text: this.ValorPDF(storage.mensaje_error || storage.observacion),
          style: 'tableCell'
        }
      ])
    ];

    return {
      table: {
        headerRows: 1,
        widths: ['9%', '9%', '13%', '10%', '12%', '12%', '10%', '25%'],
        body
      },
      layout: 'lightHorizontalLines'
    };
  }

  PresentarDataPDFlicenciaEmpresa() {
    return {
      table: {
        widths: [300, 100, 100],
        body: [
          [
            { text: 'LLAVE PÚBLICA', style: 'tableHeader' },
            { text: 'FECHA ACTIVACIÓN', style: 'tableHeader' },
            { text: 'FECHA DESACTIVACIÓN', style: 'tableHeader' }
          ],
          [
            { text: this.empresaLicenciaLlavePublica, style: 'tableCell' },
            { text: this.empresaLicenciaFechaActivacion, style: 'tableCell' },
            { text: this.empresaLicenciaFechaDesactivacion, style: 'tableCell' }
          ]
        ]
      }
    };
  }

}
