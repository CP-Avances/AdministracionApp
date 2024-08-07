import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroBaseComponent } from './registro-base.component';

describe('RegistroBaseComponent', () => {
  let component: RegistroBaseComponent;
  let fixture: ComponentFixture<RegistroBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
