import { SuperService } from './../../../service/super.service';
import { Component, OnInit } from '@angular/core';
import { Venta } from '../../../types/venta';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial-compras.component.html',
  styleUrl: './historial-compras.component.css'
})
export class HistorialComprasComponent implements OnInit {

  ventas: Venta [] = [];
  cargando = true;

  constructor(private superServicio: SuperService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    
    const user = this.auth.getCurrentUser?.() ?? null;
    if(!user){
      this.router.navigate(['/login', 'user']);
      return;
    }

    this.superServicio.getVentasPorEmail(user.email).subscribe({
      next: (data) => {
        ///Mas nuevas pri
        this.ventas = [...data].sort((a,b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    })
  }
}
