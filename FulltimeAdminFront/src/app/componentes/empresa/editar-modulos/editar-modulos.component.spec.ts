import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarModulosComponent } from './editar-modulos.component';

describe('EditarModulosComponent', () => {
  let component: EditarModulosComponent;
  let fixture: ComponentFixture<EditarModulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarModulosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarModulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
