import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { ListProductosComponent } from '../components/list-productos/list-productos.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { HomeUserComponent } from './home/home-user/home-user.component';


@NgModule({
  declarations:[],
  imports: [
    CommonModule,
    UserRoutingModule,
    HomeUserComponent, 
    ListProductosComponent,
    CarritoComponent 
  ]
})
export class UserModule { }
