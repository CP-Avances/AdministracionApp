import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

type EstadoLicencia = {
  nombre: string;
  estado: string;
};

type DatosActualizarLicencia = {
  id_empresa_licencia: number;
  fecha_activacion: string;
  fecha_desactivacion: string;
  estado: string;
  observacion: string | null;
};

@Component({
  selector: 'app-editar-licencia',
  templateUrl: './editar-licencia.component.html',
  styleUrl: './editar-licencia.component.css'
})
export class EditarLicenciaComponent implements OnInit {

  @Input() licencia: any;
  @Input() pagina: any;

  idBaseEmpresa!: number;
  idEmpresaLicencia!: number;

  estados: EstadoLicencia[] = [
    { nombre: 'Activa', estado: 'ACTIVA' },
    { nombre: 'Suspendida', estado: 'SUSPENDIDA' },
    { nombre: 'Vencida', estado: 'VENCIDA' },
    { nombre: 'Cancelada', estado: 'CANCELADA' },
    { nombre: 'Pendiente', estado: 'PENDIENTE' }
  ];

  licenciaFechaActivacionForm = new FormControl('', Validators.required);
  licenciaFechaDesactivacionForm = new FormControl('', Validators.required);
  licenciaEstadoForm = new FormControl('', Validators.required);
  licenciaObservacionForm = new FormControl('', Validators.maxLength(300));

  public LicenciaForm = new FormGroup({
    licenciaFechaActivacionForm: this.licenciaFechaActivacionForm,
    licenciaFechaDesactivacionForm: this.licenciaFechaDesactivacionForm,
    licenciaEstadoForm: this.licenciaEstadoForm,
    licenciaObservacionForm: this.licenciaObservacionForm
  });

  constructor(
    public componentev: VerEmpresaComponent,
    private readonly toastr: ToastrService,
    private readonly restLicencia: LicenciaService,
    public readonly validar: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.idEmpresaLicencia = this.licencia.id_licencia || this.licencia.id_empresa_licencia;
    this.InicializarValores();
  }

  InicializarValores(): void {
    this.licenciaFechaActivacionForm.setValue(this.licencia.fecha_activacion ?? '');
    this.licenciaFechaDesactivacionForm.setValue(this.licencia.fecha_desactivacion ?? '');
    this.licenciaEstadoForm.setValue(this.licencia.estado ?? '');
    this.licenciaObservacionForm.setValue(this.licencia.observacion ?? '');
  }

  ValidarDatosLicencia(): void {
    if (this.LicenciaForm.invalid) {
      this.LicenciaForm.markAllAsTouched();
      this.toastr.info('Verifique los datos ingresados.', '', {
        timeOut: 6000,
      });
      return;
    }

    this.ActualizarLicencia();
  }

  ActualizarLicencia(): void {
    const fechaActivacion = this.licenciaFechaActivacionForm.value;
    const fechaDesactivacion = this.licenciaFechaDesactivacionForm.value;
    const estado = this.licenciaEstadoForm.value;
    const observacion = this.licenciaObservacionForm.value;

    if (!fechaActivacion || !fechaDesactivacion || !estado) {
      this.toastr.info('Verifique los datos ingresados.', '', {
        timeOut: 6000,
      });
      return;
    }

    const datosLicencia: DatosActualizarLicencia = {
      id_empresa_licencia: this.idEmpresaLicencia,
      fecha_activacion: this.validar.FormatearFecha(fechaActivacion, 'YYYY-MM-DD', 'no'),
      fecha_desactivacion: this.validar.FormatearFecha(fechaDesactivacion, 'YYYY-MM-DD', 'no'),
      estado,
      observacion: observacion?.trim() || null
    };

    this.GuardarDatos(datosLicencia);
  }

  GuardarDatos(datos: DatosActualizarLicencia): void {
    this.restLicencia.ActualizarLicencia(datos).subscribe({
      next: (response) => {
        if (response.message === 'Registro actualizado.') {
          this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
            timeOut: 6000,
          });

          this.LimpiarCampos();
          this.Cancelar(2);
          return;
        }

        this.toastr.warning('Intente nuevamente.', 'Ups!!! algo salió mal.', {
          timeOut: 6000,
        });
      },
      error: () => {
        this.toastr.error('Ups!!! algo salió mal.', 'Ups!!! algo salió mal.', {
          timeOut: 6000,
        });
      }
    });
  }

  LimpiarCampos(): void {
    this.LicenciaForm.reset();
  }

  Cancelar(opcion: number): void {
    if (this.pagina === 'ver-empresa') {
      this.componentev.editar_licencia_ = true;
      this.componentev.modificar_licencia_ = false;

      if (opcion === 2) {
        this.componentev.LeerDatosIniciales();
      }
    }
  }
}