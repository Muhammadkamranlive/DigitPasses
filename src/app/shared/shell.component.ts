import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { displayName } from '../core/models';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#f4f2fb]">
      <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-brand-100 bg-white md:flex md:flex-col">
        <a routerLink="/" class="flex items-center gap-2 px-5 py-5">
          <img src="assets/brand/logo.png" alt="Arenas Cards" class="h-8" />
        </a>
        <nav class="flex-1 space-y-1 px-3">
          @for (item of nav(); track item.to) {
            <a
              [routerLink]="item.to"
              routerLinkActive="bg-brand-50 text-brand-700"
              [routerLinkActiveOptions]="{ exact: item.exact === true }"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 whitespace-nowrap"
            >
              <span class="text-lg">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="m-3 rounded-2xl bg-hero-grid p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/70">{{ store.tenant()?.plan_name || 'Arenas' }}</p>
          <p class="mt-1 font-display text-lg">{{ store.tenant()?.name || 'Platform' }}</p>
          <p class="mt-2 text-xs text-white/70">{{ displayName(store.profile()) }}</p>
        </div>
      </aside>

      <div class="md:pl-64">
        <header class="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-brand-100 bg-white/80 px-4 py-3 backdrop-blur">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-brand-500">{{ store.profile()?.role?.replaceAll('_', ' ') }}</p>
            <p class="font-semibold">{{ displayName(store.profile()) }}</p>
          </div>
          <div class="flex items-center gap-2">
            @if (store.demoMode) {
              <span class="chip bg-amber-100 text-amber-800">Demo mode</span>
            }
            <button class="btn-secondary" (click)="logout()">Log out</button>
          </div>
        </header>
        <main class="px-4 py-6 md:px-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  store = inject(StoreService);
  private router = inject(Router);
  displayName = displayName;

  nav() {
    const role = this.store.profile()?.role;
    if (role === 'customer') {
      return [
        { to: '/wallet', label: 'My wallet', icon: '👛', exact: true },
        { to: '/wallet/activity', label: 'Activity', icon: '📜', exact: false },
      ];
    }
    if (role === 'super_admin') {
      return [
        { to: '/admin', label: 'Overview', icon: '📊', exact: true },
        { to: '/admin/tenants', label: 'Tenants', icon: '🏢', exact: false },
      ];
    }
    if (role === 'sales_rep') {
      return [{ to: '/sales', label: 'My merchants', icon: '🤝', exact: true }];
    }
    return [
      { to: '/app', label: 'Dashboard', icon: '📊', exact: true },
      { to: '/app/passes', label: 'Pass templates', icon: '🎫', exact: false },
      { to: '/app/issue', label: 'Issue pass', icon: '📤', exact: false },
      { to: '/app/redeem', label: 'Redeem', icon: '📷', exact: false },
      { to: '/app/customers', label: 'Customers', icon: '👥', exact: false },
      { to: '/app/transactions', label: 'Ledger', icon: '📒', exact: false },
      { to: '/app/developer', label: 'POS API', icon: '🔑', exact: false },
    ];
  }

  async logout() {
    await this.store.logout();
    await this.router.navigateByUrl('/');
  }
}
