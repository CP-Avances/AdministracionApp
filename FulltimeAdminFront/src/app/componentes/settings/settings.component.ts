import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {

  btnActualizar: boolean = false;
  btnCrear: boolean = false;

  formGroup: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private toaster: ToastrService,
    public ventana: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formGroup = formBuilder.group({
      vacaMail: false,
      vacaNoti: false,
      permisoMail: false,
      permisoNoti: false,
      horaExtraMail: false,
      horaExtraNoti: false,
      comidaMail: false,
      comidaNoti: false,
      comunicadoMail: false,
      comunicadoNoti: false,
    });
  }

  ngOnInit(): void {
    
  }

  // METODO PARA REGISTRAR CONFIGURACION DE NOTIFICACIONES
  CrearConfiguracion(form: any) {
    let data = {
      id_empleado: this.data.id_empleado,
      vaca_mail: form.vacaMail,
      vaca_noti: form.vacaNoti,
      permiso_mail: form.permisoMail,
      permiso_noti: form.permisoNoti,
      hora_extra_mail: form.horaExtraMail,
      hora_extra_noti: form.horaExtraNoti,
      comida_mail: form.comidaMail,
      comida_noti: form.comidaNoti,
      comunicado_mail: form.comunicadoMail,
      comunicado_noti: form.comunicadoNoti
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NOTIFICACIONES
  ActualizarConfiguracion(form: any) {
    let data = {
      vaca_mail: form.vacaMail,
      vaca_noti: form.vacaNoti,
      permiso_mail: form.permisoMail,
      permiso_noti: form.permisoNoti,
      hora_extra_mail: form.horaExtraMail,
      hora_extra_noti: form.horaExtraNoti,
      comida_mail: form.comidaMail,
      comida_noti: form.comidaNoti,
      comunicado_mail: form.comunicadoMail,
      comunicado_noti: form.comunicadoNoti
    }
  }
}
