import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type Rol = 'User' | 'Admin';

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/usuarios';

  ///Evita crash si el código corre fuera del navegador y no existe localStorage
  private canUseStorage = typeof localStorage !== 'undefined';

  ///Guarda el estado del usuario logueado (arranca en null)
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);

  ///Observable para que los componentes se suscriban y reaccionen a cambios
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    ///Al iniciar el servicio, si hay sesión guardada la recupero (solo si existe localStorage)
    if (this.canUseStorage) {
      this.currentUserSubject.next(this.loadSession());
    }
  }

  ///Registrar usuario
  register(user: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, user);
  }

  ///Verifica si ya existe un email para un rol
  existsEmailForRole(email: string, rol: Rol): Observable<boolean> {
    const url = this.baseUrl + '?email=' + email + '&rol=' + rol; ///Url con parametros

    return this.http.get<Usuario[]>(url).pipe( ///Recibo arreglo de users
      map(users => {
        if (users.length > 0) { ///Si el arreglo tiene 1 user signifia que ya existe en el rol
          return true;
        } else {
          return false;
        }
      })
    );
  }

  ///Login: busca usuario por email + password + rol
  login(email: string, password: string, rol: Rol): Observable<boolean> {

    ///Construimos la URL agregando email, password y rol
    const url = this.baseUrl +
      '?email=' + email +
      '&password=' + password +
      '&rol=' + rol;

    ///Arreglo de users
    return this.http.get<Usuario[]>(url).pipe(
      map(users => {

        ///Uso el primer usuario del arreglo
        const user = users[0];

        ///Si existe un usuario, login
        if (user) {

          this.saveSession(user);

          return true;

        } else {
          return false;
        }
      })
    );
  }

  ///Borra sesión y deja el usuario actual en null
  logout(): void {
    if (this.canUseStorage) {
      localStorage.removeItem('session_user');
    }
    this.currentUserSubject.next(null);
  }

  ///Devuelve el usuario actual (sin suscribirse)
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  ///Guarda usuario en localStorage y actualiza el BehaviorSubject
  private saveSession(user: Usuario): void {
    if (this.canUseStorage) {
      localStorage.setItem('session_user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  ///Lee sesión desde localStorage (si no hay, devuelve null)
  private loadSession(): Usuario | null {
    ///Si no existe localStorage (por ejemplo en SSR), no intento leer nada
    if (!this.canUseStorage) return null;

    const raw = localStorage.getItem('session_user');
    return raw ? (JSON.parse(raw) as Usuario) : null;
  }
}

