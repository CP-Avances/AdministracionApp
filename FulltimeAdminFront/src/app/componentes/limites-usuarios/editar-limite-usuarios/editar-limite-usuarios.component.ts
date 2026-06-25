import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';

type LicenciaLimite = {
  id_licencia_limite: number;
  id_licencia: number;
  usuarios_web_max: number;
  usuarios_app_max: number;
  relojes_max: number;
  storage_mb_max: number;
};

type DatosActualizarLimite = {
  id_licencia_limite: number;
  id_licencia: number;
  usuarios_web_max: number;
  usuarios_app_max: number;
  relojes_max: number;
  storage_mb_max: number;
};

@Component({
  selector: 'app-editar-limite-usuarios',
  templateUrl: './editar-limite-usuarios.component.html',
  styleUrl: './editar-limite-usuarios.component.css'
})
export class EditarLimiteUsuariosComponent implements OnInit {

  @Input() limite: LicenciaLimite | null = null;
  @Input() pagina: string | null = null;

  usuariosWebForm = new FormControl(0, [Validators.required, Validators.min(0)]);
  usuariosAppForm = new FormControl(0, [Validators.required, Validators.min(0)]);
  relojesForm = new FormControl(0, [Validators.required, Validators.min(0)]);
  storageForm = new FormControl(0, [Validators.required, Validators.min(0)]);

  limiteForm = new FormGroup({
    usuariosWebForm: this.usuariosWebForm,
    usuariosAppForm: this.usuariosAppForm,
    relojesForm: this.relojesForm,
    storageForm: this.storageForm
  });

  guardando = false;

  constructor(
    public componentev: VerEmpresaComponent,
    private readonly toastr: ToastrService,
    private readonly licenciaService: LicenciaService
  ) { }

  ngOnInit(): void {
    this.InicializarValores();
  }

  private InicializarValores(): void {
    if (!this.limite) {
      this.toastr.error('No se recibió información de los límites.', 'Error', {
        timeOut: 6000,
      });
      this.Cancelar(false);
      return;
    }

    this.usuariosWebForm.setValue(Number(this.limite.usuarios_web_max ?? 0));
    this.usuariosAppForm.setValue(Number(this.limite.usuarios_app_max ?? 0));
    this.relojesForm.setValue(Number(this.limite.relojes_max ?? 0));
    this.storageForm.setValue(Number(this.limite.storage_mb_max ?? 0));
  }

  ValidarDatos(): void {
    if (this.limiteForm.invalid) {
      this.limiteForm.markAllAsTouched();
      this.toastr.info('Verifique los límites ingresados.', '', {
        timeOut: 6000,
      });
      return;
    }

    if (!this.limite) {
      this.toastr.error('No se pudo identificar el registro de límites.', 'Error', {
        timeOut: 6000,
      });
      return;
    }

    this.ActualizarLimite();
  }

  private ActualizarLimite(): void {
    if (!this.limite) {
      return;
    }

    const datos: DatosActualizarLimite = {
      id_licencia_limite: this.limite.id_licencia_limite,
      id_licencia: this.limite.id_licencia,
      usuarios_web_max: Number(this.usuariosWebForm.value ?? 0),
      usuarios_app_max: Number(this.usuariosAppForm.value ?? 0),
      relojes_max: Number(this.relojesForm.value ?? 0),
      storage_mb_max: Number(this.storageForm.value ?? 0)
    };

    this.guardando = true;

    this.licenciaService.ActualizarLicenciaLimite(datos).subscribe({
      next: (response) => {
        this.guardando = false;

        if (response.message === 'Registro actualizado.') {
          this.toastr.success('Operación exitosa.', 'Límites actualizados.', {
            timeOut: 6000,
          });

          this.Cancelar(true);
          return;
        }

        this.toastr.warning('No se pudo confirmar la actualización.', 'Atención', {
          timeOut: 6000,
        });
      },
      error: (error) => {
        this.guardando = false;

        this.toastr.error(
          error?.error?.message ?? 'No se pudieron actualizar los límites.',
          'Upss!!! algo salió mal.',
          { timeOut: 6000 }
        );
      }
    });
  }

  Cancelar(refrescar: boolean): void {
    if (this.pagina === 'ver-empresa') {
      this.componentev.CerrarFormularioLimites(refrescar);
    }
  }
}