import { Component } from '@angular/core';
import { RolService } from './service/rol.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rol-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rol-selection.component.html',
  styleUrl: './rol-selection.component.css'
})
export class RolSelectionComponent {

  constructor(private rolService: RolService, private router: Router){}

  seleccionarRol(rol: 'User' | 'Admin') {
    this.rolService.setRol(rol);

    this.router.navigate(['/login', rol.toLowerCase()]);
  }
}

