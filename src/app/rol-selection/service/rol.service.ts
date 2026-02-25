import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  constructor() { }

  private rolSubject = new BehaviorSubject<string | null>(null); ///Guarda valor actual. Arranca en null
  rol$ = this.rolSubject.asObservable(); ///rol$ es oobservable para que los componentes se suscriban y se enteren cuando cambia el rol

  setRol(rol: 'User' | 'Admin') { ///Actualiza rol
    this.rolSubject.next(rol);
  }

  getRol() {
    return this.rolSubject.value;
  }


}
