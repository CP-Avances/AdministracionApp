import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { map, shareReplay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable, asapScheduler } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import * as moment from 'moment';

import { MainNavService } from './main-nav.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})

export class MainNavComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 800px)')
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  // VARIABLES DE ALMACENAMIENTO
  idEmpresa: number;
  datosEmpresa: any = [];
  id_empleado_logueado: number;
  rol: any

  // VERIFICAR LICENCIA
  fec_caducidad_licencia: Date;

  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  //COMPONENTES DEL MENU
  menuGeneralUsuarios: any = [];//Menu General
  menuGeneralAdministrador: any = [];//Menu Administrador
  paginasMG: any = []; //Variable para guardar los permisos de acceso a botones que tiene asignado
  
  itemConfiguracion: boolean = false;
  subItemConfiguracionParametrizacion: boolean = false;
  childrenParametrizacion: any = [];
  vistaVistaEmpresa: boolean = false;
  vistaParametros: boolean = false;
  vistaConfigurarCorreo: boolean = false;
  vistaRoles: boolean = false;
  vistaListarRegimen: boolean = false;
  vistaModalidadLaboral: boolean = false;
  vistaTipoCargos: boolean = false;
  subItemConfiguracionLocalizacion: boolean = false;
  childrenLocalizacion: any = [];
  vistaProvincia: boolean = false;
  vistaListarCiudades: boolean = false;
  vistaSucursales: boolean = false;
  vistaDepartamento: boolean = false;

  itemUsuarios: boolean = false;
  childrenUsuarios: any = [];
  vistaCodigo: boolean = false;
  vistaNivelTitulos: boolean = false;
  vistaTitulos: boolean = false;
  vistaEmpleados: boolean = false;
  vistaAdministrarSucursales: boolean = false;
  vistaCargarPlantillas: boolean = false;

  itemHorarios: boolean = false;
  childrenHorarios: any = [];
  vistaListarFeriados: boolean = false;
  vistaHorario: boolean = false;
  vistaHorariosMultiples: boolean = false;
  vistaAsistencia: boolean = false;

  itemModulos: boolean = true;
  subItemModulosPermisos: boolean = false;
  childrenPermisos: any = [];
  vistaModulosPermisosVerTipoPermiso: boolean = false;
  vistaModulosPermisosPermisosMultiples: boolean = false;
  vistaModulosPermisosPermisosSolicitados: boolean = false;
  subItemModulosVacaciones: boolean = false;
  childrenVacaciones: any = [];
  vistaModulosVacacionesVacacionesSolicitadas: boolean = false;
  subItemModulosHorasExtras: boolean = false;
  childrenHorasExtras: any = [];
  vistaModulosHorasExtrasListaHorasExtras: boolean = false;
  vistaModulosHorasExtrasPlanificaHoraExtra: boolean = false;
  vistaModulosHorasExtrasListadoPlanificaciones: boolean = false;
  vistaModulosHorasExtrasHorasExtrasSolicitadas: boolean = false;
  subItemModulosAlimentacion: boolean = false;
  childrenAlimentacion: any = [];
  vistaModulosAlimentacionListarTipoComidas: boolean = false;
  vistaModulosAlimentacionAlimentacion: boolean = false;
  vistaModulosAlimentacionListaPlanComida: boolean = false;
  vistaModulosAlimentacionListaSolicitaComida: boolean = false;
  subItemModulosAccionPersonal: boolean = false;
  childrenAccionPersonal: any = [];
  vistaModulosAccionPersonalProceso: boolean = false;
  vistaModulosAccionPersonalAccionesPersonal: boolean = false;
  vistaModulosAccionPersonalPedidoAccion: boolean = false;
  vistaModulosAccionPersonalListaPedidos: boolean = false;
  subItemModulosGeolocalizacion: boolean = false;
  childrenGeolocalizacion: any = [];
  vistaModulosGeolocalizacionCoordenadas: boolean = false;
  subItemModulosTimbreVirtual: boolean = false;
  childrenTimbreVirtual: any = [];
  vistaModulosTimbreVirtualTimbresWeb: boolean = false;
  vistaModulosTimbreVirtualTimbresPersonal: boolean = false;
  subItemModulosAplicacionMovil: boolean = false;
  childrenAplicacionMovil: any = [];
  vistaModulosAplicacionMovilAppMovil: boolean = false;
  vistaModulosAplicacionMovilRegistroDispositivos: boolean = false;
  
  itemTimbres: boolean = false;
  childrenTimbres: any = [];
  vistaModulosTimbresListarRelojes: boolean = false;
  vistaModulosTimbresTimbresAdmin: boolean = false;
  vistaModulosTimbresTimbresMultiples: boolean = false;
  vistaModulosTimbresBuscarTimbre: boolean = false;

  itemNotificaciones: boolean = false;
  childrenNotificaciones: any = [];
  vistaModulosNotificacionesConfigurarNotificaciones: boolean = false;
  vistaModulosNotificacionesArchivos: boolean = false;
  vistaModulosNotificacionesCumpleanios: boolean = false;
  vistaModulosNotificacionesComunicados: boolean = false;

  itemReportes: boolean = true;
  subItemReportesGenerales: boolean = false;
  childrenGenerales: any = [];
  vistaReportesGeneralesReporteEmpleados: boolean = false;
  vistaReportesGeneralesListaVacunados: boolean = false;
  subItemReportesAsistencia: boolean = false;
  childrenAsistencia: any = [];
  vistaReportesAsistenciaReporteFaltas: boolean = false;
  vistaReportesAsistenciaReporteAtrasosMultiples: boolean = false;
  vistaReportesAsistenciaReporteHorasTrabajadas: boolean = false;
  vistaReportesAsistenciaTiempoAlimentacion: boolean = false;
  vistaReportesAsistenciaSalidasAnticipadas: boolean = false;
  vistaReportesAsistenciaReporteResumenAsistencia: boolean = false;
  vistaReportesAsistenciaReportePlanificacionHoraria: boolean = false;
  subItemReportesTimbres: boolean = false;
  childrenReportesTimbres: any = [];
  vistaReportesTimbresReporteTimbresMultiples: boolean = false;
  vistaReportesTimbresReporteTimbreMlr: boolean = false;
  vistaReportesTimbresReporteTimbreAbierto: boolean = false;
  vistaReportesTimbresReporteTimbreIncompleto: boolean = false;
  subItemReportesPermisos: boolean = false;
  childrenReportesPermisos: any = [];
  vistaReportesPermisosReportePermisos: boolean = false;
  subItemReportesVacaciones: boolean = false;
  childrenReportesVacaciones: any = [];
  vistaReportesVacacionesReporteKardex: boolean = false;
  vistaReportesVacacionesSolicitudVacacion: boolean = false;
  subItemReportesHorasExtras: boolean = false;
  childrenReportesHorasExtras: any = [];
  vistaReportesHorasExtrasHorasExtras: boolean = false;
  vistaReportesHorasExtrasReporteHorasExtras: boolean = false;
  vistaReportesHorasExtrasMacroHoraExtra: boolean = false;
  vistaReportesHorasExtrasMacroJornadavsHoraExtra: boolean = false;
  subItemReportesAplicacionMovil: boolean = false;
  childrenReportesAplicacionMovil: any = [];
  vistaReportesAplicacionMovilReporteTimbreRelojVirtual: boolean = false;
  subItemReportesTimbreVirtual: boolean = false;
  childrenReportesTimbreVirtual: any = [];
  vistaReportesTimbreVirtualReporteTimbreSistema: boolean = false;
  subItemReportesAlimentacion: boolean = false;
  childrenReportesAlimentacion: any = [];
  vistaReportesAlimentacionAlimentosGeneral: boolean = false;
  vistaReportesAlimentacionAlimentosDetallado: boolean = false;
  vistaReportesAlimentacionAlimentosInvitados: boolean = false;
  subItemReportesAnalisisDatos: boolean = false;
  childrenReportesAnalisisDatos: any = [];
  vistaReportesAnalisisDatosAnalisisDatos: boolean = false;
  datosPaginaRol: any = [];

  constructor(
    public inicio: LoginService,
    public ventana: MatDialog,
    public location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    private funciones: MainNavService,
    private breakpointObserver: BreakpointObserver
  ) { }

  isExpanded = true;
  isShowing = false;
  barraInicial = false;

  // EVENTOS DE SELECCION DE MENU
  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  // EVENTOS DE SELECCION DE MEN
  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  // METODO PARA MOSTRAR DATOS DE LICENCIA DEL SISTEMA
  showMessageLicencia: Boolean = false;
  FuncionLicencia() {
    const licencia = localStorage.getItem('fec_caducidad_licencia');
    if (licencia !== null) {
      const fec_caducidad = new Date(licencia.split('.')[0])
      const fecha_hoy = new Date();
      this.fec_caducidad_licencia = fec_caducidad;
      const fecha1 = moment(fecha_hoy.toJSON().split('T')[0])
      const fecha2 = moment(fec_caducidad.toJSON().split('T')[0])

      const diferencia = fecha2.diff(fecha1, 'days');

      if (diferencia <= 30) {
        this.showMessageLicencia = true;
        const text = (diferencia === 1) ? 'dia' : 'dias';
        this.toaster.warning(`SU LICENCIA EXPIRA EN ${diferencia + ' ' + text}`)
      }
    }
  }

  ngOnInit() {
    // ES IMPORTANTE EL ORDEN EN EL QUE SE INVOCAN LAS FUNCIONES
    if (this.inicio.loggedIn()) {
      this.idEmpresa = parseInt(localStorage.getItem('empresa') as string)
      this.FuncionLicencia();
      this.breakpointObserver.observe('(max-width: 800px)').subscribe((result: BreakpointState) => {
        this.barraInicial = result.matches;
      });
    }
  }

  // METODO PARA MOSTRAR METODOS
  LlamarDatos() {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado') as string);
    this.ConfigurarSeguridad();
  }

  // METODO PARA VALIDAR FRASE DE SEGURIDAD
  ConfigurarSeguridad() {
    var f = moment();
    let hora: number = parseInt(moment(f).format('HH'));
    let fecha: string = moment(f).format('YYYY-MM-DD');
    console.log('HORAS ', hora, ' fechas ', fecha)
  }

  // METODO DE NAVEGACION SEGUN ROL DE ACCESO
  irHome() {
    this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
  }

  // CONTROL DE MENU PRINCIPAL
  nombreSelect: string = '';
  manejarEstadoActivo(name: any) {
    this.nombreSelect = name;
  }

}
