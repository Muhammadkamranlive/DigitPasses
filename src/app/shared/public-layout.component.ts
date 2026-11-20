import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-ink-50">
      <header class="sticky top-0 z-40 border-b border-white/10 bg-[#0e0e46]/80 backdrop-blur-xl">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a routerLink="/" class="flex items-center gap-2">
            <img src="assets/brand/logo.png" alt="Arenas Cards" class="h-9 w-auto brightness-0 invert" />
          </a>
          <nav class="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
            <a routerLink="/" fragment="product" class="hover:text-white">Product</a>
            <a routerLink="/" fragment="passes" class="hover:text-white">Pass types</a>
            <a routerLink="/pricing" routerLinkActive="text-white" class="hover:text-white">Pricing</a>
            <a routerLink="/contact" routerLinkActive="text-white" class="hover:text-white">Contact</a>
          </nav>
          <div class="flex items-center gap-2">
            @if (store.profile(); as user) {
              <a class="btn-secondary" [routerLink]="store.roleHome(user.role)">Open app</a>
            } @else {
              <a routerLink="/login" class="btn-ghost text-white">Log in</a>
              <a routerLink="/register" class="btn-primary">Start free</a>
            }
          </div>
        </div>
      </header>
      <router-outlet />
      <footer class="border-t border-ink-100 bg-white">
        <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
          <div class="md:col-span-2">
            <img src="assets/brand/logo.png" alt="Arenas Cards" class="h-8" />
            <p class="mt-3 max-w-md text-sm text-ink-500">
              Digital pass infrastructure for restaurants, retailers, and brands — gift cards, loyalty,
              memberships, and punch cards with POS-ready APIs.
            </p>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-ink-500">Product</p>
            <div class="mt-3 flex flex-col gap-2 text-sm">
              <a routerLink="/pricing">Pricing</a>
              <a routerLink="/register">Create a merchant</a>
              <a routerLink="/login">Customer wallet</a>
            </div>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-ink-500">Demo</p>
            <p class="mt-3 text-sm text-ink-500">Password for every demo user:</p>
            <code class="mt-1 inline-block rounded-lg bg-brand-50 px-2 py-1 text-sm text-brand-700">demo1234</code>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {
  store = inject(StoreService);
}
