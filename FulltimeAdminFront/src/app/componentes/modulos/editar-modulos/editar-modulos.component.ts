import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-editar-modulos',
  templateUrl: './editar-modulos.component.html',
  styleUrl: './editar-modulos.component.css'
})
export class EditarModulosComponent implements OnInit{

  @Input() modulos: any;
  @Input() pagina: any;

  ngOnInit(): void {
    
  }

}
