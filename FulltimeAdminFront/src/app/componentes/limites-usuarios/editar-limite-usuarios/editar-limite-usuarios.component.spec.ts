import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarLimiteUsuariosComponent } from './editar-limite-usuarios.component';

describe('EditarLimiteUsuariosComponent', () => {
  let component: EditarLimiteUsuariosComponent;
  let fixture: ComponentFixture<EditarLimiteUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarLimiteUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarLimiteUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
