import { Component, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-sales-home',
  template: `
    <h1 class="page-title">Sales pipeline</h1>
    <p class="text-ink-500">Merchants assigned to {{ store.profile()?.first_name }}.</p>
    <div class="mt-6 grid gap-4 md:grid-cols-2">
      @for (t of store.merchantsForSales(); track t.id) {
        <article class="card p-6">
          <p class="text-xs uppercase tracking-wide text-brand-500">{{ t.plan_name }}</p>
          <h2 class="mt-1 font-display text-2xl">{{ t.name }}</h2>
          <p class="text-sm text-ink-500">{{ t.email }} · {{ t.city }}, {{ t.country }}</p>
          <p class="mt-4 text-sm">Industry: {{ t.industry || '—' }}</p>
          <p class="text-sm">Status: {{ t.status }}</p>
        </article>
      } @empty {
        <p class="text-ink-500">No merchants on your book yet.</p>
      }
    </div>
  `,
})
export class SalesHomeComponent {
  store = inject(StoreService);
}
