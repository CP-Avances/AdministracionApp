import { TestBed } from '@angular/core/testing';

import { ConexionBaseDatosService } from './conexion-base-datos.service';

describe('ConexionBaseDatosService', () => {
  let service: ConexionBaseDatosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConexionBaseDatosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
