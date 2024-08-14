// IMPORTAR LIBRERIAS
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker } from '@angular/material/datepicker';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { BaseEmpresaService } from 'src/app/servicios/baseEmpresa/baseEmpresa.service';
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
  discapacidadUser: any = [];
  empleadoLogueado: any = [];
  baseEmpresa: any = [];
  licenciaEmpresa: any = [];
  modulosEmpresa: any = [];
  tituloEmpleado: any = [];
  idPerVacacion: any = [];
  empresaUno: any = [];

  //VER EMPRESA
  descripcionEmpresa: string;
  codigoEmpresa: string;
  direccionEmpresa: string;
  numeroRelojesEmpresa: string;

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
  idEmpresaLicencia: string;
  idEmpresaLicenciaBdd: string;
  empresaLicenciaLlavePublica: string;
  empresaLicenciaFechaActivacion: any;
  empresaLicenciaFechaDesactivacion: any;

  //VER MODULOS EMPRESA
  empresaModuloHoraExtra: boolean = false;
  empresaModuloAccionPersonal: boolean = false;
  empresaModuloAlimentacion: boolean = false;
  empresaModuloPermisos: boolean = false;
  empresaModuloGeolocalizacion: boolean = false;
  empresaModuloVacaciones: boolean = false;
  empresaModuloAppMovil: boolean = false;
  empresaModuloTimbreWeb: boolean = false;

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
      this.direccionEmpresa = this.empresaUno[0].empresa_direccion;
      this.numeroRelojesEmpresa = this.empresaUno[0].numero_relojes;

      //MODULOS
      this.empresaModuloPermisos = this.empresaUno[0].permisos;
      this.empresaModuloVacaciones = this.empresaUno[0].vacaciones;
      this.empresaModuloHoraExtra = this.empresaUno[0].hora_extra;
      this.empresaModuloGeolocalizacion = this.empresaUno[0].geolocalizacion;
      this.empresaModuloTimbreWeb = this.empresaUno[0].timbre_web;
      this.empresaModuloAppMovil = this.empresaUno[0].app_movil;
      this.empresaModuloAccionPersonal = this.empresaUno[0].accion_personal;
      this.empresaModuloAlimentacion = this.empresaUno[0].alimentacion;

      //ARMAR JSON MODULOS
      this.modulosEmpresa = {
        empresa_id: this.idEmpresa,
        empresa_modulos_permisos_: this.empresaModuloPermisos,
        empresa_modulos_vacaciones_: this.empresaModuloVacaciones,
        empresa_modulos_hora_extra_: this.empresaModuloHoraExtra,
        empresa_modulos_geolocalizacion_: this.empresaModuloGeolocalizacion,
        empresa_modulos_timbre_web_: this.empresaModuloTimbreWeb,
        empresa_modulos_app_movil_: this.empresaModuloAppMovil,
        empresa_modulos_accion_personal_: this.empresaModuloAccionPersonal,
        empresa_modulos_alimentacion_: this.empresaModuloAlimentacion
      }

      this.ObtenerBaseEmpresa(this.idEmpresa);
      this.ObtenerLicenciaEmpresa(this.idEmpresa);

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
          //this.VerEmpresa();
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
  AbrirVentanaEditarModulos(dataLicencia: any) {
    this.editar_modulos_ = false;
    this.modificar_modulos_ = true;
    this.modulos_editar = dataLicencia;
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

  ObtenerLicenciaEmpresa(id_empresa: string) {
    let id_empresa_mod = Number(id_empresa);
    this.licenciaEmpresa = [];
    this.restLicencia.BuscarDatosLicenciaPorIdEmpresa(id_empresa_mod).subscribe(res => {
      this.licenciaEmpresa = res;

      this.idEmpresaLicencia = this.licenciaEmpresa[0].id_empresa_licencia;
      this.idEmpresaBdd = this.licenciaEmpresa[0].id_empresa_bdd;
      this.empresaLicenciaLlavePublica = this.licenciaEmpresa[0].llave_publica;
      this.empresaLicenciaFechaActivacion = this.validar.FormatearFecha(this.licenciaEmpresa[0].fecha_activacion, 'YYYY-MM-DD', this.validar.dia_abreviado);
      this.empresaLicenciaFechaDesactivacion = this.validar.FormatearFecha(this.licenciaEmpresa[0].fecha_desactivacion, 'YYYY-MM-DD', this.validar.dia_abreviado);

      this.editar_licencia_ = true;
      this.agregar_licencia_ = false;
    },
      err => {
        this.editar_licencia_ = false;
        this.agregar_licencia_ = true;
      });
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
    this.ventana.open(RegistroLicenciaComponent, { width: '900px', data: this.idEmpresaBdd }).
      afterClosed().subscribe(item => {
        this.LeerDatosIniciales();
        this.editar_licencia_ = true;
      }
      );
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
          this.toastr.error(error.error.message, 'Upss!!! algo salió mal.', {
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

  /** ****************************************************************************************** **
   ** **                               PARA LA GENERACION DE PDFs                             ** **                                           *
   ** ****************************************************************************************** **/
  GenerarPdf(action = 'open') {
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GetDocumentDefinicion() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'portrait',
      watermark: { text: 'Administración Fulltime', color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  admin desde: ' + this.ip, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        {
          text: (this.descripcionEmpresa).toUpperCase(),
          bold: true, fontSize: 14,
          alignment: 'left',
          margin: [0, 15, 0, 18]
        },
        {
          columns: [
            [
              { text: 'Id de empresa: ' + this.empresaUno[0].empresa_id, style: 'item' },
              { text: 'Código de la empresa: ' + this.codigoEmpresa, style: 'item' },
              { text: 'Dirección URL del servicio de la empresa: ' + this.direccionEmpresa, style: 'item' },
              { text: 'Número de relojes: ' + this.numeroRelojesEmpresa, style: 'item' }
            ]
          ]
        },
        { text: 'MÓDULOS ', style: 'header' },
        this.PresentarDataPDFmodulosEmpresaParte1(),
        this.PresentarDataPDFmodulosEmpresaParte2(),
        { text: 'BASE DE DATOS ASOCIADA A LA EMPRESA', style: 'header' },
        this.PresentarDataPDFbaseEmpresa(),
        { text: 'LICENCIA ASOCIADA A LA EMPRESA', style: 'header' },
        this.PresentarDataPDFlicenciaEmpresa()
      ],
      info: {
        title: 'Datos_Empresa_' + this.descripcionEmpresa,
        author: 'admin',
        subject: 'Perfil',
        keywords: 'Perfil, Empresa',
      },
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 20, 0, 10] },
        name: { fontSize: 14, bold: true },
        item: { fontSize: 12, bold: false },
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: '#8adff9' },
        tableCell: { fontSize: 12, alignment: 'center'}
      }
    };
  }

  PresentarDataPDFbaseEmpresa() {
    return {
      table: {
        widths: [125, 125, 90, 50, 100],
        body: [
          [
            { text: 'DESCRIPCIÓN', style: 'tableHeader' },
            { text: 'NOMBRE', style: 'tableHeader' },
            { text: 'HOST', style: 'tableHeader' },
            { text: 'PUERTO', style: 'tableHeader' },
            { text: 'USUARIO', style: 'tableHeader' }
          ],
          [
            { text: this.empresaBddDescripcion, style: 'tableCell' },
            { text: this.empresaBddNombre, style: 'tableCell' },
            { text: this.empresaBddHost, style: 'tableCell' },
            { text: this.empresaBddPuerto, style: 'tableCell' },
            { text: this.empresaBddUsuario, style: 'tableCell' }
          ]
        ]
      }
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

  PresentarDataPDFmodulosEmpresaParte1() {
    return {
      table: {
        widths: [125, 125, 125, 125],
        body: [
          [
            { text: 'PERMISOS', style: 'tableHeader' },
            { text: 'VACACIONES', style: 'tableHeader' },
            { text: 'HORAS EXTRAS', style: 'tableHeader' },
            { text: 'GEOLOCALIZACIÓN', style: 'tableHeader' }
          ],
          [
            { text: this.empresaModuloPermisos === true ? 'Activo' : 'Inactivo', style: 'tableCell' },
            { text: this.empresaModuloVacaciones === true ? 'Activo' : 'Inactivo', style: 'tableCell' },
            { text: this.empresaModuloHoraExtra === true ? 'Activo' : 'Inactivo', style: 'tableCell' },
            { text: this.empresaModuloGeolocalizacion === true ? 'Activo' : 'Inactivo', style: 'tableCell' }
          ]
        ]
      }
    };
  }

  PresentarDataPDFmodulosEmpresaParte2() {
    return {
      table: {
        widths: [125, 125, 125, 125],
        body: [
          [
            { text: 'TIMBRE VIRTUAL', style: 'tableHeader' },
            { text: 'APLICACIÓN MÓVIL', style: 'tableHeader' },
            { text: 'ACCIONES DE PERSONAL', style: 'tableHeader' },
            { text: 'ALIMENTACIÓN', style: 'tableHeader' }
          ],
          [
            { text: this.empresaModuloTimbreWeb === true ? 'Activo' : 'Inactivo', style: 'tableCell' },
            { text: this.empresaModuloAppMovil === true ? 'Activo' : 'Inactivo', style: 'tableCell' },
            { text: this.empresaModuloAccionPersonal === true ? 'Activo' : 'Inactivo', style: 'tableCell' },
            { text: this.empresaModuloAlimentacion === true ? 'Activo' : 'Inactivo', style: 'tableCell' }
          ]
        ]
      }
    };
  }

}
