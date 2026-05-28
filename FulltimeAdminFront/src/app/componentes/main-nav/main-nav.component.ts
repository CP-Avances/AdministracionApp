import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { LoginService } from 'src/app/servicios/login/login.service';

import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

interface MenuItem {
  name: string;
  icono: string;
  url: string;
  activo: boolean;
}

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})

export class MainNavComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 800px)')
    .pipe(
      map(result => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  barraInicial = false;
  nombreSelect: string = '';

  menuItems: MenuItem[] = [
    {
      name: 'Listado de Empresas',
      icono: 'business',
      url: '/empresas',
      activo: true
    }
  ];

  constructor(
    public inicio: LoginService,
    public ventana: MatDialog,
    public location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    if (this.inicio.loggedIn()) {
      this.breakpointObserver.observe('(max-width: 800px)').subscribe((result: BreakpointState) => {
        this.barraInicial = result.matches;
      });
    }

    this.marcarMenuActivoPorRuta();
  }

  marcarMenuActivoPorRuta(): void {
    const rutaActual = this.router.url;

    const itemActivo = this.menuItems.find(item => rutaActual.includes(item.url));

    if (itemActivo) {
      this.nombreSelect = itemActivo.name;
    }
  }

  navegar(item: MenuItem, drawer?: any): void {
    if (!item.activo) return;

    this.nombreSelect = item.name;

    this.router.navigate([item.url], {
      relativeTo: this.route,
      skipLocationChange: false
    });

    if (this.barraInicial && drawer) {
      drawer.close();
    }
  }

  irHome(): void {
    this.router.navigate(['/home'], {
      relativeTo: this.route,
      skipLocationChange: false
    });
  }

  // METODO PARA CERRAR SESION
  cerrarSesion() {
    this.inicio.logout();
  }
}