import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { LoginService } from '../../servicios/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

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
    private toastr: ToastrService) {
    this.formulario.setValue({
      usuarioF: '',
      passwordF: ''
    });
  }

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

  ValidarUsuario(form: any): void {
    if (!form?.usuarioF || form.usuarioF.trim().length === 0) {
      this.toastr.warning('Ingrese el usuario.', 'Campo requerido', {
        timeOut: 3000,
      });
      return;
    }

    if (!form?.passwordF || form.passwordF.trim().length === 0) {
      this.toastr.warning('Ingrese la contraseña.', 'Campo requerido', {
        timeOut: 3000,
      });
      return;
    }

    const data = {
      usuario: form.usuarioF.toString().trim(),
      contrasena: form.passwordF.toString()
    };

    this.restLogin.ValidarCredenciales(data).subscribe({
      next: (resp: any) => {
        this.mensaje = resp;

        if (resp.mensaje !== 'ok') {
          this.toastr.error(
            'Usuario o contraseña no son correctos.',
            'Ups!!! algo ha salido mal.',
            {
              timeOut: 6000,
            }
          );
          return;
        }

        localStorage.setItem('token', resp.token);
        localStorage.setItem('ip', resp.ip_adress);

        this.toastr.success(
          'Ingreso exitoso!',
          'Usuario y contraseña válidos',
          {
            timeOut: 6000,
          }
        );

        const redi = sessionStorage.getItem('redireccionar');

        if (redi) {
          sessionStorage.removeItem('redireccionar');
          this.router.navigateByUrl(redi);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.toastr.error(
          'Verifique usuario o contraseña.',
          'Error.',
          {
            timeOut: 3000,
          }
        );
      }
    });
  }

}
