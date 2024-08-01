import { TestBed } from '@angular/core/testing';

import { RegistroEmpresaService } from './registro-empresa.service';

describe('RegistroEmpresaService', () => {
  let service: RegistroEmpresaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroEmpresaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
