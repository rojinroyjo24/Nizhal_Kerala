import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getCurrentUser();

  if (auth.isLoggedIn() && user?.is_staff) {
    return true;
  }

  return router.createUrlTree(['/']);
};
