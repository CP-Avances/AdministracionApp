import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';

type MovimientoLicencia = {
  id_licencia_movimiento: number;
  id_licencia: number;
  id_empresa: number;
  empresa_descripcion: string;
  empresa_codigo: string;
  estado_licencia: string;
  tipo_movimiento: string;
  entidad_afectada: string;
  campo_modificado: string | null;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  fecha_movimiento: string;
  usuario_registra: string | null;
  observacion: string | null;
};

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent {

  movimientos: MovimientoLicencia[] = [];
  cargando = false;
  busquedaRealizada = false;

  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 20];

  entidadesMovimiento = [
    { valor: '', nombre: 'Todas' },
    { valor: 'licencia', nombre: 'Licencia' },
    { valor: 'licencia_limite', nombre: 'Límites' },
    { valor: 'licencia_modulo', nombre: 'Módulos' }
  ];

  tiposMovimiento = [
    { valor: '', nombre: 'Todos' },
    { valor: 'REGISTRO_LICENCIA', nombre: 'Registro de licencia' },
    { valor: 'ACTUALIZACION_LICENCIA', nombre: 'Actualización de licencia' },
    { valor: 'REGISTRO_LIMITE', nombre: 'Registro de límites' },
    { valor: 'ACTUALIZACION_LIMITE', nombre: 'Actualización de límites' },
    { valor: 'REGISTRO_MODULO', nombre: 'Registro de módulo' },
    { valor: 'ACTUALIZACION_MODULO', nombre: 'Actualización de módulo' }
  ];

  idEmpresaForm = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1)
  ]);

  fechaInicioForm = new FormControl<string | null>(null);
  fechaFinForm = new FormControl<string | null>(null);
  idLicenciaForm = new FormControl<number | null>(null);
  entidadAfectadaForm = new FormControl<string>('');
  tipoMovimientoForm = new FormControl<string>('');
  usuarioRegistraForm = new FormControl<string>('');
  campoModificadoForm = new FormControl<string>('');

  filtroForm = new FormGroup({
    idEmpresaForm: this.idEmpresaForm,
    fechaInicioForm: this.fechaInicioForm,
    fechaFinForm: this.fechaFinForm,
    idLicenciaForm: this.idLicenciaForm,
    entidadAfectadaForm: this.entidadAfectadaForm,
    tipoMovimientoForm: this.tipoMovimientoForm,
    usuarioRegistraForm: this.usuarioRegistraForm,
    campoModificadoForm: this.campoModificadoForm
  });

  get movimientosPaginados(): MovimientoLicencia[] {
    const inicio = this.pageIndex * this.pageSize;
    const fin = inicio + this.pageSize;

    return this.movimientos.slice(inicio, fin);
  }

  constructor(
    private readonly licenciaService: LicenciaService,
    private readonly toastr: ToastrService
  ) { }

  BuscarMovimientos(): void {
    if (this.idEmpresaForm.invalid) {
      this.idEmpresaForm.markAsTouched();
      this.toastr.info('Ingrese un ID de empresa válido.', '', {
        timeOut: 6000
      });
      return;
    }

    const fechaInicio = this.fechaInicioForm.value;
    const fechaFin = this.fechaFinForm.value;

    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      this.toastr.warning('La fecha inicio no puede ser mayor a la fecha fin.', 'Atención', {
        timeOut: 6000
      });
      return;
    }

    const idEmpresa = Number(this.idEmpresaForm.value);

    const filtros = {
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null,
      id_licencia: this.idLicenciaForm.value || null,
      entidad_afectada: this.entidadAfectadaForm.value || null,
      tipo_movimiento: this.tipoMovimientoForm.value || null,
      usuario_registra: this.usuarioRegistraForm.value?.trim() || null,
      campo_modificado: this.campoModificadoForm.value?.trim() || null
    };

    this.cargando = true;
    this.busquedaRealizada = true;
    this.pageIndex = 0;
    this.movimientos = [];

    this.licenciaService.BuscarMovimientosLicencia(idEmpresa, filtros).subscribe({
      next: (res: unknown) => {
        this.movimientos = Array.isArray(res) ? res as MovimientoLicencia[] : [];
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.movimientos = [];

        this.toastr.error(
          error?.error?.message ?? 'No se pudo consultar el historial.',
          'Upss!!! algo salió mal.',
          { timeOut: 6000 }
        );
      }
    });
  }

  LimpiarFiltros(): void {
    const idEmpresaActual = this.idEmpresaForm.value;

    this.filtroForm.reset({
      idEmpresaForm: idEmpresaActual,
      fechaInicioForm: null,
      fechaFinForm: null,
      idLicenciaForm: null,
      entidadAfectadaForm: '',
      tipoMovimientoForm: '',
      usuarioRegistraForm: '',
      campoModificadoForm: ''
    });

    this.movimientos = [];
    this.busquedaRealizada = false;
    this.pageIndex = 0;
  }

  ManejarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  TrackByMovimiento(index: number, movimiento: MovimientoLicencia): number {
    return movimiento.id_licencia_movimiento || index;
  }

  ObtenerIconoMovimiento(tipoMovimiento: string): string {
    const iconos: Record<string, string> = {
      REGISTRO_LICENCIA: 'workspace_premium',
      ACTUALIZACION_LICENCIA: 'edit_note',
      REGISTRO_LIMITE: 'manage_accounts',
      ACTUALIZACION_LIMITE: 'manage_accounts',
      REGISTRO_MODULO: 'apps',
      ACTUALIZACION_MODULO: 'published_with_changes'
    };

    return iconos[tipoMovimiento] ?? 'manage_history';
  }

  ObtenerNombreEntidad(entidad: string): string {
    const entidades: Record<string, string> = {
      licencia: 'Licencia',
      licencia_limite: 'Límites',
      licencia_modulo: 'Módulos'
    };

    return entidades[entidad] ?? entidad;
  }

  ObtenerClaseMovimiento(tipoMovimiento: string): string {
    if (tipoMovimiento.startsWith('REGISTRO')) {
      return 'movimiento-registro';
    }

    if (tipoMovimiento.startsWith('ACTUALIZACION')) {
      return 'movimiento-actualizacion';
    }

    return 'movimiento-general';
  }

  FormatearValorHistorial(valor: string | null): string {
    if (!valor) {
      return 'Sin valor';
    }

    if (this.EsFecha(valor)) {
      return this.FormatearFechaEspanol(valor);
    }

    return valor;
  }

  private EsFecha(valor: string): boolean {
    const fecha = new Date(valor);

    return !isNaN(fecha.getTime()) &&
      (
        valor.includes('GMT') ||
        valor.includes('T') ||
        /^\d{4}-\d{2}-\d{2}/.test(valor)
      );
  }

  private FormatearFechaEspanol(valor: string): string {
    const fecha = new Date(valor);

    return new Intl.DateTimeFormat('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    }).format(fecha);
  }
}