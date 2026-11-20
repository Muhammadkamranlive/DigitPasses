import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-merchant-dashboard',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="page-title">{{ store.tenant()?.name }} dashboard</h1>
        <p class="text-ink-500">Issue, redeem, and track digital passes from one desk.</p>
      </div>
      <div class="flex gap-2">
        <a routerLink="/app/passes/new" class="btn-primary">New template</a>
        <a routerLink="/app/redeem" class="btn-secondary">Redeem</a>
      </div>
    </div>

    <section class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (card of cards(); track card.label) {
        <article class="card p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-ink-500">{{ card.label }}</p>
          <p class="mt-2 font-display text-3xl">{{ card.value }}</p>
        </article>
      }
    </section>

    <section class="mt-8 grid gap-6 lg:grid-cols-2">
      <article class="card p-6">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-2xl">Recent ledger</h2>
          <a routerLink="/app/transactions" class="text-sm font-semibold text-brand-600">See all</a>
        </div>
        <ul class="mt-4 divide-y">
          @for (tx of store.transactions().slice(0, 6); track tx.id) {
            <li class="flex items-center justify-between py-3 text-sm">
              <div>
                <p class="font-medium">{{ tx.txn_type }}</p>
                <p class="text-ink-500">{{ tx.customer_email }} · {{ tx.redemption_type }}</p>
              </div>
              <span class="font-semibold" [class.text-danger]="tx.dr_cr_flag === 'D'">
                {{ tx.dr_cr_flag === 'D' ? '-' : '+' }}{{ tx.amount | currency }}
              </span>
            </li>
          } @empty {
            <li class="py-6 text-sm text-ink-500">No movements yet.</li>
          }
        </ul>
      </article>
      <article class="card p-6">
        <h2 class="font-display text-2xl">Merchant vault</h2>
        <p class="mt-4 font-display text-5xl">{{ (store.vaultFor('merchant', store.tenant()?.id)?.amount || 0) | currency }}</p>
        <p class="mt-2 text-sm text-ink-500">
          Issuing a gift card debits this vault. Top it up in a live Stripe/Supabase deployment.
        </p>
        <div class="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl bg-brand-50 p-4">
            <p class="text-ink-500">Templates</p>
            <p class="text-2xl font-bold">{{ store.stats().templates }}</p>
          </div>
          <div class="rounded-xl bg-brand-50 p-4">
            <p class="text-ink-500">Outstanding gift value</p>
            <p class="text-2xl font-bold">{{ store.stats().outstanding | currency }}</p>
          </div>
        </div>
      </article>
    </section>
  `,
})
export class MerchantDashboardComponent {
  store = inject(StoreService);

  cards() {
    const s = this.store.stats();
    return [
      { label: 'Issued passes', value: s.issued },
      { label: 'Redeemed', value: s.redeemed },
      { label: 'Customers', value: s.customers },
      { label: 'Ledger volume', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(s.volume) },
    ];
  }
}
