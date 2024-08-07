import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarLicenciaComponent } from './editar-licencia.component';

describe('EditarLicenciaComponent', () => {
  let component: EditarLicenciaComponent;
  let fixture: ComponentFixture<EditarLicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarLicenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarLicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
