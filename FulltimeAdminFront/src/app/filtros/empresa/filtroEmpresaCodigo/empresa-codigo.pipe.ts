import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'empresaCodigo'
})
export class EmpresaCodigoPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 1) return value;

    const resultadoEmpresa: any = [];

    for (const empresa of value) {
      if (empresa.empresa_codigo && empresa.empresa_codigo.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoEmpresa.push(empresa);
      };
    };

    return resultadoEmpresa;
  }

}
