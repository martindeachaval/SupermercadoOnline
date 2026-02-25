import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAdminComponent } from './home/home-admin/home-admin.component';
import { ListProductosComponent } from '../components/list-productos/list-productos.component';
import { AddProductosComponent } from './components/add-productos/add-productos.component';
import { UpdateProductosComponent } from './components/update-productos/update-productos.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';

const routes: Routes = [
  ///Home por defecto para admin
  { path: '', component: HomeAdminComponent, pathMatch: 'full' },

  ///Estadisticas
  { path: 'estadisticas', component: EstadisticasComponent },

  ///Lista por categoría
  { path: 'productos/:categoria', component: ListProductosComponent },

  ///Alta y edicion
  { path: 'add-productos', component: AddProductosComponent },
  { path: 'update-productos/:id', component: UpdateProductosComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

