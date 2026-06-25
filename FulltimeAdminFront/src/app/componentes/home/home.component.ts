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
  cardData: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public restBaseEmpreas: BaseEmpresaService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.ObtenerBasesDisponibles();
  }

  ObtenerBasesDisponibles(): void {
    this.restBaseEmpreas.ObtenerInformacionBases().subscribe({
      next: (datosBaseEmpresa) => {
        this.cardData = Array.isArray(datosBaseEmpresa) ? datosBaseEmpresa : [];
      },
      error: () => {
        this.cardData = [];

        this.toastr.warning(
          'Verifique conexión con el servidor.',
          'Ups no se ha encontrado información.',
          { timeOut: 3000 }
        );
      }
    });
  }

  MostrarValor(valor: any): string {
    if (valor === null || valor === undefined || valor === '') {
      return 'No definido';
    }

    return String(valor);
  }

  CalcularPorcentajeStorage(card: any): number {
    const usado = Number(card.storage_mb_usado);
    const maximo = Number(card.storage_mb_max);

    if (!maximo || maximo <= 0 || !usado || usado <= 0) {
      return 0;
    }

    const porcentaje = (usado / maximo) * 100;

    if (porcentaje > 100) {
      return 100;
    }

    return Math.round(porcentaje);
  }

  ObtenerEstadoCalculo(valor: boolean | null | undefined): string {
    if (valor === true) {
      return 'Exitoso';
    }

    if (valor === false) {
      return 'Con error';
    }

    return 'No definido';
  }

  MenuRapido(num: number): void {
    this.router.navigate(['/verEmpresa/' + num], {
      relativeTo: this.route,
      skipLocationChange: false
    });
  }

}