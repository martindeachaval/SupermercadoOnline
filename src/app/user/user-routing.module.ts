import { HomeUserComponent } from './home/home-user/home-user.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListProductosComponent } from '../components/list-productos/list-productos.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { HistorialComprasComponent } from './components/historial-compras/historial-compras.component';
import { ReciboComponent } from './components/recibo/recibo/recibo.component';

const routes: Routes = [
  {path:'', component: HomeUserComponent},
  
  {path: 'carrito', component: CarritoComponent },
  {path: 'historial', component: HistorialComprasComponent},
  {path: 'recibo/:id', component: ReciboComponent},
  
  {
    path: 'productos/:categoria', component: ListProductosComponent,
    children: [
      { path: 'congelados', component: ListProductosComponent },
      { path: 'panificados', component: ListProductosComponent },
      { path: 'limpieza', component: ListProductosComponent },
      { path: 'bebidas-S-A', component: ListProductosComponent },
      { path: 'lacteos-y-frescos', component: ListProductosComponent },
      { path: 'verduleria', component: ListProductosComponent },
      { path: 'almacen', component: ListProductosComponent },
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
