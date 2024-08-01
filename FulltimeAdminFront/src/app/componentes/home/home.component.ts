import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { BaseEmpresaService } from 'src/app/servicios/baseEmpresa/baseEmpresa.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  fecha: string;

  datosEmpleado: any;
  idEmpleado: any = 0;
  cardData: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public restBaseEmpreas: BaseEmpresaService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.restBaseEmpreas.ObtenerInformacionBases().subscribe(
      datosBaseEmpresa => {
        this.cardData = datosBaseEmpresa;
      }, 
      err => {
        this.toastr.error('Verifique conexion a servidor', 'Error.', {
          timeOut: 3000,
        });
      }
    );
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA VER LA INFORMACION DEL USUARIO 
  imagenEmpleado: any;
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;

  // METODO DE MENU RAPIDO
  MenuRapido(num: number) {
    this.router.navigate(['/verEmpresa/'+num], { relativeTo: this.route, skipLocationChange: false });
  }

}
