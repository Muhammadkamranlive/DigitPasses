import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-admin-home',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="page-title">Arenas platform</h1>
        <p class="text-ink-500">Super-admin view of every tenant, pass, and ledger movement.</p>
      </div>
      <a routerLink="/admin/tenants" class="btn-secondary">Manage tenants</a>
    </div>

    <section class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="card p-5">
        <p class="text-xs uppercase tracking-wide text-ink-500">Tenants</p>
        <p class="font-display text-3xl">{{ store.allTenants().length }}</p>
      </article>
      <article class="card p-5">
        <p class="text-xs uppercase tracking-wide text-ink-500">Users</p>
        <p class="font-display text-3xl">{{ store.allProfiles().length }}</p>
      </article>
      <article class="card p-5">
        <p class="text-xs uppercase tracking-wide text-ink-500">Issued passes</p>
        <p class="font-display text-3xl">{{ store.stats().issued }}</p>
      </article>
      <article class="card p-5">
        <p class="text-xs uppercase tracking-wide text-ink-500">Platform vault</p>
        <p class="font-display text-3xl">{{ (store.vaultFor('platform')?.amount || 0) | currency }}</p>
      </article>
    </section>

    <section class="mt-8 grid gap-6 lg:grid-cols-2">
      <article class="card overflow-x-auto">
        <div class="flex items-center justify-between px-4 pt-4">
          <h2 class="font-display text-xl">Tenants</h2>
          <a routerLink="/admin/tenants" class="text-sm font-semibold text-brand-600">All people</a>
        </div>
        <table class="mt-2 w-full text-left text-sm">
          <thead class="text-xs uppercase text-ink-500">
            <tr>
              <th class="px-4 py-2">Company</th>
              <th class="px-4 py-2">Plan</th>
              <th class="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            @for (t of store.allTenants(); track t.id) {
              <tr class="border-t">
                <td class="px-4 py-3">
                  <p class="font-medium">{{ t.name }}</p>
                  <p class="text-ink-500">{{ t.email }}</p>
                </td>
                <td class="px-4 py-3">{{ t.plan_name }}</td>
                <td class="px-4 py-3">
                  <span class="chip" [class.bg-emerald-100]="t.status === 'active'" [class.text-emerald-800]="t.status === 'active'" [class.bg-amber-100]="t.status !== 'active'">
                    {{ t.status }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </article>

      <article class="card p-4">
        <h2 class="font-display text-xl">Plans</h2>
        <ul class="mt-3 divide-y text-sm">
          @for (plan of store.plans(); track plan.id) {
            <li class="flex items-center justify-between py-3">
              <div>
                <p class="font-medium">{{ plan.plan_name }}</p>
                <p class="text-ink-500">{{ plan.plan_description }}</p>
              </div>
              <p class="font-display text-xl">{{ plan.price | currency }}</p>
            </li>
          }
        </ul>
      </article>
    </section>

    <article class="card mt-8 overflow-x-auto">
      <h2 class="px-4 pt-4 font-display text-xl">Issued passes across tenants</h2>
      <table class="mt-2 w-full text-left text-sm">
        <thead class="bg-brand-50 text-xs uppercase text-ink-500">
          <tr>
            <th class="px-4 py-3">Serial</th>
            <th class="px-4 py-3">Type</th>
            <th class="px-4 py-3">Holder</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Issued</th>
          </tr>
        </thead>
        <tbody>
          @for (p of store.issuedPasses(); track p.id) {
            <tr class="border-t">
              <td class="px-4 py-3 font-mono text-xs">{{ p.serial_number }}</td>
              <td class="px-4 py-3">{{ p.type.replaceAll('_', ' ') }}</td>
              <td class="px-4 py-3">{{ p.card_holder_name }} · {{ p.email }}</td>
              <td class="px-4 py-3">{{ p.status.replaceAll('_', ' ') }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ p.created_at | date: 'mediumDate' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </article>
  `,
})
export class AdminHomeComponent {
  store = inject(StoreService);
}
