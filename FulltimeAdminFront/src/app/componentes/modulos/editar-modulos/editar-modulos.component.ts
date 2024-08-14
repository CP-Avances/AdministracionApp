import { Component, Input, OnInit } from '@angular/core';
import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { RegistroEmpresaService } from 'src/app/servicios/empresa/registro-empresa/registro-empresa.service';

@Component({
  selector: 'app-editar-modulos',
  templateUrl: './editar-modulos.component.html',
  styleUrl: './editar-modulos.component.css'
})
export class EditarModulosComponent implements OnInit{

  @Input() modulos: any;
  @Input() pagina: any;

  ip: string | null;
  idEmpresa: number;

  empresaModulosPermisosForm = new FormControl('');
  empresaModulosVacacionesForm = new FormControl('');
  empresaModulosHoraExtraForm = new FormControl('');
  empresaModulosGeolocalizacionForm = new FormControl('');
  empresaModulosTimbreVirtualForm = new FormControl('');
  empresaModulosAplicacionMovilForm = new FormControl('');
  empresaModulosAccionPersonalForm = new FormControl('');
  empresaModulosAlimentacionForm = new FormControl('');

  constructor(
    public componentev: VerEmpresaComponent,
    private toastr: ToastrService,
    private restModulos: RegistroEmpresaService
  ){ }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.idEmpresa = this.modulos.empresa_id;
    console.log('EMPRESA_', this.idEmpresa);
    this.InicializarValores();
  }

  public ModulosForm = new FormGroup({
    empresaModulosPermisosForm: this.empresaModulosPermisosForm,
    empresaModulosVacacionesForm: this.empresaModulosVacacionesForm,
    empresaModulosHoraExtraForm: this.empresaModulosHoraExtraForm,
    empresaModulosGeolocalizacionForm: this.empresaModulosGeolocalizacionForm,
    empresaModulosTimbreVirtualForm: this.empresaModulosTimbreVirtualForm,
    empresaModulosAplicacionMovilForm: this.empresaModulosAplicacionMovilForm,
    empresaModulosAccionPersonalForm: this.empresaModulosAccionPersonalForm,
    empresaModulosAlimentacionForm: this.empresaModulosAlimentacionForm
  });

  InicializarValores(){
    this.empresaModulosPermisosForm.setValue(this.modulos.empresa_modulos_permisos_);
    this.empresaModulosVacacionesForm.setValue(this.modulos.empresa_modulos_vacaciones_);
    this.empresaModulosHoraExtraForm.setValue(this.modulos.empresa_modulos_hora_extra_);
    this.empresaModulosGeolocalizacionForm.setValue(this.modulos.empresa_modulos_geolocalizacion_);
    this.empresaModulosTimbreVirtualForm.setValue(this.modulos.empresa_modulos_timbre_web_);
    this.empresaModulosAplicacionMovilForm.setValue(this.modulos.empresa_modulos_app_movil_);
    this.empresaModulosAccionPersonalForm.setValue(this.modulos.empresa_modulos_accion_personal_);
    this.empresaModulosAlimentacionForm.setValue(this.modulos.empresa_modulos_alimentacion_);
  }

  // CERRAR VENTA DE REGISTRO
  Cancelar(opcion: any) {
    if (this.pagina === 'ver-empresa') {
      this.componentev.editar_modulos_ = true;
      this.componentev.modificar_modulos_ = false;
      if (opcion === 2) {
        this.componentev.LeerDatosIniciales();
      }
    }
  }

  ValidarDatosModulos(form: any) {
    this.ActualizarModulos(form);
  }

  ActualizarModulos(form: any) {
    let datosBase = {
      empresa_id: this.idEmpresa,
      empresa_modulos_permisos_: this.empresaModulosPermisosForm.value,
      empresa_modulos_vacaciones_: this.empresaModulosVacacionesForm.value,
      empresa_modulos_hora_extra_: this.empresaModulosHoraExtraForm.value,
      empresa_modulos_geolocalizacion_: this.empresaModulosGeolocalizacionForm.value,
      empresa_modulos_timbre_web_: this.empresaModulosTimbreVirtualForm.value,
      empresa_modulos_app_movil_: this.empresaModulosAplicacionMovilForm.value,
      empresa_modulos_accion_personal_: this.empresaModulosAccionPersonalForm.value,
      empresa_modulos_alimentacion_: this.empresaModulosAlimentacionForm.value
    }
    this.GuardarDatos(datosBase);
  }

  GuardarDatos(datos: any) {
    console.log(datos);
    this.restModulos.ActualizarEmpresaModulos(datos).subscribe(
      (response: any) => {
        if (response.message === 'Registro actualizado.') {
          this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
          this.Cancelar(2);
        }
      },
      error => {
        this.toastr.error(error.error.message, 'Upss!!! algo salió mal.', {
          timeOut: 6000,
        });
      }
    );
  }

  LimpiarCampos() {
    this.ModulosForm.reset();
  }

}
