import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RolService } from '../rol-selection/service/rol.service';
import { BusquedaService } from '../service/busqueda.service';
import { AuthService, Usuario } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  rolActual: string | null = null;

  isAddProductosRoute = false;
  isUserRoute = false;
  isProdCatRoute = false;
  isProdDetRoute = false;
  isAdminRoute = false;

  currentUser: Usuario | null = null;
  menuOpen = false;

  constructor(
    private rolService: RolService,
    private router: Router,
    private busquedaService: BusquedaService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.rolService.rol$.subscribe(rol => {
      this.rolActual = rol;
    });

    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) this.menuOpen = false; ///Por si quedo abierto
    });

    this.verificarRutas();
  }

  private verificarRutas(): void {
    const update = () => {
      this.isAddProductosRoute = this.router.url === '/admin/add-productos';
      this.isUserRoute = this.router.url === '/user';
      this.isProdCatRoute = this.router.url.startsWith('/user/productos/');
      this.isAdminRoute = this.router.url.startsWith('/admin');
    };

    update();
    this.router.events.subscribe(() => update());
  }

  onBuscar(value: string): void {
    this.busquedaService.setTerm(value);
  }

  ///--- Menu usuario ---
  toggleMenu(ev: MouseEvent) {
    ev.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }

  get initials(): string {
    const name = this.currentUser?.nombre?.trim() || '';
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? 'U';
    const second = parts.length > 1 ? parts[1][0] : '';
    return (first + second).toUpperCase();
  }

  //Sacar "mis compras" para admin
  get esAdmin(): boolean {
    return (this.rolActual ?? '').toLowerCase() === 'admin';
  }

  get esUser(): boolean {
    return (this.rolActual ?? '').toLowerCase() === 'user';
  }

  @HostListener('document:click')
  closeMenu() {
    this.menuOpen = false;
  }
}