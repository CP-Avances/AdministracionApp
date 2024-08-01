import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'empresaDescripcion'
})
export class EmpresaDescripcionPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 1) return value;

    const resultadoEmpresa: any = [];

    for (const empresa of value) {
      if (empresa.empresa_descripcion && empresa.empresa_descripcion.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoEmpresa.push(empresa);
      };
    };

    return resultadoEmpresa;
  }
}
