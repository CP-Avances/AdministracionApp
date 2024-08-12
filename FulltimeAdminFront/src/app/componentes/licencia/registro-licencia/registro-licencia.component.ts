import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-registro-licencia',
  templateUrl: './registro-licencia.component.html',
  styleUrl: './registro-licencia.component.css'
})
export class RegistroLicenciaComponent implements OnInit {
  
  ip: string | null;

  empresaLicenciaFechaActivacionForm = new FormControl('', Validators.required);
  empresaLicenciaFechaDesactivacionForm = new FormControl('', Validators.required);
  
  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    empresaLicenciaFechaActivacionForm: this.empresaLicenciaFechaActivacionForm,
    empresaLicenciaFechaDesactivacionForm: this.empresaLicenciaFechaDesactivacionForm
  })

  constructor(
    public ventana: MatDialogRef<RegistroLicenciaComponent>,
    private toastr: ToastrService,
    private restLicencia: LicenciaService,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public datoEmpresa: any
  ){ }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
  }

  // CERRAR VENTANA DE REGISTRO DE CONTRATO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  LimpiarCampos() {
    this.formulario.reset();
  }

  ValidarDatosLicencia(form: any) {
    this.InsertarLicencia(form);
  }

  InsertarLicencia(form: any) {
    let datosBase = {
      id_empresa_bdd: this.datoEmpresa,
      fecha_activacion: this.validar.FormatearFecha(form.empresaLicenciaFechaActivacionForm, 'YYYY-MM-DD', 'no'),
      fecha_desactivacion: this.validar.FormatearFecha(form.empresaLicenciaFechaDesactivacionForm, 'YYYY-MM-DD', 'no'),
    }
    
    this.GuardarDatos(datosBase);
  }

  GuardarDatos(datos: any) {
    this.restLicencia.InsertarLicencia(datos).subscribe(
      response => {
        if(response.message === 'ok') {
          this.toastr.success('Operación exitosa.', 'Registro ingresado.', {
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
        console.log(error);
        this.toastr.error('Ups!!! algo salio mal.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    );
  }

}
