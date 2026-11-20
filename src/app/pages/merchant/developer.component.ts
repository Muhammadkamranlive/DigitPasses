import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-developer',
  imports: [],
  template: `
    <h1 class="page-title">POS developer API</h1>
    <p class="text-ink-500">
      Same contract as the original GiftCardDev endpoints — validate and redeem by serial with tenant keys.
    </p>

    @if (store.license(); as keys) {
      <div class="card mt-6 space-y-4 p-6">
        <div>
          <p class="label">Public key</p>
          <code class="block rounded-xl bg-ink-50 px-3 py-2 text-sm">{{ keys.public_key }}</code>
        </div>
        <div>
          <p class="label">Private key</p>
          <code class="block rounded-xl bg-ink-50 px-3 py-2 text-sm">{{ keys.private_key }}</code>
        </div>
        <button class="btn-secondary" [disabled]="busy()" (click)="rotate()">
          {{ busy() ? 'Rotating…' : 'Rotate keys' }}
        </button>
      </div>
    }

    <article class="card mt-6 p-6 text-sm leading-relaxed">
      <h2 class="font-display text-2xl">Example</h2>
      <pre class="mt-4 overflow-x-auto rounded-2xl bg-ink-900 p-4 text-xs text-brand-100">GET /rest/v1/rpc/redeem_pass
Headers:
  apikey: SUPABASE_ANON_KEY
  Authorization: Bearer USER_JWT
  Public-Key: {{ store.license()?.public_key }}
  Private-Key: {{ store.license()?.private_key }}

Body:
  {{ '{' }} "p_serial": "GC-260913-LENA01", "p_amount": 10, "p_kind": "in_store" {{ '}' }}</pre>
      <p class="mt-4 text-ink-500">
        In demo mode the Angular app performs the same rules client-side. Point
        <code>environment.ts</code> at Supabase to use the Postgres RPCs.
      </p>
    </article>
  `,
})
export class DeveloperComponent {
  store = inject(StoreService);
  busy = signal(false);

  async rotate() {
    this.busy.set(true);
    try {
      await this.store.rotateKeys();
    } finally {
      this.busy.set(false);
    }
  }
}
