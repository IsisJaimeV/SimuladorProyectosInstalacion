import { TestBed } from '@angular/core/testing';

import { SimuladorProyectosDAOService } from './simulador-proyectos-dao.service';

describe('SimuladorProyectosDAOService', () => {
  let service: SimuladorProyectosDAOService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimuladorProyectosDAOService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
