import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { LoginService } from './servicios/login/login.service';
import { InactividadSistema } from './servicios/inactividad/inactividad-sistema';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'FulltimeAdminFront';
  ruta: string = '';

  constructor(
    public router: Router,
    public location: Location,
    public loginServices: LoginService,
    private readonly idleLogout: InactividadSistema,
  ) { }

  ngOnInit(): void {
    this.idleLogout.start();
  }

  removerLogin() {
    let tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1);

    if (tituloPestania === 'login') {
      return false;
    } else {
      return true;
    }
  }

  removerMain() {
    let tituloPestania = this.location.prepareExternalUrl(this.location.path());
    tituloPestania = tituloPestania.slice(1).split('/')[0];

    if (tituloPestania === 'login') {
      return true;
    } else {
      return false;
    }
  }

}