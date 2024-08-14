import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-registro-empresa',
  templateUrl: './registro-empresa.component.html',
  styleUrl: './registro-empresa.component.css'
})
export class RegistroEmpresaComponent implements OnInit {

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  ip: string | null;

  constructor(
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    public ventana: MatDialog,
    private restEmpresa: RegistroEmpresaService,
    private router: Router,
    private validar: ValidacionesService
  ){ }

  ngOnInit(): void {
    this.AsignarFormulario();
  }

  AsignarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      empresaRegistroDescripcionForm: [''],
      empresaRegistroCodigoForm: [''],
      empresaRegistroDireccionForm: [''],
      empresaNumeroRelojesForm: ['']
    });
    this.segundoFormGroup = this._formBuilder.group({
      empresaRegistroModuloPermisosForm: [false],
      empresaRegistroModuloVacacionesForm: [false],
      empresaRegistroModuloHorasExtraForm: [false],
      empresaRegistroModuloGeolocalizacionForm: [false],
      empresaRegistroModuloTimbreVirtualForm: [false],
      empresaRegistroModuloAplicacionMovilForm: [false],
      empresaRegistroModuloAccionesPersonalForm: [false],
      empresaRegistroModuloAlimentacionForm: [false]
    });
  }

  // METODO PARA REGISTRAR EMPRESA
  InsertarEmpresa(form1: any, form2: any) {
    let datosEmpresaNueva = {
      empresa_codigo: form1.empresaRegistroCodigoForm,
      empresa_direccion: form1.empresaRegistroDireccionForm,
      empresa_descripcion: form1.empresaRegistroDescripcionForm,
      numero_relojes: form1.empresaNumeroRelojesForm,
      hora_extra: form2.empresaRegistroModuloHorasExtraForm,
      accion_personal: form2.empresaRegistroModuloAccionesPersonalForm,
      alimentacion: form2.empresaRegistroModuloAlimentacionForm,
      permisos: form2.empresaRegistroModuloPermisosForm,
      geolocalizacion: form2.empresaRegistroModuloGeolocalizacionForm,
      vacaciones: form2.empresaRegistroModuloVacacionesForm,
      app_movil: form2.empresaRegistroModuloAplicacionMovilForm,
      timbre_web: form2.empresaRegistroModuloTimbreVirtualForm,
      movil_direccion: '',
      movil_descripcion: ''
    }

    this.restEmpresa.RegistrarEmpresa(datosEmpresaNueva).subscribe(
      response => {
        if (response.message === 'ok' ) {
          this.VerDatos();
          this.toastr.success('Operación exitosa.', 'Registro guardado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
        }
      },
      error => {
        this.toastr.error(error, 'Upss!!! algo salió mal.', {
          timeOut: 6000,
        });
      }
    );

  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarCampos() {
    this.primeroFormGroup.reset();
    this.segundoFormGroup.reset();
  }

  // METODO PARA INGRESAR A FICHA DE EMPRESA
  VerDatos() {
    this.router.navigate(['/empresas']);
  }

  IngresarSoloNumerosEnteros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
