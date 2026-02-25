import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Venta } from '../../../types/venta';
import { SuperService } from '../../../service/super.service';

//Tipo local del componente(preguntar si es mejor o conviene crear un tipo aparte como en types). Como solo lo voy a usar aca creo que esta bien definirlo aca
type TopProducto = { producto: string; marca?: string | null; cantidad: number; facturado: number };

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {

  ventas: Venta[] = [];

  totalFacturado = 0;
  cantidadVentas = 0;
  ticketPromedio = 0;

  topProductos: TopProducto[] = [];

  constructor(private superService: SuperService) { }

  ngOnInit(): void {
    this.superService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data ?? [];   ///Si data viene null, usamos el array vacio
        this.calcular();
      },
      error: (e) => {
        console.error(e);
      }
    });
  }

  private calcular(): void {
    ///Cantidad de ventas
    this.cantidadVentas = this.ventas.length;

    ///Total facturado
    let total = 0;

    ///Productos repetidos
    const acumulados: TopProducto[] = [];

    // Recorro cada venta
    for (let i = 0; i < this.ventas.length; i++) {
      const venta = this.ventas[i];

      ///Sumo el total de la venta (si existe)
      if (venta.total != null) {
        total = total + venta.total;
      }

      ///Recorro los items de esa venta (si no hay, no hago nada)
      const items = venta.items || [];

      for (let j = 0; j < items.length; j++) {
        const it = items[j];

        const producto = it.producto || "";
        const marca = it.marca || null;

        ///Busco si este producto+marca ya esta en acumulados
        let encontrado = false;

        for (let k = 0; k < acumulados.length; k++) {
          const a = acumulados[k];

          ///Si coincide producto y marca, lo actualizo
          if (a.producto === producto && a.marca === marca) {
            const cant = it.cantidad != null ? it.cantidad : 0;
            a.cantidad = a.cantidad + cant;

            ///Facturado: uso subtotal si existe, si no precio*cantidad
            if (it.subtotal != null) {
              a.facturado = a.facturado + it.subtotal;
            } else {
              const precio = it.precio != null ? it.precio : 0;
              a.facturado = a.facturado + (precio * cant);
            }

            encontrado = true;
            break; ///Si lo encuentra corta
          }
        }

        ///Si no estaba, lo agrego como nuevo
        if (encontrado === false) {
          const cant = it.cantidad != null ? it.cantidad : 0;

          let fact = 0;
          if (it.subtotal != null) {
            fact = it.subtotal;
          } else {
            const precio = it.precio != null ? it.precio : 0;
            fact = precio * cant;
          }

          acumulados.push({
            producto: producto,
            marca: marca,
            cantidad: cant,
            facturado: fact
          });
        }
      }
    }

    ///Guardo el total facturado
    this.totalFacturado = total;

    ///Ticket promedio
    if (this.cantidadVentas > 0) {
      this.ticketPromedio = total / this.cantidadVentas;
    } else {
      this.ticketPromedio = 0;
    }

    ///Top 5 por cantidad
    acumulados.sort(function (a, b) {
      return b.cantidad - a.cantidad;
    });

    this.topProductos = acumulados.slice(0, 5);
  }
}
