import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { BaseEmpresaService } from 'src/app/servicios/baseEmpresa/baseEmpresa.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit {

  fecha: string;
  cardData: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public restBaseEmpreas: BaseEmpresaService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.restBaseEmpreas.ObtenerInformacionBases().subscribe(
      {
        next: (datosBaseEmpresa) => {
          this.cardData = datosBaseEmpresa;
        },
        error: () => {
          this.toastr.error('Verifique conexion a servidor', 'Error.', {
            timeOut: 3000,
          });
        }
      }
    );
  }

  // METODO DE MENU RAPIDO
  MenuRapido(num: number) {
    this.router.navigate(['/verEmpresa/' + num], { relativeTo: this.route, skipLocationChange: false });
  }

}
