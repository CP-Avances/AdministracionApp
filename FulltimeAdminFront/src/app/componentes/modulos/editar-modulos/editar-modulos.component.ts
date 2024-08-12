import { Component, Input, OnInit } from '@angular/core';
import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-editar-modulos',
  templateUrl: './editar-modulos.component.html',
  styleUrl: './editar-modulos.component.css'
})
export class EditarModulosComponent implements OnInit{

  @Input() modulos: any;
  @Input() pagina: any;

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
    private toastr: ToastrService
  ){ }

  ngOnInit(): void {
    console.log("empresa:", this.modulos[0]);
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

}
