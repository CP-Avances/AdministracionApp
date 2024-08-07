import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LicenciaService } from 'src/app/servicios/licencia/licencia.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-licencia',
  templateUrl: './editar-licencia.component.html',
  styleUrl: './editar-licencia.component.css'
})
export class EditarLicenciaComponent implements OnInit {

  @Input() licencia: any;
  @Input() pagina: any;

  idBaseEmpresa: number;
  idEmpresaLicencia: number;

  licenciaFechaActivacionForm = new FormControl('', Validators.required);
  licenciaFechaDesactivacionForm = new FormControl('', Validators.required);

  ip: string | null;

  constructor(
    public componentev: VerEmpresaComponent,
    private toastr: ToastrService,
    private restLicencia: LicenciaService,
    public validar: ValidacionesService
  ){ }

  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.idBaseEmpresa = this.licencia[0].id_empresa_bdd;
    this.idEmpresaLicencia = this.licencia[0].id_empresa_licencia;
    this.InicializarValores();
  }

  InicializarValores(){
    this.licenciaFechaActivacionForm.setValue(this.licencia[0].fecha_activacion);
    this.licenciaFechaDesactivacionForm.setValue(this.licencia[0].fecha_desactivacion);
  }

  public LicenciaForm = new FormGroup({
    licenciaFechaActivacionForm: this.licenciaFechaActivacionForm,
    licenciaFechaDesactivacionForm: this.licenciaFechaDesactivacionForm
  });

  ValidarDatosLicencia(form: any) {
    if(form.empresaLicenciaFechaActivacion === '' || form.empresaLicenciaFechaActivacion === null){
      this.toastr.info('Verifique los datos ingresados.', '', {
        timeOut: 6000,
      })
    }else{
      this.ActualizarBase(form);
    }
  }

  ActualizarBase(form: any) {
    let datosLicencia = {
      id_empresa_licencia: this.idEmpresaLicencia,
      id_empresa_bdd: this.idBaseEmpresa,
      fecha_activacion: this.validar.FormatearFecha(form.licenciaFechaActivacionForm, 'YYYY-MM-DD', 'no'),
      fecha_desactivacion: this.validar.FormatearFecha(form.licenciaFechaDesactivacionForm, 'YYYY-MM-DD', 'no')
    }
    this.GuardarDatos(datosLicencia);
  }

  GuardarDatos(datos: any) {
    this.restLicencia.ActualizarLicencia(datos).subscribe(
      response => {
        if(response.message === 'Registro actualizado.'){
          this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
          this.Cancelar(2);
        }else{
          this.toastr.warning('Intente nuevamente.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
        }
      }, error => {
        this.toastr.error('Ups!!! algo salio mal.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        })
      }
    );
  }

  LimpiarCampos() {
    this.LicenciaForm.reset();
  }

  // CERRAR VENTA DE REGISTRO
  Cancelar(opcion: any) {
    if (this.pagina === 'ver-empresa') {
      this.componentev.editar_licencia_ = true;
      this.componentev.modificar_licencia_ = false;
      if (opcion === 2) {
        this.componentev.LeerDatosIniciales();
      }
    }
  }

}
