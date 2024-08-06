import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';


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

  constructor(
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<EditarEmpresaComponent>,
    public validar: ValidacionesService,
    private restEmpresa: RegistroEmpresaService,
    @Inject(MAT_DIALOG_DATA) public empresa: any
  ){

  }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');

    this.VerificarFormulario();
    this.ObtenerEmpresa();
    this.idEmpresa = this.empresa[0].empresa_id;
  }

  VerificarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      empresaCodigoForm: [''],
      empresaDireccionForm: [''],
      empresaDescripcionForm: [''],
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

  ObtenerEmpresa(){
  
    const {empresa_id, empresa_codigo, empresa_direccion, empresa_descripcion} = this.empresa[0];

    this.primeroFormGroup.setValue({
      empresaCodigoForm: empresa_codigo,
      empresaDireccionForm: empresa_direccion,
      empresaDescripcionForm: empresa_descripcion,
    });
    
  }

  ActualizarEmpresa(form1: any){
    let empresa = {
      empresa_id: this.idEmpresa,
      empresa_codigo: form1.empresaCodigoForm,
      empresa_direccion: form1.empresaDireccionForm,
      empresa_descripcion: form1.empresaDescripcionForm
    }
    console.log('empresa.empresa_id_',empresa.empresa_id);
    console.log('empresa.empresa_codigo_',empresa.empresa_codigo);
    console.log('empresa.empresa_direccion_',empresa.empresa_direccion);
    console.log('empresa.empresa_descripcion_',empresa.empresa_descripcion);

    this.restEmpresa.ActualizarEmpresaFormUno(empresa).subscribe(
      (response: any) => {
        console.log('response.message_',response.message);
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

}
