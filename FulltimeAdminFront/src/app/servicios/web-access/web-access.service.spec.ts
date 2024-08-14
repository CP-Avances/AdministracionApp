import { TestBed } from '@angular/core/testing';

import { WebAccessService } from './web-access.service';

describe('WebAccessService', () => {
  let service: WebAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
