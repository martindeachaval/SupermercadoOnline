import { Routes } from '@angular/router';
import { RolSelectionComponent } from './rol-selection/rol-selection.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  { path: '', component: RolSelectionComponent },
    ///Rutas cuentas
  { path: 'login/:rol', component: LoginComponent },
  { path: 'register/:rol', component: RegisterComponent },

  ///Rutas lazy protegidas por rol
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canMatch: [roleGuard],
    data: { role: 'User' }
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canMatch: [roleGuard],
    data: { role: 'Admin' }
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];