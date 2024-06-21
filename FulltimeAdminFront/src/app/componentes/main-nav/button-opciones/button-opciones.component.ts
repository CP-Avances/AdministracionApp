import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginService } from 'src/app/servicios/login/login.service';
import { SettingsComponent } from '../../settings/settings.component';

@Component({
  selector: 'app-button-opciones',
  templateUrl: './button-opciones.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonOpcionesComponent implements OnInit {

  btnActualizar: boolean = false;
  btnCrear: boolean = false;

  constructor(
    public ventana: MatDialog,
    public loginService: LoginService,
  ) { }

  ngOnInit(): void {
    this.btnCrear = true;
  }

  AbrirSettings() {
    const id_empleado = parseInt('0');
    this.ventana.open(SettingsComponent, { width: '350px', data: { id_empleado } });
  }

}
