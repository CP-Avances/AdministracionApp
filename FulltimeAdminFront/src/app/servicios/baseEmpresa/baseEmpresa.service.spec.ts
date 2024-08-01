import { TestBed } from '@angular/core/testing';

import { BaseEmpresaService } from './baseEmpresa.service';

describe('BaseEmpresaService', () => {
  let service: BaseEmpresaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseEmpresaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
