import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';
import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';

type ZonaHoraria = {
  formato_nombre: string;
  nombre_general: string;
};

type EstadoEmpresa = {
  nombre: string;
  estado: boolean;
};

type EmpresaData = {
  empresa_id: number;
  empresa_codigo: string;
  empresa_descripcion: string;
  zona_horaria: string;
  estado: boolean;
  instalacion: string;
};

type EmpresaForm = {
  empresaCodigoForm: string;
  empresaDescripcionForm: string;
  empresaZonaHorariaForm: string;
  empresaEstadoForm: boolean;
  empresaInstalacionForm: string;
};

@Component({
  selector: 'app-editar-empresa',
  templateUrl: './editar-empresa.component.html',
  styleUrl: './editar-empresa.component.css'
})

export class EditarEmpresaComponent implements OnInit {

  isLinear = true;
  primeroFormGroup!: FormGroup;

  idEmpresa!: number;

  empleado_inicia!: number;
  ip: string | null = null;
  escritura = false;

  zonas: ZonaHoraria[] = [];
  zonasFiltradas!: Observable<ZonaHoraria[]>;

  estados: EstadoEmpresa[] = [
    { nombre: 'Activo', estado: true },
    { nombre: 'Inactivo', estado: false }
  ];

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly toastr: ToastrService,
    public readonly router: Router,
    public readonly ventana: MatDialogRef<EditarEmpresaComponent>,
    public readonly validar: ValidacionesService,
    private readonly restEmpresa: RegistroEmpresaService,
    private readonly zona: ListaEmpresasService,
    @Inject(MAT_DIALOG_DATA) public empresa: EmpresaData[]
  ) { }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.VerificarFormulario();
    this.AsignarIdEmpresa();
    this.GetZonaHorarias();
  }

  VerificarFormulario(): void {
    this.primeroFormGroup = this._formBuilder.group({
      empresaCodigoForm: [''],
      empresaDescripcionForm: [''],
      empresaZonaHorariaForm: [''],
      empresaEstadoForm: [''],
      empresaInstalacionForm: [''],
    });

    this.ConfigurarFiltroZonas();
  }

  private AsignarIdEmpresa(): void {
    const empresaActual = this.ObtenerEmpresaActual();

    if (!empresaActual) {
      this.toastr.error('No se recibió información de la empresa.', 'Error', {
        timeOut: 6000,
      });
      this.Cancelar();
      return;
    }

    this.idEmpresa = empresaActual.empresa_id;
  }

  private ObtenerEmpresaActual(): EmpresaData | null {
    if (!Array.isArray(this.empresa) || this.empresa.length === 0) {
      return null;
    }

    return this.empresa[0];
  }

  private ConfigurarFiltroZonas(): void {
    const zonaControl = this.primeroFormGroup.get('empresaZonaHorariaForm');

    this.zonasFiltradas = zonaControl
      ? zonaControl.valueChanges.pipe(
        startWith(''),
        map((valor: string | null) => this.FiltrarZonas(valor ?? ''))
      )
      : of([]);
  }

  private FiltrarZonas(valor: string): ZonaHoraria[] {
    const filtro = valor.toLowerCase().trim();

    if (!filtro) {
      return this.zonas;
    }

    return this.zonas.filter((zona) =>
      zona.nombre_general.toLowerCase().includes(filtro)
    );
  }

  private RefrescarFiltroZonas(): void {
    const control = this.primeroFormGroup.get('empresaZonaHorariaForm');
    const valorActual = control?.value ?? '';

    control?.setValue(valorActual);
  }

  // METODO PARA LISTAR ZONAS HORARIAS
  GetZonaHorarias(): void {
    this.zona.ObtenerInformacionZonasHorarios().subscribe({
      next: (datos: ZonaHoraria[]) => {
        this.zonas = Array.isArray(datos) ? datos : [];
        this.ObtenerEmpresa();
        this.RefrescarFiltroZonas();
      },
      error: () => {
        this.zonas = [];
        this.toastr.error('No se pudo cargar la lista de zonas horarias.', 'Error', {
          timeOut: 6000,
        });
      }
    });
  }

  ObtenerEmpresa(): void {
    const empresaActual = this.ObtenerEmpresaActual();

    if (!empresaActual) {
      this.toastr.error('No se recibió información de la empresa.', 'Error', {
        timeOut: 6000,
      });
      this.Cancelar();
      return;
    }

    const zonaSeleccionada = this.zonas.find((zona) =>
      zona.formato_nombre === empresaActual.zona_horaria ||
      zona.nombre_general === empresaActual.zona_horaria
    );

    this.primeroFormGroup.setValue({
      empresaCodigoForm: empresaActual.empresa_codigo ?? '',
      empresaDescripcionForm: empresaActual.empresa_descripcion ?? '',
      empresaZonaHorariaForm: zonaSeleccionada?.nombre_general ?? empresaActual.zona_horaria ?? '',
      empresaEstadoForm: empresaActual.estado,
      empresaInstalacionForm: empresaActual.instalacion ?? ''
    });
  }

  ActualizarEmpresa(form1: EmpresaForm): void {
    const zonaHoraria = this.ObtenerNombreZonaHoraria(form1.empresaZonaHorariaForm);

    const empresaActualizada = {
      empresa_id: this.idEmpresa,
      empresa_codigo: form1.empresaCodigoForm.trim(),
      empresa_descripcion: form1.empresaDescripcionForm.trim(),
      zona_horaria: zonaHoraria,
      estado: form1.empresaEstadoForm,
      instalacion: form1.empresaInstalacionForm,
    };

    this.restEmpresa.ActualizarEmpresaFormUno(empresaActualizada).subscribe({
      next: (response: any) => this.ProcesarRespuestaActualizacion(response),
      error: (error: { error?: { message?: string } }) => {
        this.toastr.error(
          error.error?.message ?? 'No se pudo actualizar la empresa.',
          'Upss!!! algo salió mal.',
          { timeOut: 6000 }
        );
      }
    });
  }

  private ProcesarRespuestaActualizacion(response: any): void {
    if (response.message !== 'Registro actualizado.') {
      this.toastr.warning('No se pudo confirmar la actualización.', 'Atención', {
        timeOut: 6000,
      });
      return;
    }

    this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
      timeOut: 6000,
    });

    this.LimpiarCampos();
  }

  private ObtenerNombreZonaHoraria(zona: string): string {
    const [nombre] = zona.split(' (');
    return nombre.trim();
  }

  // METODO PARA CERRAR VENTANA
  Cancelar(): void {
    this.ventana.close(false);
  }

  LimpiarCampos(): void {
    this.primeroFormGroup.reset();
    this.ventana.close(true);
  }

  IngresarSoloLetras(evt: any) {
    return this.validar.IngresarSoloLetras(evt);
  }

  IngresarSoloNumeros(evt: KeyboardEvent): boolean {
    return this.validar.IngresarSoloNumeros(evt);
  }
}