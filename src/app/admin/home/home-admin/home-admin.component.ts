import { Component, OnInit } from '@angular/core';
import { RolService } from '../../../rol-selection/service/rol.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css'
})
export class HomeAdminComponent implements OnInit {
  isAdmin: boolean = false;
  isAdminRoute: boolean = false; 

  constructor(private rolService: RolService, private router: Router) {}

  ngOnInit(): void {
    this.verificarAdmin() ; 
    this.verificarRutaAdmin() ; 
  }

  verificarAdmin(): void {
    this.isAdmin = this.rolService.getRol() === 'Admin'; ///Comprueba el rol 
  }
  

  verificarRutaAdmin(): void {
    this.isAdminRoute = this.router.url === '/admin';
    this.router.events.subscribe(() => {
      this.isAdminRoute = this.router.url === '/admin';
    });
  }

}