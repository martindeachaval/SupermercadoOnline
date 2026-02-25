import { BusquedaService } from './../../service/busqueda.service';
import { Component, OnInit } from '@angular/core';
import { Productos } from '../../types/productos';
import { SuperService } from '../../service/super.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list-productos.component.html',
  styleUrl: './list-productos.component.css'
})
export class ListProductosComponent implements OnInit {

  constructor(private servicio: SuperService, private route: ActivatedRoute, private router: Router, private busquedaService: BusquedaService) {
    this.verificarRutaProdCat();
  }

  productos: Productos[] = [];
  productosBase: Productos[] = [];
  terminoBusqueda = '';

  isUserRoute = false;
  isProdCatRoute = false;

  uiMsg = '';
  uiMsgId: string | null = null;
  private msgTimer: ReturnType<typeof setTimeout> | null = null;

  private showMsg(item: Productos, msg: string) {
    this.uiMsg = msg;
    this.uiMsgId = item.id ?? null;

    if (this.msgTimer) clearTimeout(this.msgTimer);

    this.msgTimer = setTimeout(() => {
      this.uiMsg = '';
      this.uiMsgId = null;
      this.msgTimer = null;
    }, 3000);
  }


  ngOnInit(): void {

    ///Busqueda en el navbar
    this.busquedaService.term$.subscribe((term) => {
      this.terminoBusqueda = (term ?? '').trim().toLowerCase();
      this.aplicarFiltro();
    });

    ///Cargar productos por categoria
    this.route.paramMap.subscribe((params) => {
      const categoria = params.get('categoria');

      if (categoria) {
        this.servicio.getProductosPorCategoria(categoria).subscribe((productos) => {
          this.productosBase = productos.map((p) => ({ ...p, cantidad: 1 }));
          this.aplicarFiltro();
        });
      } else {
        this.servicio.getProductos().subscribe((data) => {
          this.productosBase = data.map((p) => ({ ...p, cantidad: 1 }));
          this.aplicarFiltro();
        });
      }
    });

    this.verificarRutaUser();
  }

  incrementarCantidad(item: Productos) {
    const stock = item.stock ?? 0;

    ///Si no hay stock, no dejar sumar
    if (stock <= 0) {
      item.cantidad = 0;
      this.showMsg(item, 'No hay stock.');
      return;
    }

    const actual = item.cantidad ?? 1;

    if (actual < stock) {
      item.cantidad = actual + 1;
    } else {
      item.cantidad = stock; ///Mantiene en el máximo
      this.showMsg(item, 'No hay suficiente stock.');
    }
  }

  decrementarCantidad(item: Productos) {
    if (item.cantidad! > 1) {
      item.cantidad!--;
    }
  }

  verificarCantidad(item: Productos): void {
    const stock = item.stock ?? 0;
    const cant = Number(item.cantidad);

    ///Si no hay stock forzamos 0
    if (stock <= 0) {
      item.cantidad = 0;
      this.showMsg(item, 'No hay stock');
      return;
    }

    ///Si no es numero o es menor a 1
    if (!cant || cant < 1) {
      item.cantidad = 1;
      this.showMsg(item, 'Debe ingresar una cantidad válida')
      return;
    }

    ///Si hay stock y se paso del maximo
    if (stock > 0 && cant > stock) {
      item.cantidad = stock;
      this.showMsg(item, 'No hay suficiente stock.');
      return;
    }

    ///Si esta bien, guardo la cantidad
    item.cantidad = cant;
  }

  agregarAlCarrito(item: Productos, cantidad: number) {
    const res = this.servicio.agregarAlCarrito(item, cantidad);
    this.showMsg(item, res.msg); 
  }

  ///LO ELIMINA DEL JSON (o del sistema digamos), no del carrito
  eliminarProducto(id?: string): void {
    if (!id) return;
    this.servicio.deleteProducto(id!).subscribe(() => {
      this.productosBase = this.productosBase.filter(p => p.id !== id);
      this.productos = this.productos.filter(p => p.id !== id);
      this.aplicarFiltro();
    })
  }

  aplicarFiltro(): void {
    if (!this.terminoBusqueda) {
      this.productos = [...this.productosBase];
      return;
    }

    const t = this.terminoBusqueda;

    this.productos = this.productosBase.filter((p) => {
      const producto = (p.producto ?? '').toLowerCase();
      const marca = (p.marca ?? '').toLowerCase();
      const desc = (p.descripcion ?? '').toLowerCase();

      return (
        producto.includes(t) ||
        marca.includes(t) ||
        desc.includes(t)
      );
    });
  }

  ///Cambia la UI dependiendo el rol

  verificarRutaUser(): void {
    this.isUserRoute = this.router.url === '/user';
    this.router.events.subscribe(() => {
      this.isUserRoute = this.router.url === '/user';
    });
  }

  verificarRutaProdCat(): void {
    this.router.events.subscribe(() => {
      this.isProdCatRoute = this.router.url.startsWith('/user/productos/');
    });
  }
}
