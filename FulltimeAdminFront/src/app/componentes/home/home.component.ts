import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  fecha: string;

  datosEmpleado: any;
  idEmpleado: any = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.idEmpleado = localStorage.getItem('empleado');
    this.BuscarParametro();

    var min_aleatoria = Math.floor(Math.random() * 10)
    console.log('ver valor aleatorio ', min_aleatoria)
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {

    this.VerEmpleado(this.formato_fecha)
  }

  // METODO PARA FORMATEAR FECHAS
  FormatearFechas(formato_fecha: string) {
    var f = moment();
  }

  // METODO PARA VER LA INFORMACION DEL USUARIO 
  imagenEmpleado: any;
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;
  VerEmpleado(formato_fecha: string) {
    this.datosEmpleado = [];
    console.log('ver Empleado');
  }

  // METODO PARA MOSTRAR IMAGEN EN PDF
  ImagenLocalUsuario(localPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      let img = new Image();
      img.onload = () => {
        canvas.height = img.height;
        canvas.width = img.width;
        const context = canvas.getContext("2d")!;
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
      img.onerror = () => reject('Imagen no disponible')
      img.src = localPath;
    });
  }

  // METODO DE MENU RAPIDO
  MenuRapido(num: number) {
    switch (num) {
      case 0: // Info Usuario
        this.router.navigate(['/verEmpleado/'+this.idEmpleado], { relativeTo: this.route, skipLocationChange: false });
        break; 
      case 1: // REPORTES
        this.router.navigate(['/timbres-personal'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 2: // HORAS EXTRAS
        this.router.navigate(['/horas-extras-solicitadas'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 3: // VACACIONES
        this.router.navigate(['/vacaciones-solicitados'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 4: // PERMISOS
        this.router.navigate(['/permisos-solicitados'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 5: // ACCIONES PERSONAL
        this.router.navigate(['/proceso'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 6: // APP MOVIL
        this.router.navigate(['/app-movil'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 7: // ALIMENTACION
        this.router.navigate(['/listarTipoComidas'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 8: // GEOLOCALIZACION
        this.router.navigate(['/coordenadas'], { relativeTo: this.route, skipLocationChange: false });
        break;
      default:
        this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
        break;
    }
  }

  // METODO PARA DIRECCIONAR A RUTA DE GRAFICAS
  RedireccionarRutas(num: number) {
    switch (num) {
      case 1: // ASISTENCIA
        this.router.navigate(['/macro/asistencia'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 2: // INASISTENCIA
        this.router.navigate(['/macro/inasistencia'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 3: // ATRASOS
        this.router.navigate(['/macro/retrasos'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 4: // SALIDA ANTICIPADA
        this.router.navigate(['/macro/salidas-antes'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 5: // MARCACIONES
        this.router.navigate(['/macro/marcaciones'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 6: // HORAS EXTRAS
        this.router.navigate(['/macro/hora-extra'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 7: // TIEMPO JORNADA
        this.router.navigate(['/macro/tiempo-jornada-vs-hora-ext'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 8: // JORNADA HORAS EXTRAS
        this.router.navigate(['/macro/jornada-vs-hora-extra'], { relativeTo: this.route, skipLocationChange: false });
        break;
      default:
        this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
        break;
    }
  }

}
