import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { EmpresaElemento } from 'src/app/model/empresa.model';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';
import { forkJoin } from 'rxjs';
import { MetodosComponent } from '../../metodoEliminar/metodos.component';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';

@Component({
  selector: 'app-lista-empresas',
  templateUrl: './lista-empresas.component.html',
  styleUrl: './lista-empresas.component.css'
})
export class ListaEmpresasComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  empresasEliminar: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  empresa: any = [];
  mostarTabla: boolean = false;

  // CAMPOS DEL FORMULARIO
  empresa_id = new FormControl('');
  empresa_codigo = new FormControl('');
  empresa_descripcion = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  // VARAIBLES DE SELECCION DE DATOS DE UNA TABLA
  selectionUno = new SelectionModel<EmpresaElemento>(true, []);
  selectionDos = new SelectionModel<EmpresaElemento>(true, []);

  // ACTIVAR BOTONES DE LISTAS DE USUARIOS
  lista_activos: boolean = false;
  tabla_activos: boolean = true;
  lista_inactivos: boolean = true;

  // VARIABLES PROGRESS SPINNER
  progreso: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  ip: string | null;

  DataEmpresas: any;

  constructor(
    public restListaEmpresa: ListaEmpresasService,
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS DE DIÁLOGO
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private restEmpresa: RegistroEmpresaService,
    private router: Router
  )
  { }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.GetEmpresas();
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.empresa.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.empresa.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: EmpresaElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.empresa_id + 1}`;
  }

  // METODO PARA DESACTIVAR O ACTIVAR CHECK LIST DE EMPLEADOS ACTIVOS
  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.selectionUno.clear();
      this.selectionDos.clear();
    }
  }

  // METODO PARA MOSTRAR LISTA DE EMPRESAS ACTIVAS
  ListarActivos() {
    this.tabla_activos = true;
    this.lista_activos = false;
    this.lista_inactivos = true;
  }
  
  // METODO PARA LISTAR EMPRESAS
  async GetEmpresas(){
    this.restListaEmpresa.ObtenerInformacionEmpresasRegistradas().subscribe(
      datos => {
        this.empresa = datos;
        console.log(':::::',this.empresa);
      },
      err => {
        this.empresa = null;
        console.log('error');
      }
    );
    
    console.log('_:::', this.empresa);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.empresa_id.reset();
    this.empresa_codigo.reset();
    this.empresa_descripcion.reset();
  }

  ConfirmarDeleteMultiple(opcion: number) {
    let seleccion = opcion === 1 ? this.selectionUno.selected : (opcion === 2 || opcion === 3) ? this.selectionDos.selected : [];
    
    const datos = {
      empleados: seleccion,
      ip: this.ip
    };

    // VERIFICAR QUE EXISTAN USUARIOS SELECCIONADOS
    seleccion.length > 0 ? this.ventana.open(MetodosComponent, { width: '450px' })
      .afterClosed().subscribe((confirmado: Boolean) => {
        if (confirmado) {
          //TODO Eliminar Empresas
          console.log('Eliminar: ', datos);
        };
      }) : this.toastr.info('No ha seleccionado empresas.', '', {
        timeOut: 6000,
      });
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

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
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
        }else{
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
