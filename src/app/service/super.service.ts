import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Productos } from '../types/productos';
import { Venta } from '../types/venta';

export type CartResult =
  | { ok: true; added: number; msg: string }
  | { ok: false; added: 0; msg: string };

@Injectable({
  providedIn: 'root'
})
export class SuperService {

  private baseUrl = 'http://localhost:3000/productos';
  private ventasUrl = 'http://localhost:3000/ventas';

  private cart = new BehaviorSubject<Productos[]>([]);
  cart$ = this.cart.asObservable();

  constructor(private http: HttpClient) { }

  getProductosPorCategoria(categoria: string): Observable<Productos[]> {
    return this.http.get<Productos[]>(`${this.baseUrl}?categoria=${categoria}`);
  }

  getProductos(): Observable<Productos[]> {
    return this.http.get<Productos[]>(this.baseUrl);
  }

  getProductoPorId(id: string | null): Observable<Productos> {
    return this.http.get<Productos>(`${this.baseUrl}/${id}`)
  }

  ///Cuantas unidades de un producto ya hay en el carrito
  getCantidadEnCarrito(productoId?: string): number {
    if (!productoId) return 0;
    const carrito = this.cart.value;
    const found = carrito.find(p => p.id === productoId);
    return found?.cantidad ?? 0;
  }

  agregarAlCarrito(producto: Productos, cantidad: number): CartResult {
  const stock = producto.stock ?? 0;
  const id = producto.id;

  ///Cantidad segura (entero)
  const cant = Math.floor(Number(cantidad));

  if (!id) return { ok: false, added: 0, msg: 'Producto inválido.' };

  ///Si no hay stock o cantidad invalida, no hago nada
  if (stock <= 0 || !cant || cant < 1) {
    return { ok: false, added: 0, msg: 'No hay stock.' };
  }

  ///Stock disponible teniendo en cuenta lo que ya esta en el carrito
  const yaEnCarrito = this.getCantidadEnCarrito(id);
  const disponible = stock - yaEnCarrito;

  if (disponible <= 0) {
    return { ok: false, added: 0, msg: 'Ya tenés el máximo stock de este producto en el carrito.' };
  }

  ///No permitir agregar más de lo disponible
  const aAgregar = Math.min(cant, disponible);

  ///Clono el carrito para no mutar el array original
  const carrito = [...this.cart.value];
  const idx = carrito.findIndex(p => p.id === id);

  if (idx >= 0) {
    const actual = carrito[idx].cantidad ?? 0;
    carrito[idx] = { ...carrito[idx], cantidad: actual + aAgregar };
  } else {
    carrito.push({ ...producto, cantidad: aAgregar });
  }

  this.cart.next(carrito);

  if (aAgregar < cant) {
    return { ok: true, added: aAgregar, msg: `Solo se agregaron ${aAgregar} por stock disponible.` };
  }

  return { ok: true, added: aAgregar, msg: 'Producto agregado al carrito' };
}

  borrarProducto(productoId: string) {
    const carrito = this.cart.value.filter(item => item.id != productoId);
    this.cart.next(carrito); ///Actualizo despues de eliminar
  }

  actualizarCarrito(carritoActualizado: Productos[]): void {
    this.cart.next(carritoActualizado);
  }

  vaciarCarrito() {
    this.cart.next([]);
  }

  getCarrito(): Observable<Productos[]> {
    return this.cart$; ///Carrito como observable
  }

  actualizarStock(items: Productos[]): Observable<void> {
    return new Observable<void>((observer) => {
      let actualizacionesPendientes = items.length;

      if (items.length === 0) {
        observer.next();
        observer.complete();
        return;
      }

      items.forEach((item) => {
        const url = `${this.baseUrl}/${item.id}`;

        this.http.get<Productos>(url).subscribe({
          next: (producto) => {
            const stockActual = producto.stock ?? 0;
            const cant = item.cantidad ?? 0;

            const updatedProducto = {
              ...producto,
              stock: Math.max(0, stockActual - cant),
            };

            this.http.put(url, updatedProducto).subscribe({
              next: () => {
                actualizacionesPendientes--;
                if (actualizacionesPendientes === 0) {
                  observer.next();
                  observer.complete();
                }
              },
              error: (err) => observer.error(err),
            });
          },
          error: (err) => observer.error(err),
        });
      });
    });
  }

  addProducto(producto: Productos): Observable<Productos> {
    return this.http.post<Productos>(this.baseUrl, producto);
  }

  ///Eliminar del sistema
  deleteProducto(id: String): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateProducto(producto: Productos, id: string | null): Observable<Productos> {
    return this.http.put<Productos>(`${this.baseUrl}/${id}`, producto);
  }

  crearVenta(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.ventasUrl, venta);
  }

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.ventasUrl);
  }

  getVentasPorEmail(email: string): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.ventasUrl}?userEmail=${encodeURIComponent(email)}`);
  }

  getVentaPorId(id: string): Observable<Venta> {
    return this.http.get<Venta>(`${this.ventasUrl}/${id}`);
  }

  ///Buscar producto existente
  buscarProductoExistente(categoria: string, producto: string, marca: string): Observable<Productos[]> {
    const url =
      `${this.baseUrl}?categoria=${encodeURIComponent(categoria)}` +
      `&producto=${encodeURIComponent(producto)}` +
      `&marca=${encodeURIComponent(marca)}`;

    return this.http.get<Productos[]>(url);
  }
}
