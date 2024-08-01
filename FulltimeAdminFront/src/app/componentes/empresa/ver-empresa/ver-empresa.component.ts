import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { BaseEmpresaService } from 'src/app/servicios/baseEmpresa/baseEmpresa.service';
import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';

@Component({
  selector: 'app-ver-empresa',
  templateUrl: './ver-empresa.component.html',
  styleUrl: './ver-empresa.component.css'
})
export class VerEmpresaComponent implements OnInit, AfterViewInit {

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
  contratoEmpleado: any = [];
  tituloEmpleado: any = [];
  idPerVacacion: any = [];
  empresaUno: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private informacion: ListaEmpresasService
  ){ }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.idEmpresa = id)
      )
      .subscribe(() => {
      this.LeerDatosIniciales();
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
  }

  // METODO PARA LEER DATOS ACTUALES
  LeerDatosIniciales() {
    this.datoActual = [];
    this.informacion.ObtenerInformacionEmpresaPorId(parseInt(this.idEmpresa)).subscribe(res => {
      this.datoActual = res[0];
      console.log(this.datoActual.empresa_codigo);
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
  
}
