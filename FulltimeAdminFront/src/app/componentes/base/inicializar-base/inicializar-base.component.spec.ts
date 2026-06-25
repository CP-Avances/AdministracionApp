import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicializarBaseComponent } from './inicializar-base.component';

describe('InicializarBaseComponent', () => {
  let component: InicializarBaseComponent;
  let fixture: ComponentFixture<InicializarBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicializarBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicializarBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
