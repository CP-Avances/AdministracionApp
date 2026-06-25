import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

type StorageUso = {
  id_storage_uso?: number;
  id_licencia: number;
  storage_mb_usado: number;
  origen_calculo: string;
  fecha_registro: string;
  calculo_exitoso: boolean;
  mensaje_error: string | null;
  observacion: string | null;
};

type DatosGuardarStorage = {
  id_licencia: number;
  storage_mb_usado: number;
  origen_calculo: string;
  fecha_registro?: string | null;
  calculo_exitoso: boolean;
  mensaje_error?: string | null;
  observacion?: string | null;
};

@Component({
  selector: 'app-registrar-storage-uso',
  templateUrl: './registrar-storage-uso.component.html',
  styleUrl: './registrar-storage-uso.component.css'
})
export class RegistrarStorageUsoComponent implements OnInit {

  @Input() licencia!: number;
  @Input() storage: StorageUso | null = null;
  @Input() pagina: string | null = null;
  @Input() codigoEmpresa: string | null = null;

  origenesCalculo = [
    { nombre: 'Manual', valor: 'MANUAL' },
    { nombre: 'Automático', valor: 'AUTOMATICO' },
    { nombre: 'Importado', valor: 'IMPORTADO' }
  ];

  storageMbUsadoForm = new FormControl(0, [Validators.required, Validators.min(0)]);
  origenCalculoForm = new FormControl('MANUAL', Validators.required);
  fechaRegistroForm = new FormControl('', Validators.required);
  calculoExitosoForm = new FormControl(true, Validators.required);
  mensajeErrorForm = new FormControl('', Validators.maxLength(300));
  observacionForm = new FormControl('', Validators.maxLength(300));

  storageForm = new FormGroup({
    storageMbUsadoForm: this.storageMbUsadoForm,
    origenCalculoForm: this.origenCalculoForm,
    fechaRegistroForm: this.fechaRegistroForm,
    calculoExitosoForm: this.calculoExitosoForm,
    mensajeErrorForm: this.mensajeErrorForm,
    observacionForm: this.observacionForm
  });

  guardando = false;
  calculandoStorage = false;

  constructor(
    public componentev: VerEmpresaComponent,
    private readonly toastr: ToastrService,
    private readonly licenciaService: LicenciaService,
    public readonly validar: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.InicializarFormulario();
  }

  private InicializarFormulario(): void {
    if (!this.storage) {
      this.fechaRegistroForm.setValue(this.ObtenerFechaActual());
      return;
    }

    this.storageMbUsadoForm.setValue(Number(this.storage.storage_mb_usado ?? 0));
    this.origenCalculoForm.setValue(this.storage.origen_calculo ?? 'MANUAL');
    this.fechaRegistroForm.setValue(this.storage.fecha_registro ?? this.ObtenerFechaActual());
    this.calculoExitosoForm.setValue(this.storage.calculo_exitoso ?? true);
    this.mensajeErrorForm.setValue(this.storage.mensaje_error ?? '');
    this.observacionForm.setValue(this.storage.observacion ?? '');
  }

  private ObtenerFechaActual(): string {
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  ValidarDatos(): void {
    if (this.storageForm.invalid) {
      this.storageForm.markAllAsTouched();
      this.toastr.info('Verifique los datos ingresados.', '', {
        timeOut: 6000,
      });
      return;
    }

    const idLicencia = this.storage?.id_licencia ?? this.licencia;

    if (!idLicencia) {
      this.toastr.error('No se pudo identificar la licencia.', 'Error', {
        timeOut: 6000,
      });
      return;
    }

    this.GuardarStorage(idLicencia);
  }

  private GuardarStorage(idLicencia: number): void {
    const fechaRegistro = this.fechaRegistroForm.value;

    const datos: DatosGuardarStorage = {
      id_licencia: Number(idLicencia),
      storage_mb_usado: Number(this.storageMbUsadoForm.value ?? 0),
      origen_calculo: this.origenCalculoForm.value ?? 'MANUAL',
      fecha_registro: fechaRegistro
        ? this.validar.FormatearFecha(fechaRegistro, 'YYYY-MM-DD', 'no')
        : null,
      calculo_exitoso: this.calculoExitosoForm.value === true,
      mensaje_error: this.mensajeErrorForm.value?.trim() || null,
      observacion: this.observacionForm.value?.trim() || null
    };

    this.guardando = true;

    this.licenciaService.GuardarLicenciaStorageUso(datos).subscribe({
      next: (response) => {
        this.guardando = false;

        if (response.message === 'Registro actualizado.') {
          this.toastr.success('Operación exitosa.', 'Storage actualizado.', {
            timeOut: 6000,
          });

          this.Cancelar(true);
          return;
        }

        this.toastr.warning('No se pudo confirmar el registro.', 'Atención', {
          timeOut: 6000,
        });
      },
      error: (error) => {
        this.guardando = false;

        this.toastr.error(
          error?.error?.message ?? 'No se pudo guardar el storage.',
          'Upss!!! algo salió mal.',
          { timeOut: 6000 }
        );
      }
    });
  }

  CalcularStorageEmpresa(): void {
    const codigoEmpresa = String(this.codigoEmpresa ?? '').trim();

    if (!codigoEmpresa) {
      this.toastr.warning('No se pudo identificar el código de empresa.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.calculandoStorage = true;

    this.licenciaService.CalcularStorageEmpresa(codigoEmpresa).subscribe({
      next: (response) => {
        const storageCalculado = Number(response?.data?.storage_mb_usado ?? 0);

        this.storageMbUsadoForm.setValue(storageCalculado);
        this.origenCalculoForm.setValue('MANUAL');
        this.calculoExitosoForm.setValue(true);
        this.mensajeErrorForm.setValue('');

        this.toastr.success('Storage calculado correctamente.', 'Cálculo exitoso', {
          timeOut: 6000,
        });
      },
      error: (error) => {
        this.toastr.error(
          error?.error?.message ?? 'No se pudo calcular el almacenamiento.',
          'Upss!!! algo salió mal.',
          { timeOut: 6000 }
        );
      },
      complete: () => {
        this.calculandoStorage = false;
      }
    });
  }

  Cancelar(refrescar: boolean): void {
    if (this.pagina === 'ver-empresa') {
      this.componentev.CerrarFormularioStorage(refrescar);
    }
  }
}