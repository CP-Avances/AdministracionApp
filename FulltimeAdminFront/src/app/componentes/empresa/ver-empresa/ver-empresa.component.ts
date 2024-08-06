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

  //BASES Y LICENCIAS
  agregar_base_: boolean = false;
  editar_base_:boolean = false;

  editar_base: boolean = false;
  pagina_base: any = '';
  base_editar: any = [];
  btnActualizarBase: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private informacion: ListaEmpresasService,
    private restBase: BaseService,
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS
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

      this.ObtenerBaseEmpresa(this.idEmpresa);

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
    this.editar_base = true;
    this.base_editar = dataBase;
    this.pagina_base = 'ver-empresa';
    this.btnActualizarBase = true;
  }
  
  // MOSTRAR VENTANA EDICION DE BASE
  VerBaseEdicion(value: boolean) {
    this.btnActualizarBase = value;
    this.editar_base = false;

    this.editar_base_ = false;
    this.agregar_base_ = false;
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
  
}
