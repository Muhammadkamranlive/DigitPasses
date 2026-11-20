import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from './models';
import { StoreService } from './store.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(StoreService);
  const router = inject(Router);
  if (store.profile()) return true;
  return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

export const roleGuard = (roles: UserRole[]): CanActivateFn => {
  return () => {
    const store = inject(StoreService);
    const router = inject(Router);
    const role = store.profile()?.role;
    if (role && roles.includes(role)) return true;
    if (!role) return router.createUrlTree(['/login']);
    return router.createUrlTree([store.roleHome(role)]);
  };
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(StoreService);
  const router = inject(Router);
  const profile = store.profile();
  if (!profile) return true;
  return router.createUrlTree([store.roleHome(profile.role)]);
};
