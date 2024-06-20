import { NgModule } from '@angular/core';

import { CustomMatPaginatorIntl } from './pipes/paginator-es';
import { MatPaginatorIntl } from '@angular/material/paginator';

@NgModule({
    declarations: [],
    exports: [],
    providers: [
      { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
    ]
})
export class FiltrosModule { }