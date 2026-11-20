import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { PassCardComponent } from '../../shared/pass-card.component';

@Component({
  selector: 'app-wallet',
  imports: [PassCardComponent, RouterLink, CurrencyPipe],
  template: `
    <h1 class="page-title">Your wallet</h1>
    <p class="text-ink-500">Passes issued to {{ store.profile()?.email }}.</p>

    <article class="card mt-6 p-6">
      <p class="text-xs font-semibold uppercase tracking-wide text-ink-500">Vault</p>
      <p class="font-display text-4xl">{{ (store.myVault()?.amount || 0) | currency }}</p>
    </article>

    <div class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      @for (pass of store.issuedPasses(); track pass.id) {
        <a [routerLink]="['/wallet/pass', pass.id]">
          <app-pass-card [pass]="pass" />
        </a>
      } @empty {
        <p class="text-ink-500">No passes yet. Ask Sunset Cafe to issue one to this email.</p>
      }
    </div>
  `,
})
export class WalletComponent {
  store = inject(StoreService);
}
