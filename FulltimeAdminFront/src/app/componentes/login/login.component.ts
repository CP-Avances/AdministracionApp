import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
moment.locale('es');

import { LoginService } from '../../servicios/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  title = 'login';
  hide1 = true;
  url: string = '';
  mensaje: any = [];//VARIABLE PARA ALMACENAR VALOR DE EMPRESA CONSULTADO

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  user = new FormControl('', Validators.required);
  pass = new FormControl('', Validators.required);

  public formulario = new FormGroup({
    usuarioF: this.user,
    passwordF: this.pass
  });

  constructor(
    public restLogin: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService) {
    this.formulario.setValue({
      usuarioF: '',
      passwordF: ''
    });
  }

  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  ngOnInit(): void {
    this.url = this.router.url;
  }

  // MENSAJE DE ERROR AL INGRESAR INFORMACION
  ObtenerMensajeCampoUsuarioError() {
    if (this.user.hasError('required')) {
      return 'Ingresar nombre de usuario.';
    }
  }

  ObtenerMensajeCampoContraseniaError() {
    if (this.pass.hasError('required')) {
      return 'Ingresar contraseña.';
    }
  }
  
  ValidarUsuario(form: any){
    var f = moment();
    if (form.usuarioF.trim().length === 0) return;
    if (form.passwordF.trim().length === 0) return;

    let data = {
      "usuario": form.usuarioF.toString(),
      "contrasena": form.passwordF.toString()
    };

    this.restLogin.ValidarCredenciales(data).subscribe(
      {
        next: (v) => 
        {
          this.mensaje = v;
        },
        error: (e) => 
        {
          console.log('ERROR LOGIN');
          this.toastr.error('Verifique usuario o contraseña', 'Error.', {
            timeOut: 3000,
          });
        },
        complete: () => 
        {
          console.log('CONTINUAR LOGIN ADMIN');
          if(this.mensaje.mensaje === 'ok'){
            console.log('CONTINUAR LOGIN ADMIN OK');
            this.IniciarSesion(form);
          }
        }
      }
    );

  }

  IniciarSesion(form: any) {
    console.log('CONTINUAR LOGIN ADMIN OK1');
    if (this.mensaje.mensaje !== 'ok'){
      this.toastr.error('Usuario o contraseña no son correctos.', 'Ups!!! algo ha salido mal.', {
        timeOut: 6000,
      });
    }
    else if (this.mensaje.mensaje === 'ok'){
      this.toastr.success('Ingreso Existoso! ', 'Usuario y contraseña válidos', {
        timeOut: 6000,
      });
      console.log('redireccionar ');
      this.router.navigate(['/home']);
    }

  }

  IngresoSistema(user: any, acceso: string, dir_ip: any) {
    var f = moment();
    var fecha = f.format('YYYY-MM-DD');
    var time = f.format('HH:mm:ss');
    let dataAcceso = {
      ip_address: dir_ip,
      user_name: user,
      modulo: 'login',
      acceso: acceso,
      fecha: fecha,
      hora: time,
    }
  }

}
