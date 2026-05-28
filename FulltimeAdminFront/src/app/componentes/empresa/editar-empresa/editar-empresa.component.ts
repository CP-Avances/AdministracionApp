import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';
import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';


@Component({
  selector: 'app-editar-empresa',
  templateUrl: './editar-empresa.component.html',
  styleUrl: './editar-empresa.component.css'
})

export class EditarEmpresaComponent implements OnInit {

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  terceroFormGroup: FormGroup;

  filteredOptions: Observable<any[]>;
  idEmpresa: number;

  empleado_inicia: number;
  ip: string | null;
  escritura = false;



  estados = [
    { nombre: 'Activo', estado: true },
    { nombre: 'Inactivo', estado: false }
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<EditarEmpresaComponent>,
    public validar: ValidacionesService,
    private restEmpresa: RegistroEmpresaService,
    private zona: ListaEmpresasService,
    @Inject(MAT_DIALOG_DATA) public empresa: any
  ) {

  }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.GetZonaHorarias();
    this.VerificarFormulario();
    this.idEmpresa = this.empresa[0].empresa_id;
  }

  VerificarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      empresaCodigoForm: [''],
      empresaDireccionForm: [''],
      empresaDescripcionForm: [''],
      empresaNumeroRelojesForm: [''],
      empresaZonaHorariaForm: [''],
      empresaEstadoForm: [''],
      empresaInstalacionForm: [''],
    })
  }

  // METODO PARA CERRAR VENTANA
  Cancelar() {
    this.ventana.close(false);
  }

  LimpiarCampos() {
    this.primeroFormGroup.reset();
    this.ventana.close(true)
  }

  ObtenerEmpresa() {

    const { zona_horaria, estado, empresa_codigo, empresa_descripcion, numero_relojes, instalacion } = this.empresa[0];
    var zona = zona_horaria;
    var verificar_zona = this.zonas.filter((o: any) => { return zona === o.formato_nombre }).map((o: any) => { return o.nombre_general });
    this.primeroFormGroup.setValue({
      empresaCodigoForm: empresa_codigo,
      empresaDescripcionForm: empresa_descripcion,
      empresaNumeroRelojesForm: numero_relojes,
      empresaZonaHorariaForm: verificar_zona[0],
      empresaEstadoForm: estado,
      empresaInstalacionForm: instalacion
    });

  }

  ActualizarEmpresa(form1: any) {
    var zona = form1.empresaZonaHorariaForm;
    const [nombre] = zona.split(" ("); // DIVIDIMOS EN DOS PARTES
    let empresa = {
      empresa_id: this.idEmpresa,
      empresa_codigo: form1.empresaCodigoForm,
      empresa_descripcion: form1.empresaDescripcionForm,
      numero_relojes: form1.empresaNumeroRelojesForm,
      zona_horaria: nombre,
      estado: form1.empresaEstadoForm,
      instalacion: form1.empresaInstalacionForm,
    }

    this.restEmpresa.ActualizarEmpresaFormUno(empresa).subscribe(
      {
        next: (response: any) => {
          if (response.message === 'Registro actualizado.') {
            this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
              timeOut: 6000,
            });
            this.LimpiarCampos();
          }
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Upss!!! algo salió mal.', {
            timeOut: 6000,
          });
        }
      }
    );
  }

  zonas: any = [];
  // METODO PARA LISTAR EMPRESAS
  async GetZonaHorarias() {
    this.zona.ObtenerInformacionZonasHorarios().subscribe(
      {
        next: (datos) => {
          this.zonas = datos;
          this.ObtenerEmpresa();
        },
        error: () => {
          this.zonas = null;
        }
      }
    );

  }

}
