import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEmpleado } from './panel-empleado';

describe('PanelEmpleado', () => {
  let component: PanelEmpleado;
  let fixture: ComponentFixture<PanelEmpleado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelEmpleado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelEmpleado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
