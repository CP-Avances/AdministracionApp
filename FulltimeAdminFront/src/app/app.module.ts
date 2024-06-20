import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, LOCALE_ID } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ScrollingModule } from '@angular/cdk/scrolling'

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

//SERVICIOS
import { LoginService } from './servicios/login/login.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FooterComponent,
    HomeComponent
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
    ToastrModule.forRoot()
  ],
  providers: [
    {
      provide: LOCALE_ID, useValue: 'es-EC'
    },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntl },
    LoginService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class CustomMaterialModule { }
export class DatePickerModule { }