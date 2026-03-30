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
      empresaEstadoForm: ['']
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

    const { zona_horaria, estado, empresa_codigo, empresa_direccion, empresa_descripcion, numero_relojes } = this.empresa[0];
    console.log('empresa_codigo ', empresa_codigo)
    console.log('ver empresa ', this.empresa[0])
    var zona = zona_horaria;
    var verificar_zona = this.zonas.filter((o: any) => { return zona === o.formato_nombre }).map((o: any) => { return o.nombre_general });
    this.primeroFormGroup.setValue({
      empresaCodigoForm: empresa_codigo,
      empresaDireccionForm: empresa_direccion,
      empresaDescripcionForm: empresa_descripcion,
      empresaNumeroRelojesForm: numero_relojes,
      empresaZonaHorariaForm: verificar_zona[0],
      empresaEstadoForm: estado

    });

  }

  ActualizarEmpresa(form1: any) {
    var zona = form1.empresaZonaHorariaForm;
    const [nombre] = zona.split(" ("); // DIVIDIMOS EN DOS PARTES
    let empresa = {
      empresa_id: this.idEmpresa,
      empresa_codigo: form1.empresaCodigoForm,
      empresa_direccion: form1.empresaDireccionForm,
      empresa_descripcion: form1.empresaDescripcionForm,
      numero_relojes: form1.empresaNumeroRelojesForm,
      zona_horaria: nombre,
      estado: form1.empresaEstadoForm,
    }

    this.restEmpresa.ActualizarEmpresaFormUno(empresa).subscribe(
      (response: any) => {
        console.log('response.message_', response.message);
        if (response.message === 'Registro actualizado.') {
          this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
        }
      },
      error => {
        this.toastr.error(error.error.message, 'Upss!!! algo salió mal.', {
          timeOut: 6000,
        });
      }
    );
  }

  zonas: any = [];
  // METODO PARA LISTAR EMPRESAS
  async GetZonaHorarias() {
    this.zona.ObtenerInformacionZonasHorarios().subscribe(
      datos => {
        this.zonas = datos;
        console.log(':::::', this.zonas);
        this.ObtenerEmpresa();
      },
      err => {
        this.zonas = null;
        console.log('error');
      }
    );

    console.log('_:::', this.zonas);
  }

}
