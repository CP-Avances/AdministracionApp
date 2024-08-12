import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroLicenciaComponent } from './registro-licencia.component';

describe('RegistroLicenciaComponent', () => {
  let component: RegistroLicenciaComponent;
  let fixture: ComponentFixture<RegistroLicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroLicenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroLicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
