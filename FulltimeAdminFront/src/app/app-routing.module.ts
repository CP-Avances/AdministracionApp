import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { AuthGuard } from './servicios/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { roles: 'otros' } },
  //ACCESO A RUTAS DE INICIO DE SESION
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { log: false } }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
