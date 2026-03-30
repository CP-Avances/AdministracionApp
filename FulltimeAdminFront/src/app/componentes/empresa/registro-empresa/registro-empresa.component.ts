import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ListaEmpresasService } from 'src/app/servicios/empresa/lista-empresas/lista-empresas.service';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';


@Component({
  selector: 'app-registro-empresa',
  templateUrl: './registro-empresa.component.html',
  styleUrl: './registro-empresa.component.css'
})
export class RegistroEmpresaComponent implements OnInit {

  filteredOptions: Observable<any[]>;
  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  ip: string | null;
  zonas: any = [];

  constructor(
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    public ventana: MatDialog,
    private restEmpresa: RegistroEmpresaService,
    private zona: ListaEmpresasService,
    private router: Router,
    private validar: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.GetZonaHorarias();
    this.AsignarFormulario();
  }

  // METODO PARA LISTAR EMPRESAS
  async GetZonaHorarias() {
    this.zona.ObtenerInformacionZonasHorarios().subscribe(
      datos => {
        this.zonas = datos;
        console.log(':::::', this.zonas);
      },
      err => {
        this.zonas = null;
        console.log('error');
      }
    );

    console.log('_:::', this.zonas);
  }

  AsignarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      empresaRegistroDescripcionForm: [''],
      empresaRegistroCodigoForm: [''],
      empresaNumeroRelojesForm: [''],
      empresaZonaHorariaForm: ['']
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
    var zona = form1.empresaZonaHorariaForm;
    const [nombre] = zona.split(" ("); // DIVIDIMOS EN DOS PARTES
    let datosEmpresaNueva = {
      empresa_codigo: form1.empresaRegistroCodigoForm,
      empresa_direccion: 'http://192.168.0.145:3001/server',
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
      movil_descripcion: '',
      zona_horaria: nombre,
    }

    this.restEmpresa.RegistrarEmpresa(datosEmpresaNueva).subscribe(
      response => {
        if (response.message === 'ok') {
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
