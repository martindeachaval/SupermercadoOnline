import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, Rol } from './auth.service';

export const roleGuard: CanMatchFn = (route) => { ///Guard funcional que recibe info de la ruta.
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();
  const requiredRole = route.data?.['role'] as Rol | undefined;

  if (!user) { ///Si no hay user nos manda al login
    const r = (requiredRole ?? 'User').toLocaleLowerCase(); ///El rol que pide la ruta, por defecto es user
    return router.parseUrl(`/login/${r}`); 
  }
  ///Si hay un user pero no coincide con el rol, lo redirigimos
  if (requiredRole && user.rol !== requiredRole) {
    return router.parseUrl(`/login/${requiredRole.toLowerCase()}`);
  }

  return true;
};