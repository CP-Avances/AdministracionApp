import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { ConexionBaseDatosComponent } from './componentes/conexion-base-datos/conexion-base-datos.component';
import { AuthGuard } from './servicios/guards/auth.guard';
import { RegistroEmpresaComponent } from './componentes/empresa/registro-empresa/registro-empresa.component';
import { ListaEmpresasComponent } from './componentes/empresa/lista-empresas/lista-empresas.component';
import { VerEmpresaComponent } from './componentes/empresa/ver-empresa/ver-empresa.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { roles: 'otros' } },
  //ACCESO A RUTAS DE INICIO DE SESION
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { log: false } },
  //ACCESO A LA CONFIGURACION ACTUAL DE LA BDD
  { path: 'conexionBaseDatos', component: ConexionBaseDatosComponent, canActivate: [AuthGuard], data: { log: false } },
  //ACCESO AL REGISTRO DE EMPRESAS
  { path: 'empresas', component: ListaEmpresasComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'registroEmpresa', component: RegistroEmpresaComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'verEmpresa/:id', component: VerEmpresaComponent, canActivate: [AuthGuard], data: { log: false } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
