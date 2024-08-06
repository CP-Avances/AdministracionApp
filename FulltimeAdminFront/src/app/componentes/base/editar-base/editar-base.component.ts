import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { VerEmpresaComponent } from '../../empresa/ver-empresa/ver-empresa.component';

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

  contador: number = 0;
  isChecked: boolean;
  habilitarSeleccion: boolean = true;
  habilitarBase: boolean = false;

  ip: string | null;

  baseF = new FormControl('');

  baseDescripcionForm = new FormControl('');
  baseNombreForm = new FormControl('');
  baseHostForm = new FormControl('');
  basePuertoForm = new FormControl('');

  constructor(
    public componentev: VerEmpresaComponent,
  ){
  }

  public BaseForm = new FormGroup({
    baseDescripcionForm: this.baseDescripcionForm,
    baseNombreForm: this.baseNombreForm,
    baseHostForm: this.baseHostForm,
    basePuertoForm: this.basePuertoForm
  });
  
  ngOnInit(): void {
    this.ip = localStorage.getItem('ip');

  }

  // CERRAR VENTA DE REGISTRO
  Cancelar(opcion: any) {
    if (this.pagina === 'ver-empresa') {
      this.componentev.editar_base = false;
      this.componentev.editar_base_ = true;
      if (opcion === 2) {
        //this.componentev.Ver(this.componentev.formato_fecha);
      }
    }
  }
}
