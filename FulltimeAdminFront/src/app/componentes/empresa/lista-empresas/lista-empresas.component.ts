import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';

@Component({
  selector: 'app-lista-empresas',
  templateUrl: './lista-empresas.component.html',
  styleUrl: './lista-empresas.component.css'
})
export class ListaEmpresasComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  empresa: any = [];

  // CAMPOS DEL FORMULARIO
  empresa_id = new FormControl('');
  empresa_codigo = new FormControl('');
  empresa_descripcion = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    public restListaEmpresa: ListaEmpresasService,
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS DE DIÁLOGO
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private restEmpresa: RegistroEmpresaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.GetEmpresas();
  }


  // METODO PARA LISTAR EMPRESAS
  async GetEmpresas() {
    this.restListaEmpresa.ObtenerInformacionEmpresasRegistradas().subscribe(
      {
        next: (datos) => {
          this.empresa = datos;
        },
        error: () => {
          this.empresa = null;
        }
      }
    );
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.empresa_id.reset();
    this.empresa_codigo.reset();
    this.empresa_descripcion.reset();
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  //  METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  ConfirmarDelete(datos: any) {
    let dataIdEmpresa = {
      empresa_id: datos
    }
    this.restEmpresa.EliminarEmpresa(dataIdEmpresa).subscribe(
      response => {
        if (response.message === 'Registro eliminado.') {
          this.VerDatos();
          this.toastr.success('Operación exitosa.', 'Registro Eliminado.', {
            timeOut: 6000,
          });
        } else {
          this.toastr.error('Verifique datos adjuntos a la empresa antes de eliminarla', 'Upss!!! algo salió mal.', {
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
  }

  VerDatos() {
    this.router.navigate(['/home']);
  }

}
