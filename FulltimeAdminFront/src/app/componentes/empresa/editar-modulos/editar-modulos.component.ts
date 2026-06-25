import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { VerEmpresaComponent } from '../ver-empresa/ver-empresa.component';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';

type Modulo = {
  id_modulo: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
};

type LicenciaModulo = {
  id_licencia_modulo?: number;
  id_licencia: number;
  id_modulo: number;
  activo: boolean;
};

type ModuloVista = Modulo & {
  id_licencia_modulo?: number;
  activo: boolean;
};

type GuardarLicenciaModulosPayload = {
  id_licencia: number;
  modulos: {
    id_modulo: number;
    activo: boolean;
  }[];
};

@Component({
  selector: 'app-editar-modulos',
  templateUrl: './editar-modulos.component.html',
  styleUrl: './editar-modulos.component.css'
})
export class EditarModulosComponent implements OnInit {

  @Input() modulos: number | string | null = null;
  @Input() licencia: number | string | null = null;
  @Input() pagina: string | null = null;

  ip: string | null = null;
  idLicencia = 0;
  idEmpresa = 0;

  modulosVista: ModuloVista[] = [];
  registrosActuales: LicenciaModulo[] = [];

  cargando = false;
  guardando = false;

  constructor(
    public componentev: VerEmpresaComponent,
    private readonly toastr: ToastrService,
    private readonly licenciaService: LicenciaService
  ) { }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.idEmpresa = Number(this.modulos);
    this.AsignarIdLicencia();

    if (!this.idEmpresa) {
      this.toastr.error('No se pudo identificar la empresa.', 'Error', {
        timeOut: 6000,
      });
      this.Cancelar(1);
      return;
    }

    this.CargarInformacionModulos();
  }

  private AsignarIdLicencia(): void {
    this.idLicencia = Number(this.licencia);

    if (!this.idLicencia) {
      this.toastr.error('No se pudo identificar la licencia.', 'Error', {
        timeOut: 6000,
      });
      this.Cancelar(1);
    }
  }

  private CargarInformacionModulos(): void {
    this.cargando = true;

    this.licenciaService.BuscarmodulosActivos(this.idEmpresa).subscribe({
      next: (modulosActivos: any) => {
        this.registrosActuales = Array.isArray(modulosActivos) ? modulosActivos : [];
        this.CargarCatalogoModulos();
      },
      error: () => {
        this.registrosActuales = [];
        this.CargarCatalogoModulos();
      }
    });
  }

  private CargarCatalogoModulos(): void {
    this.licenciaService.leerModulos().subscribe({
      next: (modulosCatalogo: Modulo[]) => {
        this.modulosVista = this.MapearModulosVista(modulosCatalogo);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.modulosVista = [];
        this.toastr.error('No se pudo cargar el catálogo de módulos.', 'Error', {
          timeOut: 6000,
        });
      }
    });
  }

  private MapearModulosVista(modulosCatalogo: Modulo[]): ModuloVista[] {
    return (modulosCatalogo ?? []).map((modulo) => {
      const registro = this.registrosActuales.find((item) =>
        Number(item.id_modulo) === Number(modulo.id_modulo)
      );

      return {
        ...modulo,
        id_licencia_modulo: registro?.id_licencia_modulo,
        activo: registro?.activo ?? false,
      };
    });
  }

  CambiarEstadoModulo(modulo: ModuloVista, event: MatCheckboxChange): void {
    modulo.activo = event.checked;
  }

  ValidarDatosModulos(): void {
    if (!this.idLicencia) {
      this.toastr.error('No se pudo identificar la licencia.', 'Error', {
        timeOut: 6000,
      });
      return;
    }

    if (this.modulosVista.length === 0) {
      this.toastr.warning('No existen módulos disponibles para actualizar.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.GuardarModulos();
  }

  private GuardarModulos(): void {
    const datos: GuardarLicenciaModulosPayload = {
      id_licencia: this.idLicencia,
      modulos: this.modulosVista.map((modulo) => ({
        id_modulo: modulo.id_modulo,
        activo: modulo.activo === true
      }))
    };

    this.guardando = true;

    this.licenciaService.registrarLicenciaModulos(datos).subscribe({
      next: (response) => {
        this.guardando = false;

        if (response.message === 'Registros actualizados.') {
          this.toastr.success('Operación exitosa.', 'Módulos actualizados.', {
            timeOut: 6000,
          });

          this.Cancelar(2);
          return;
        }

        this.toastr.warning('No se pudo confirmar la actualización.', 'Atención', {
          timeOut: 6000,
        });
      },
      error: (error) => {
        this.guardando = false;

        this.toastr.error(
          error?.error?.message ?? 'No se pudieron actualizar los módulos.',
          'Upss!!! algo salió mal.',
          { timeOut: 6000 }
        );
      }
    });
  }

  ObtenerIconoModulo(codigo: string): string {
    const iconos: Record<string, string> = {
      PERMISOS: 'assignment',
      VACACIONES: 'beach_access',
      HORAS_EXTRAS: 'schedule',
      HORA_EXTRA: 'schedule',
      GEOLOCALIZACION: 'location_on',
      GEOLOCALIZACIÓN: 'location_on',
      TIMBRE_WEB: 'fingerprint',
      TIMBRE_VIRTUAL: 'fingerprint',
      APP_MOVIL: 'phone_iphone',
      APLICACION_MOVIL: 'phone_iphone',
      APLICACIÓN_MÓVIL: 'phone_iphone',
      ACCION_PERSONAL: 'badge',
      ACCIÓN_PERSONAL: 'badge',
      ALIMENTACION: 'restaurant',
      ALIMENTACIÓN: 'restaurant'
    };

    return iconos[codigo?.toUpperCase()] ?? 'apps';
  }

  TrackByModulo(index: number, modulo: ModuloVista): number {
    return modulo.id_modulo || index;
  }

  Cancelar(opcion: number): void {
    if (this.pagina === 'ver-empresa') {
      this.componentev.editar_modulos_ = true;
      this.componentev.modificar_modulos_ = false;

      if (opcion === 2) {
        this.componentev.LeerDatosIniciales();
      }
    }
  }
}