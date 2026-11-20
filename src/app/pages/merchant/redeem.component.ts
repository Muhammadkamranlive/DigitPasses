import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WalletPass } from '../../core/models';
import { StoreService } from '../../core/store.service';
import { PassCardComponent } from '../../shared/pass-card.component';

@Component({
  selector: 'app-redeem',
  imports: [FormsModule, PassCardComponent],
  template: `
    <h1 class="page-title">Redeem</h1>
    <p class="text-ink-500">Look up by serial or customer email, then take a payment, punch, or points burn.</p>

    <div class="mt-8 grid gap-8 lg:grid-cols-2">
      <div class="card space-y-4 p-6">
        <div>
          <label class="label">Serial or email</label>
          <input class="input" name="q" [(ngModel)]="query" placeholder="GC-260913-LENA01" />
        </div>
        <button type="button" class="btn-secondary" (click)="lookup()">Find pass</button>
        @if (found(); as card) {
          <form class="space-y-4 border-t pt-4" (ngSubmit)="take()">
            <p class="text-sm text-ink-500">
              {{ card.card_holder_name }} · {{ card.type.replaceAll('_', ' ') }}
              @if (card.type === 'gift_card') {
                · balance {{ card.currency_sign }}{{ card.balance }}
              }
            </p>
            @if (card.type === 'gift_card') {
              <div>
                <label class="label">Amount to redeem</label>
                <input class="input" type="number" step="0.01" name="amt" [(ngModel)]="amount" />
              </div>
            }
            @if (card.type === 'loyalty_card') {
              <div>
                <label class="label">Points to burn</label>
                <input class="input" type="number" name="pts" [(ngModel)]="amount" />
              </div>
            }
            <div>
              <label class="label">Channel</label>
              <select class="input" name="kind" [(ngModel)]="kind">
                <option value="in_store">In store</option>
                <option value="online">Online</option>
              </select>
            </div>
            @if (error()) {
              <p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{{ error() }}</p>
            }
            @if (ok()) {
              <p class="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Redemption posted.</p>
            }
            <button class="btn-primary" [disabled]="busy()">
              {{ busy() ? 'Posting…' : card.type === 'punch_card' ? 'Stamp punch' : 'Redeem' }}
            </button>
          </form>
        }
      </div>
      @if (found(); as card) {
        <app-pass-card [pass]="card" />
      } @else {
        <article class="card p-6">
          <h2 class="font-display text-xl">Open redeemable passes</h2>
          <ul class="mt-4 space-y-2 text-sm">
            @for (p of redeemable(); track p.id) {
              <li>
                <button class="w-full rounded-xl bg-brand-50 px-3 py-2 text-left hover:bg-brand-100" (click)="select(p)">
                  <span class="font-mono">{{ p.serial_number }}</span>
                  <span class="block text-ink-500">{{ p.card_holder_name }} · {{ p.email }}</span>
                </button>
              </li>
            }
          </ul>
        </article>
      }
    </div>
  `,
})
export class RedeemComponent {
  store = inject(StoreService);
  query = 'GC-260913-LENA01';
  amount = 10;
  kind = 'in_store';
  found = signal<WalletPass | null>(null);
  error = signal('');
  ok = signal(false);
  busy = signal(false);

  redeemable() {
    return this.store.issuedPasses().filter((p) => ['redeemable', 'partially_redeemed'].includes(p.status));
  }

  lookup() {
    this.ok.set(false);
    this.error.set('');
    const q = this.query.trim().toLowerCase();
    const match =
      this.store.passBySerial(this.query) ||
      this.store.issuedPasses().find((p) => p.email?.toLowerCase() === q);
    this.found.set(match ?? null);
    if (!match) this.error.set('No matching redeemable pass.');
  }

  select(p: WalletPass) {
    this.query = p.serial_number;
    this.found.set(p);
    this.error.set('');
    this.ok.set(false);
  }

  async take() {
    const card = this.found();
    if (!card) return;
    this.error.set('');
    this.ok.set(false);
    this.busy.set(true);
    try {
      const next = await this.store.redeem(card.serial_number, Number(this.amount), this.kind);
      this.found.set(next);
      this.ok.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Redeem failed');
    } finally {
      this.busy.set(false);
    }
  }
}
