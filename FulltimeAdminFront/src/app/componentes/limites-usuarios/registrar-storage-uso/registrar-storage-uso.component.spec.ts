import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarStorageUsoComponent } from './registrar-storage-uso.component';

describe('RegistrarStorageUsoComponent', () => {
  let component: RegistrarStorageUsoComponent;
  let fixture: ComponentFixture<RegistrarStorageUsoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarStorageUsoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarStorageUsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
