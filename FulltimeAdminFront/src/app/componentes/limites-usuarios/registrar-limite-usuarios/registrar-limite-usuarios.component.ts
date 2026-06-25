import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';

type DatosLimiteLicencia = {
  id_licencia: number;
  usuarios_web_max: number;
  usuarios_app_max: number;
  relojes_max: number;
  storage_mb_max: number;
};

@Component({
  selector: 'app-registrar-limite-usuarios',
  templateUrl: './registrar-limite-usuarios.component.html',
  styleUrl: './registrar-limite-usuarios.component.css'
})
export class RegistrarLimiteUsuariosComponent {

  @Input() licencia!: number;
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

  ValidarDatos(): void {
    if (this.limiteForm.invalid) {
      this.limiteForm.markAllAsTouched();
      this.toastr.info('Verifique los límites ingresados.', '', {
        timeOut: 6000,
      });
      return;
    }

    if (!this.licencia) {
      this.toastr.error('No se pudo identificar la licencia.', 'Error', {
        timeOut: 6000,
      });
      return;
    }

    this.RegistrarLimite();
  }

  private RegistrarLimite(): void {
    const datos: DatosLimiteLicencia = {
      id_licencia: Number(this.licencia),
      usuarios_web_max: Number(this.usuariosWebForm.value ?? 0),
      usuarios_app_max: Number(this.usuariosAppForm.value ?? 0),
      relojes_max: Number(this.relojesForm.value ?? 0),
      storage_mb_max: Number(this.storageForm.value ?? 0)
    };

    this.guardando = true;

    this.licenciaService.RegistrarLicenciaLimite(datos).subscribe({
      next: (response) => {
        this.guardando = false;

        if (response.message === 'Registro guardado.') {
          this.toastr.success('Operación exitosa.', 'Límites registrados.', {
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
          error?.error?.message ?? 'No se pudieron registrar los límites.',
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