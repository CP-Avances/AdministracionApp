import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { ConexionBaseDatosService } from 'src/app/servicios/conexion-base-datos/conexion-base-datos.service'

@Component({
  selector: 'app-conexion-base-datos',
  templateUrl: './conexion-base-datos.component.html',
  styleUrl: './conexion-base-datos.component.css'
})
export class ConexionBaseDatosComponent implements OnInit {

  datosConexion: any = [];

  constructor(
    public ventana: MatDialog,
    public conexionBaseDatos: ConexionBaseDatosService
  ) {}

  ngOnInit(): void {
    this.CargarDatosBase();
  }

  CargarDatosBase() {
    this.datosConexion = [];
    this.conexionBaseDatos.ObtenerInformacionConexionPrincipal().subscribe(
      datos => {
        this.datosConexion = datos;
        console.log(':::',datos.base);
        console.log(':::',this.datosConexion.base);
      }, 
      err => {
        this.datosConexion = null;
      }
    );
  }
  
}
