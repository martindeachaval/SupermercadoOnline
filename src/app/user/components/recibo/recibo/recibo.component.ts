import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Venta } from '../../../../types/venta';
import { SuperService } from '../../../../service/super.service';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recibo.component.html',
  styleUrl: './recibo.component.css'
})
export class ReciboComponent implements OnInit{

  venta: Venta | null = null;

  constructor(private route: ActivatedRoute, private superService: SuperService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.superService.getVentaPorId(id).subscribe(v => this.venta = v);
  }

  imprimir(): void{
    window.print();
  }
}
