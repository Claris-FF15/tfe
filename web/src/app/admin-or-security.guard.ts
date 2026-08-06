import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, map, take } from 'rxjs';
import { AuthService } from './services/auth.service';

export const adminOrSecurityGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitUntilLoaded().pipe(
    switchMap(() => authService.currentUser$.pipe(take(1))),
    map(user => {
      const allowedRoles = ['admin', 'responsable_securite'];
      if (user && allowedRoles.includes(user.role.name.toLowerCase())) {
        return true;
      }
      router.navigate(['/activities']);
      return false;
    })
  );
};