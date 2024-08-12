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

import { BaseEmpresaService } from 'src/app/servicios/baseEmpresa/baseEmpresa.service';
import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';
import { EditarEmpresaComponent } from '../editar-empresa/editar-empresa.component';
import { BaseService } from 'src/app/servicios/base/base.service';
import { RegistroBaseComponent } from '../../base/registro-base/registro-base.component';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegistroLicenciaComponent } from '../../licencia/registro-licencia/registro-licencia.component';

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
  empresaModuloHoraExtra:boolean = false;
  empresaModuloAccionPersonal:boolean = false;
  empresaModuloAlimentacion:boolean = false;
  empresaModuloPermisos:boolean = false;
  empresaModuloGeolocalizacion:boolean = false;
  empresaModuloVacaciones:boolean = false;
  empresaModuloAppMovil:boolean = false;
  empresaModuloTimbreWeb:boolean = false;

  //BASES Y LICENCIAS
  agregar_base_: boolean = false;
  editar_base_:boolean = false;
  modificar_base_:boolean = false;

  modificar_licencia_:boolean = false;
  editar_licencia_:boolean = false;
  agregar_licencia_:boolean = false;

  modificar_modulos_:boolean = false;
  editar_modulos_:boolean = false;

  pagina_base: any = '';
  base_editar: any = [];
  licencia_editar: any = [];
  modulos_editar: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private informacion: ListaEmpresasService,
    private restBase: BaseService,
    private restLicencia: LicenciaService,
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public validar: ValidacionesService
  ){ }

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
      //this.modulosEmpresa

      this.ObtenerBaseEmpresa(this.idEmpresa);
      this.ObtenerLicenciaEmpresa(this.idEmpresa);

      this.editar_modulos_ = true;
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
}
