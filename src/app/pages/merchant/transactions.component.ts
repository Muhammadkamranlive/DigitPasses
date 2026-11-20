import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-transactions',
  imports: [CurrencyPipe, DatePipe],
  template: `
    <h1 class="page-title">Ledger</h1>
    <p class="text-ink-500">Issuance, in-store, and online movements.</p>
    <div class="card mt-6 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-brand-50 text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th class="px-4 py-3">When</th>
            <th class="px-4 py-3">Type</th>
            <th class="px-4 py-3">Customer</th>
            <th class="px-4 py-3">Channel</th>
            <th class="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          @for (tx of store.transactions(); track tx.id) {
            <tr class="border-t">
              <td class="px-4 py-3 whitespace-nowrap">{{ tx.created_at | date: 'short' }}</td>
              <td class="px-4 py-3">{{ tx.txn_type }}</td>
              <td class="px-4 py-3">{{ tx.customer_email }}</td>
              <td class="px-4 py-3">{{ tx.redemption_type }}</td>
              <td class="px-4 py-3 text-right font-semibold" [class.text-danger]="tx.dr_cr_flag === 'D'">
                {{ tx.dr_cr_flag === 'D' ? '-' : '+' }}{{ tx.amount | currency }}
              </td>
            </tr>
          } @empty {
            <tr><td class="px-4 py-8 text-ink-500" colspan="5">No transactions.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TransactionsComponent {
  store = inject(StoreService);
}
