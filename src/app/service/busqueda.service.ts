import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BusquedaService {
  private termSubject = new BehaviorSubject<string>(''); ///El term guarda el texto del buscador. Arranca vacio ''
  term$ = this.termSubject.asObservable();

  setTerm(term: string): void { ///Actualiza el texto
    this.termSubject.next(term);
  }

  clear(): void {
    this.termSubject.next('');
  }
}