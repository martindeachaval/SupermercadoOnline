export interface VentaItem {
  productoId: string;
  producto: string;
  marca?: string | null;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Venta {
  id?: string;                 // json-server suele generar number
  userEmail: string;
  userNombre: string;
  rol: 'User' | 'Admin';
  createdAt: string;           // ISO date
  total: number;
  items: VentaItem[];
  metodoPago: 'tarjeta';
  tarjetaLast4?: string;
}