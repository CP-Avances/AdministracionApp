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
import { RegistroEmpresaComponent } from './componentes/empresa/registro-empresa/registro-empresa.component';
import { ListaEmpresasComponent } from './componentes/empresa/lista-empresas/lista-empresas.component';
import { MetodosComponent } from './componentes/metodoEliminar/metodos.component';
import { VerEmpresaComponent } from './componentes/empresa/ver-empresa/ver-empresa.component';
import { EditarEmpresaComponent } from './componentes/empresa/editar-empresa/editar-empresa.component';
import { EditarBaseComponent } from './componentes/base/editar-base/editar-base.component';
import { RegistroBaseComponent } from './componentes/base/registro-base/registro-base.component';
import { EditarLicenciaComponent } from './componentes/licencia/editar-licencia/editar-licencia.component';
import { EditarModulosComponent } from './componentes/empresa/editar-modulos/editar-modulos.component';
import { RegistroLicenciaComponent } from './componentes/licencia/registro-licencia/registro-licencia.component';
import { RegistrarLimiteUsuariosComponent } from './componentes/limites-usuarios/registrar-limite-usuarios/registrar-limite-usuarios.component';
import { EditarLimiteUsuariosComponent } from './componentes/limites-usuarios/editar-limite-usuarios/editar-limite-usuarios.component';

//SERVICIOS
import { LoginService } from './servicios/login/login.service';
import { TokenInterceptorService } from './servicios/login/token-interceptor.service';
import { AuthGuard } from './servicios/guards/auth.guard';
import { RegistrarStorageUsoComponent } from './componentes/limites-usuarios/registrar-storage-uso/registrar-storage-uso.component';
import { HistorialComponent } from './componentes/historial/historial.component';
import { InicializarBaseComponent } from './componentes/base/inicializar-base/inicializar-base.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FooterComponent,
    HomeComponent,
    MainNavComponent,
    RegistroEmpresaComponent,
    ListaEmpresasComponent,
    MetodosComponent,
    VerEmpresaComponent,
    EditarEmpresaComponent,
    EditarBaseComponent,
    RegistroBaseComponent,
    EditarLicenciaComponent,
    EditarModulosComponent,
    RegistroLicenciaComponent,
    RegistrarLimiteUsuariosComponent,
    EditarLimiteUsuariosComponent,
    RegistrarStorageUsoComponent,
    HistorialComponent,
    InicializarBaseComponent,
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
    LoginService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class CustomMaterialModule { }
export class DatePickerModule { }