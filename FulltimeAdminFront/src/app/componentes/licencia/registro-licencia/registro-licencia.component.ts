import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

type DatosLicencia = {
  id_empresa: number;
  fecha_activacion: string;
  fecha_desactivacion: string;
  observacion: string | null;
};

@Component({
  selector: 'app-registro-licencia',
  templateUrl: './registro-licencia.component.html',
  styleUrl: './registro-licencia.component.css'
})
export class RegistroLicenciaComponent {

  empresaLicenciaFechaActivacionForm = new FormControl('', Validators.required);
  empresaLicenciaFechaDesactivacionForm = new FormControl('', Validators.required);
  empresaLicenciaObservacionForm = new FormControl('', Validators.maxLength(300));

  public formulario = new FormGroup({
    empresaLicenciaFechaActivacionForm: this.empresaLicenciaFechaActivacionForm,
    empresaLicenciaFechaDesactivacionForm: this.empresaLicenciaFechaDesactivacionForm,
    empresaLicenciaObservacionForm: this.empresaLicenciaObservacionForm
  });

  constructor(
    public ventana: MatDialogRef<RegistroLicenciaComponent>,
    private readonly toastr: ToastrService,
    private readonly restLicencia: LicenciaService,
    public readonly validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public datoEmpresa: number
  ) { }

  CerrarVentana(): void {
    this.LimpiarCampos();
    this.ventana.close();
  }

  LimpiarCampos(): void {
    this.formulario.reset();
  }

  ValidarDatosLicencia(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.InsertarLicencia();
  }

  InsertarLicencia(): void {
    const fechaActivacion = this.empresaLicenciaFechaActivacionForm.value;
    const fechaDesactivacion = this.empresaLicenciaFechaDesactivacionForm.value;
    const observacion = this.empresaLicenciaObservacionForm.value;

    if (!fechaActivacion || !fechaDesactivacion) {
      this.toastr.warning('Debe ingresar las fechas de la licencia.', 'Datos incompletos', {
        timeOut: 6000,
      });
      return;
    }

    const datosBase: DatosLicencia = {
      id_empresa: this.datoEmpresa,
      fecha_activacion: this.validar.FormatearFecha(fechaActivacion, 'YYYY-MM-DD', 'no'),
      fecha_desactivacion: this.validar.FormatearFecha(fechaDesactivacion, 'YYYY-MM-DD', 'no'),
      observacion: observacion?.trim() || null
    };

    this.GuardarDatos(datosBase);
  }

  GuardarDatos(datos: DatosLicencia): void {
    this.restLicencia.InsertarLicencia(datos).subscribe({
      next: (response) => {
        if (response.message === 'ok') {
          this.toastr.success('Operación exitosa.', 'Registro ingresado.', {
            timeOut: 6000,
          });
        } else {
          this.toastr.warning('Intente nuevamente.', 'Ups!!! algo salió mal.', {
            timeOut: 6000,
          });
        }

        this.CerrarVentana();
      },
      error: () => {
        this.toastr.error('Ups!!! algo salió mal.', 'Ups!!! algo salió mal.', {
          timeOut: 6000,
        });
      }
    });
  }
}