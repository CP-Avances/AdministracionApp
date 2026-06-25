import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

type ZonaHoraria = {
  id?: number;
  nombre_general: string;
};

type RegistroEmpresaForm = {
  empresaRegistroDescripcionForm: string;
  empresaRegistroCodigoForm: string;
  empresaZonaHorariaForm: string;
  empresaInstalacionForm: string;
};

@Component({
  selector: 'app-registro-empresa',
  templateUrl: './registro-empresa.component.html',
  styleUrl: './registro-empresa.component.css'
})
export class RegistroEmpresaComponent implements OnInit {

  isLinear = true;
  primeroFormGroup!: FormGroup;

  zonas: ZonaHoraria[] = [];
  zonasFiltradas!: Observable<ZonaHoraria[]>;

  constructor(
    private readonly toastr: ToastrService,
    private readonly formBuilder: FormBuilder,
    public readonly ventana: MatDialog,
    private readonly restEmpresa: RegistroEmpresaService,
    private readonly zonaService: ListaEmpresasService,
    private readonly router: Router,
    private readonly validar: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.asignarFormulario();
    this.configurarFiltroZonas();
    this.obtenerZonasHorarias();
  }

  private asignarFormulario(): void {
    this.primeroFormGroup = this.formBuilder.group({
      empresaRegistroDescripcionForm: ['', Validators.required],
      empresaRegistroCodigoForm: ['', Validators.required],
      empresaZonaHorariaForm: ['', Validators.required],
      empresaInstalacionForm: ['', Validators.required]
    });
  }

  private configurarFiltroZonas(): void {
    const zonaControl = this.primeroFormGroup.get('empresaZonaHorariaForm');

    this.zonasFiltradas = zonaControl
      ? zonaControl.valueChanges.pipe(
          startWith(''),
          map((valor: string | null) => this.filtrarZonas(valor ?? ''))
        )
      : of([]);
  }

  private filtrarZonas(valor: string): ZonaHoraria[] {
    const filtro = valor.toLowerCase().trim();

    if (!filtro) {
      return this.zonas;
    }

    return this.zonas.filter((zona) =>
      zona.nombre_general.toLowerCase().includes(filtro)
    );
  }

  private obtenerZonasHorarias(): void {
    this.zonaService.ObtenerInformacionZonasHorarios().subscribe({
      next: (datos: ZonaHoraria[]) => {
        this.zonas = datos ?? [];
        this.refrescarFiltroZonas();
      },
      error: () => {
        this.zonas = [];
        this.toastr.error('No se pudo cargar la lista de zonas horarias.', 'Error');
      }
    });
  }

  private refrescarFiltroZonas(): void {
    const valorActual = this.primeroFormGroup.get('empresaZonaHorariaForm')?.value ?? '';
    this.primeroFormGroup.get('empresaZonaHorariaForm')?.setValue(valorActual);
  }

  insertarEmpresa(): void {
    if (this.primeroFormGroup.invalid) {
      this.primeroFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.primeroFormGroup.value as RegistroEmpresaForm;
    const zonaHoraria = this.obtenerNombreZonaHoraria(formValue.empresaZonaHorariaForm);

    const datosEmpresaNueva = {
      empresa_codigo: formValue.empresaRegistroCodigoForm.trim(),
      empresa_descripcion: formValue.empresaRegistroDescripcionForm.trim(),
      instalacion: formValue.empresaInstalacionForm,
      zona_horaria: zonaHoraria
    };

    this.restEmpresa.RegistrarEmpresa(datosEmpresaNueva).subscribe({
      next: (response) => this.procesarRespuestaRegistro(response),
      error: (error) => {
        this.toastr.error(String(error), 'Upss!!! algo salió mal.', {
          timeOut: 6000
        });
      }
    });
  }

  private obtenerNombreZonaHoraria(zona: string): string {
    const [nombre] = zona.split(' (');
    return nombre.trim();
  }

  private procesarRespuestaRegistro(response: { message: string }): void {
    if (response.message !== 'ok') {
      this.toastr.warning('No se pudo confirmar el registro de la empresa.', 'Atención', {
        timeOut: 6000
      });
      return;
    }

    this.toastr.success('Operación exitosa.', 'Registro guardado.', {
      timeOut: 6000
    });

    this.limpiarCampos();
    this.verDatos();
  }

  limpiarCampos(): void {
    this.primeroFormGroup.reset();
  }

  verDatos(): void {
    this.router.navigate(['/empresas']);
  }

  ingresarSoloNumerosEnteros(evt: KeyboardEvent): boolean {
    return this.validar.IngresarSoloNumeros(evt);
  }
}