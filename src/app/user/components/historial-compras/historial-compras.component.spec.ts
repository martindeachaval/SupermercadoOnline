import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialComprasComponent } from './historial-compras.component';

describe('HistorialComprasComponent', () => {
  let component: HistorialComprasComponent;
  let fixture: ComponentFixture<HistorialComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialComprasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
