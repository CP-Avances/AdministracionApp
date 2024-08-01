import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'empresaId'
})
export class EmpresaIdPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 1) return value;

    const resultadoEmpresa: any = [];
    for (const empresa of value) {
      if (empresa.empresa_id ===  parseInt(arg, 10)) {
        resultadoEmpresa.push(empresa);
      };
    };

    return resultadoEmpresa;
  }

}
