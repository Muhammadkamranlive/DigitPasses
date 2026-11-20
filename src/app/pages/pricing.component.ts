import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-16">
      <div class="text-center">
        <h1 class="font-display text-5xl">Simple plans for growing brands</h1>
        <p class="mt-3 text-ink-500">Start with gift cards. Add loyalty, punch cards, and POS keys as you scale.</p>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-3">
        @for (plan of plans; track plan.name) {
          <article class="card p-8" [class.ring-2]="plan.featured" [class.ring-brand-500]="plan.featured">
            <p class="text-sm font-semibold uppercase tracking-wide text-brand-500">{{ plan.name }}</p>
            <p class="mt-3 font-display text-5xl">{{ plan.price | currency }}<span class="text-lg text-ink-500">/mo</span></p>
            <p class="mt-3 text-sm text-ink-500">{{ plan.blurb }}</p>
            <ul class="mt-6 space-y-2 text-sm">
              @for (f of plan.features; track f) {
                <li>✓ {{ f }}</li>
              }
            </ul>
            <a routerLink="/register" class="btn-primary mt-8 w-full">{{ plan.cta }}</a>
          </article>
        }
      </div>
    </section>
  `,
})
export class PricingComponent {
  plans = [
    {
      name: 'Starter',
      price: 29,
      blurb: 'One location, gift cards only.',
      features: ['500 cards / month', 'Customer wallet', 'Email issue', 'Basic ledger'],
      cta: 'Start Starter',
      featured: false,
    },
    {
      name: 'Growth',
      price: 79,
      blurb: 'The Sunset Cafe plan — most brands live here.',
      features: ['5,000 cards', 'Loyalty + punch', 'POS API keys', 'QR redemption'],
      cta: 'Choose Growth',
      featured: true,
    },
    {
      name: 'Scale',
      price: 199,
      blurb: 'Multi-location and white-label ready.',
      features: ['Unlimited cards', 'Sales-rep hierarchy', 'Custom branding', 'Priority support'],
      cta: 'Talk to sales',
      featured: false,
    },
  ];
}
