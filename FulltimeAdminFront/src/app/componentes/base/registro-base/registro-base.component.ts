import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { BaseService } from 'src/app/servicios/base/base.service';

@Component({
  selector: 'app-registro-base',
  templateUrl: './registro-base.component.html',
  styleUrl: './registro-base.component.css'
})
export class RegistroBaseComponent implements OnInit {

  ip: string | null;

  empresaBaseDescripcionForm = new FormControl('', Validators.required);
  empresaBaseNombreForm = new FormControl('', Validators.required);
  empresaBaseHostForm = new FormControl('', Validators.required);
  empresaBasePuertoForm = new FormControl('', Validators.required);
  empresaBaseUsuarioForm = new FormControl('', Validators.required);
  empresaBaseContrasenaForm = new FormControl('', Validators.required);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    empresaBaseDescripcionForm: this.empresaBaseDescripcionForm,
    empresaBaseNombreForm: this.empresaBaseNombreForm,
    empresaBaseHostForm: this.empresaBaseHostForm,
    empresaBasePuertoForm: this.empresaBasePuertoForm,
    empresaBaseUsuarioForm: this.empresaBaseUsuarioForm,
    empresaBaseContrasenaForm: this.empresaBaseContrasenaForm
  })

  constructor(
    public ventana: MatDialogRef<RegistroBaseComponent>,
    private restBase: BaseService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public datoEmpresa: any
  ){ }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
  }

  LimpiarCampos() {
    this.formulario.reset();
  }

  // CERRAR VENTANA DE REGISTRO DE CONTRATO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  ValidarDatosBase(form: any) {
    this.InsertarBase(form);
  }

  InsertarBase(form: any) {
    let datosBase = {
      id_empresa: this.datoEmpresa,
      empresa_bdd_nombre: form.empresaBaseNombreForm,
      empresa_bdd_host: form.empresaBaseHostForm,
      empresa_bdd_puerto: form.empresaBasePuertoForm,
      empresa_bdd_descripcion: form.empresaBaseDescripcionForm,
      empresa_bdd_usuario: form.empresaBaseUsuarioForm,
      empresa_bdd_contrasena: form.empresaBaseContrasenaForm
    }

    this.GuardarDatos(datosBase);
  }

  GuardarDatos(datos: any) {
    this.restBase.InsertarBase(datos).subscribe(
      response => {
        if(response.message === 'ok'){
          this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
            timeOut: 6000,
          });
          
        }else{
          this.toastr.warning('Intente nuevamente.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
        }
        this.CerrarVentana();
      },
      error => {
        this.toastr.error('Ups!!! algo salio mal.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    );
  }
}
