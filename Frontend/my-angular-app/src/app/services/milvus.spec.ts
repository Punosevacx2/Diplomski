import { TestBed } from '@angular/core/testing';

import { Milvus } from './milvus';

describe('Milvus', () => {
  let service: Milvus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Milvus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
