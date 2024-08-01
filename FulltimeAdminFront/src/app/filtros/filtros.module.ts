import { NgModule } from '@angular/core';

import { CustomMatPaginatorIntl } from './pipes/paginator-es';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatePipe } from './pipes/paginate.pipe';
import { EmpresaIdPipe } from './empresa/filtroEmpresaId/empresa-id.pipe';
import { EmpresaDescripcionPipe } from './empresa/filtroEmpresaDescripcion/empresa-descripcion.pipe';
import { EmpresaCodigoPipe } from './empresa/filtroEmpresaCodigo/empresa-codigo.pipe';

@NgModule({
    declarations: [
      PaginatePipe,
      EmpresaIdPipe,
      EmpresaDescripcionPipe,
      EmpresaCodigoPipe
    ],
    exports: [
      PaginatePipe,
      EmpresaIdPipe,
      EmpresaDescripcionPipe,
      EmpresaCodigoPipe
    ],
    providers: [
      { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
    ]
})
export class FiltrosModule { }