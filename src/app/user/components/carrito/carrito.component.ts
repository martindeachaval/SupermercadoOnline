import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { switchMap } from 'rxjs';
import { SuperService } from '../../../service/super.service';
import { Productos } from '../../../types/productos';
import { AuthService } from '../../../auth/auth.service';
import { Venta } from '../../../types/venta';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent implements OnInit {
  items: Productos[] = []; /// Almacena los productos del carrito
  mostrarFormulario: boolean = false;

  formMsg = '';
  pagoMsg = '';

  constructor(
    private servicio: SuperService,
    private route: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.servicio.getCarrito().subscribe((productos: Productos[]) => {
      this.items = productos;
    });
  }

  getTotal(): number {
    ///Calcula el total sumando precio * cantidad
    return this.items.reduce(
      (total, item) => total + ((item.precio || 0) * (item.cantidad || 1)),
      0
    );
  }

  incrementarCantidad(item: Productos): void {
    this.formMsg = ''; ///Limpia mensaje anterior

    const stock = item.stock ?? 0;
    const actual = item.cantidad ?? 1;

    ///Si no hay stock
    if (stock <= 0) {
      item.cantidad = 0;
      this.formMsg = 'No hay stock.';
      return;
    }

    ///Si puede sumar
    if (actual + 1 <= stock) {
      item.cantidad = actual + 1;
      this.servicio.actualizarCarrito(this.items);
      return;
    }

    ///Si se pasa
    this.formMsg = 'No hay suficiente stock.';
  }

  decrementarCantidad(item: Productos): void {
    this.formMsg = ''; ///Limpia mensaje anterior

    const actual = item.cantidad ?? 1;
    if (actual > 1) {
      item.cantidad = actual - 1;
      this.servicio.actualizarCarrito(this.items);
    }
  }

  eliminarProducto(productoId: string): void {
    ///Elimina un producto del carrito
    this.servicio.borrarProducto(productoId);
  }

  vaciarCarrito(): void {
    this.servicio.vaciarCarrito();
  }

  private fb = inject(FormBuilder);

  ///Validador de vencimiento
  private vencimientoValidator = (group: AbstractControl): ValidationErrors | null => {
    const mesCtrl = group.get('mes');
    const anioCtrl = group.get('anio');

    const mesStr = (mesCtrl?.value ?? '').toString().trim();
    const anioStr = (anioCtrl?.value ?? '').toString().trim();

    ///Si no hay datos, lo maneja required
    if (!mesStr || !anioStr) return null;

    const mes = Number(mesStr);
    const anio = Number(anioStr);

    ///Validacion de mes
    if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
      mesCtrl?.setErrors({ ...(mesCtrl.errors ?? {}), invalidMonth: true });
      return null;
    }

    ///Validacion de año (4 dígitos)
    if (!Number.isInteger(anio) || anioStr.length !== 4) {
      anioCtrl?.setErrors({ ...(anioCtrl.errors ?? {}), invalidYear: true });
      return null;
    }

    ///Comparo mes/año con el actual
    const hoy = new Date();
    const elegido = anio * 12 + (mes - 1);
    const actual = hoy.getFullYear() * 12 + hoy.getMonth();

    if (elegido < actual) {
      return { expired: true };
    }

    return null;
  };

  form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      numero: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      mes: ['', [Validators.required]],
      anio: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    },
    { validators: [this.vencimientoValidator] }
  );

  procesarPago(): void {
    this.pagoMsg = ''; ///Limpia mensaje anterior

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.getCurrentUser?.() ?? null;
    if (!user) {
      this.pagoMsg = 'Tenés que iniciar sesión para pagar.';
      setTimeout(() => this.route.navigate(['/login', 'user']), 1500);
      return;
    }

    const total = this.getTotal();
    const numero = (this.form.get('numero')?.value ?? '').toString();
    const last4 = numero.slice(-4);

    const venta: Venta = {
      userEmail: user.email,
      userNombre: user.nombre,
      rol: user.rol,
      createdAt: new Date().toISOString(),
      total,
      metodoPago: 'tarjeta',
      tarjetaLast4: last4,
      items: this.items.map(it => ({
        productoId: it.id,
        producto: it.producto ?? '',
        marca: it.marca,
        precio: it.precio ?? 0,
        cantidad: it.cantidad ?? 1,
        subtotal: (it.precio ?? 0) * (it.cantidad ?? 1),
      })),
    };

    this.servicio.actualizarStock(this.items).pipe(
      switchMap(() => this.servicio.crearVenta(venta))
    ).subscribe({
      next: (ventaCreada) => {
        this.pagoMsg = 'Pago procesado exitosamente.';
        setTimeout(() => {
          this.vaciarCarrito();
          this.mostrarFormulario = false;
          this.route.navigate(['/user/recibo', ventaCreada.id]);
        }, 2700);
      },
      error: (err) => {
        console.error(err);
        this.pagoMsg = 'Hubo un problema al procesar la compra.';
        setTimeout(() => (this.formMsg = ''), 3000);
      }
    });
  }
}

