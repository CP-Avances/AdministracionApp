import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { BaseService } from 'src/app/servicios/base/base.service';

@Component({
  selector: 'app-editar-base',
  templateUrl: './editar-base.component.html',
  styleUrl: './editar-base.component.css'
})
export class EditarBaseComponent implements OnInit {

  @Input() base: any;
  @Input() pagina: any;

  idSelectBase: number;
  idEmpresa: number;
  idBaseEmpresa: number;

  contador: number = 0;
  isChecked: boolean;
  habilitarSeleccion: boolean = true;
  habilitarBase: boolean = false;

  ip: string | null;

  baseF = new FormControl('');

  baseDescripcionForm = new FormControl('', Validators.required);
  baseNombreForm = new FormControl('', Validators.required);
  baseHostForm = new FormControl('', Validators.required);
  basePuertoForm = new FormControl('', Validators.required);
  baseUsuarioForm = new FormControl('', Validators.required);
  baseContrasenaForm = new FormControl('', Validators.required);

  constructor(
    public componentev: VerEmpresaComponent,
    private toastr: ToastrService,
    private restBase: BaseService
  ){
  }

  public BaseForm = new FormGroup({
    baseDescripcionForm: this.baseDescripcionForm,
    baseNombreForm: this.baseNombreForm,
    baseHostForm: this.baseHostForm,
    basePuertoForm: this.basePuertoForm,
    baseUsuarioForm: this.baseUsuarioForm,
    baseContrasenaForm: this.baseContrasenaForm,
  });
  
  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');
    this.idEmpresa = this.base[0].id_empresa;
    this.idBaseEmpresa = this.base[0].id_empresa_bdd;
    this.InicializarValores();
  }

  // CERRAR VENTA DE REGISTRO
  Cancelar(opcion: any) {
    if (this.pagina === 'ver-empresa') {
      this.componentev.editar_base_ = true;
      this.componentev.modificar_base_ = false;
      if (opcion === 2) {
        this.componentev.LeerDatosIniciales();
      }
    }
  }

  InicializarValores(){
    this.baseDescripcionForm.setValue(this.base[0].empresa_bdd_descripcion);
    this.baseNombreForm.setValue(this.base[0].empresa_bdd_nombre);
    this.baseHostForm.setValue(this.base[0].empresa_bdd_host);
    this.basePuertoForm.setValue(this.base[0].empresa_bdd_puerto);
    this.baseUsuarioForm.setValue(this.base[0].empresa_bdd_usuario);
    this.baseContrasenaForm.setValue(this.base[0].empresa_bdd_contrasena);
  }

  ValidarDatosBase(form: any) {
    if(form.baseDescripcionForm === '' || form.baseDescripcionForm === null){
      this.toastr.info('Verifique los datos ingresados.', '', {
        timeOut: 6000,
      })
    }else{
      this.ActualizarBase(form);
    }
  }

  ActualizarBase(form: any) {
    let datosBase = {
      id_empresa_bdd: this.idBaseEmpresa,
      id_empresa: this.idEmpresa,
      empresa_bdd_nombre: form.baseNombreForm,
      empresa_bdd_host: form.baseHostForm,
      empresa_bdd_puerto: form.basePuertoForm,
      empresa_bdd_descripcion: form.baseDescripcionForm,
      empresa_bdd_contrasena: form.baseContrasenaForm,
      empresa_bdd_usuario: form.baseUsuarioForm
    }
    this.GuardarDatos(datosBase);
  }

  GuardarDatos(datos: any) {
    this.restBase.ActualizarBase(datos).subscribe(
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
    this.BaseForm.reset();
  }

}
