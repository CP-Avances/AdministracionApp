import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarLimiteUsuariosComponent } from './registrar-limite-usuarios.component';

describe('RegistrarLimiteUsuariosComponent', () => {
  let component: RegistrarLimiteUsuariosComponent;
  let fixture: ComponentFixture<RegistrarLimiteUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarLimiteUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarLimiteUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
