import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConexionBaseDatosComponent } from './conexion-base-datos.component';

describe('ConexionBaseDatosComponent', () => {
  let component: ConexionBaseDatosComponent;
  let fixture: ComponentFixture<ConexionBaseDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConexionBaseDatosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConexionBaseDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
