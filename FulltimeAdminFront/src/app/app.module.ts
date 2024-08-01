import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, LOCALE_ID } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

// CAMBIAR EL LOCAL DE LA APP
import { registerLocaleData } from '@angular/common';
import localEsEC from '@angular/common/locales/es-EC';
registerLocaleData(localEsEC);

// PIE DE PAGINA Y NAVEGABILIDAD
import { FooterComponent } from './componentes/footer/footer.component';

//Modulos Compartidos
import { MaterialModule } from './material/material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FiltrosModule } from './filtros/filtros.module';

import { BrowserModule } from '@angular/platform-browser';
import { MatPaginatorIntl } from '@angular/material/paginator';

//COMPONENTES
import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { MainNavComponent } from './componentes/main-nav/main-nav.component';
import { ButtonOpcionesComponent } from './componentes/main-nav/button-opciones/button-opciones.component';

//SERVICIOS
import { LoginService } from './servicios/login/login.service';
import { TokenInterceptorService } from './servicios/login/token-interceptor.service';
import { AuthGuard } from './servicios/guards/auth.guard';
import { MainNavService } from './componentes/main-nav/main-nav.service';
import { SettingsComponent } from './componentes/settings/settings.component';
import { ConexionBaseDatosComponent } from './componentes/conexion-base-datos/conexion-base-datos.component';
import { RegistroEmpresaComponent } from './componentes/empresa/registro-empresa/registro-empresa.component';
import { ListaEmpresasComponent } from './componentes/empresa/lista-empresas/lista-empresas.component';
import { MetodosComponent } from './componentes/metodoEliminar/metodos.component';
import { VerEmpresaComponent } from './componentes/empresa/ver-empresa/ver-empresa.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FooterComponent,
    HomeComponent,
    MainNavComponent,
    ButtonOpcionesComponent,
    SettingsComponent,
    ConexionBaseDatosComponent,
    RegistroEmpresaComponent,
    ListaEmpresasComponent,
    MetodosComponent,
    VerEmpresaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
    FiltrosModule,
    ToastrModule.forRoot()
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: LOCALE_ID, useValue: 'es-EC'
    },
    { 
      provide: MatPaginatorIntl, 
      useClass: MatPaginatorIntl 
    },
    LoginService,
    MainNavService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class CustomMaterialModule { }
export class DatePickerModule { }