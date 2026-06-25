import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConexionBaseDatosService } from 'src/app/servicios/conexion-base-datos/conexion-base-datos.service';

type DatosInicializarBase = {
  id_empresa: number;
  empresa_codigo: string;
  empresa_descripcion: string;
  nombre_base: string;
};

type HistorialInicializacionBd = {
  id_log: number;
  id_empresa: number;
  empresa_codigo: string;
  nombre_base: string;
  paso: string;
  archivo: string | null;
  exitoso: boolean;
  mensaje: string | null;
  usuario_registra: string | null;
  fecha_registro: string;
};

@Component({
  selector: 'app-inicializar-base',
  templateUrl: './inicializar-base.component.html',
  styleUrl: './inicializar-base.component.css'
})
export class InicializarBaseComponent implements OnInit {

  creandoBase = false;
  ejecutandoScripts = false;
  cargandoHistorial = false;

  scriptTablas: File | null = null;
  scriptVistas: File | null = null;
  scriptDatosIniciales: File | null = null;

  historial: HistorialInicializacionBd[] = [];

  columnasHistorial: string[] = [
    'fecha_registro',
    'paso',
    'archivo',
    'exitoso',
    'mensaje',
    'usuario_registra'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DatosInicializarBase,
    private readonly dialogRef: MatDialogRef<InicializarBaseComponent>,
    private readonly inicializacionBdService: ConexionBaseDatosService,
    private readonly toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.ObtenerHistorial();
  }

  CrearBaseDatos(): void {
    if (!this.data?.nombre_base) {
      this.toastr.warning('No se pudo identificar el nombre de la base.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.creandoBase = true;

    this.inicializacionBdService.CrearBaseDatos({
      id_empresa: Number(this.data.id_empresa),
      empresa_codigo: this.data.empresa_codigo,
      nombre_base: this.data.nombre_base,
      usuario_registra: this.ObtenerUsuarioRegistra()
    }).subscribe({
      next: (response) => {
        if (response?.message === 'Base de datos creada correctamente.') {
          this.toastr.success('Base de datos creada correctamente.', 'Operación exitosa', {
            timeOut: 6000,
          });

          this.ObtenerHistorial();
          return;
        }

        this.toastr.info(response?.message ?? 'Proceso finalizado.', 'Información', {
          timeOut: 6000,
        });
      },
      error: (error) => {
        this.toastr.error(
          error?.error?.message ?? 'No se pudo crear la base de datos.',
          'Upss!!! algo salió mal.',
          { timeOut: 6000 }
        );

        this.ObtenerHistorial();
      },
      complete: () => {
        this.creandoBase = false;
      }
    });
  }

  SeleccionarArchivo(event: Event, tipo: 'TABLAS' | 'VISTAS' | 'DATOS'): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    if (!archivo) {
      return;
    }

    if (!archivo.name.toLowerCase().endsWith('.sql')) {
      this.toastr.warning('Solo se permiten archivos .sql.', 'Archivo no válido', {
        timeOut: 6000,
      });
      input.value = '';
      return;
    }

    if (tipo === 'TABLAS') {
      this.scriptTablas = archivo;
    }

    if (tipo === 'VISTAS') {
      this.scriptVistas = archivo;
    }

    if (tipo === 'DATOS') {
      this.scriptDatosIniciales = archivo;
    }
  }

  EjecutarScripts(): void {
    if (!this.scriptTablas || !this.scriptVistas || !this.scriptDatosIniciales) {
      this.toastr.warning('Debe cargar los tres scripts: tablas, vistas y datos iniciales.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.ejecutandoScripts = true;

    this.inicializacionBdService.EjecutarScriptsInicializacion({
      id_empresa: Number(this.data.id_empresa),
      empresa_codigo: this.data.empresa_codigo,
      nombre_base: this.data.nombre_base,
      usuario_registra: this.ObtenerUsuarioRegistra(),
      script_tablas: this.scriptTablas,
      script_vistas: this.scriptVistas,
      script_datos_iniciales: this.scriptDatosIniciales
    }).subscribe({
      next: (response) => {
        if (response?.message === 'Scripts ejecutados correctamente.') {
          this.toastr.success('Scripts ejecutados correctamente.', 'Operación exitosa', {
            timeOut: 6000,
          });

          this.LimpiarArchivos();
          this.ObtenerHistorial();
          return;
        }

        this.toastr.info(response?.message ?? 'Proceso finalizado.', 'Información', {
          timeOut: 6000,
        });
      },
      error: (error) => {
        this.toastr.error(
          error?.error?.message ?? 'No se pudieron ejecutar los scripts.',
          'Upss!!! algo salió mal.',
          { timeOut: 8000 }
        );

        this.ObtenerHistorial();
      },
      complete: () => {
        this.ejecutandoScripts = false;
      }
    });
  }

  ObtenerHistorial(): void {
    if (!this.data?.id_empresa) {
      this.historial = [];
      return;
    }

    this.cargandoHistorial = true;

    this.inicializacionBdService.ObtenerHistorialInicializacion(
      Number(this.data.id_empresa)
    ).subscribe({
      next: (response) => {
        this.historial = Array.isArray(response) ? response : [];
      },
      error: () => {
        this.historial = [];
      },
      complete: () => {
        this.cargandoHistorial = false;
      }
    });
  }

  LimpiarArchivos(): void {
    this.scriptTablas = null;
    this.scriptVistas = null;
    this.scriptDatosIniciales = null;
  }

  Cerrar(refrescar: boolean = false): void {
    this.dialogRef.close(refrescar);
  }

  private ObtenerUsuarioRegistra(): string {
    return (
      localStorage.getItem('fullname') ||
      localStorage.getItem('usuario') ||
      localStorage.getItem('nombre') ||
      'SISTEMA'
    );
  }
}