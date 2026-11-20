import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PASS_TYPE_META } from '../core/models';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <section class="relative overflow-hidden bg-hero-grid text-white">
      <div class="pointer-events-none absolute inset-0 opacity-40" style="background-image: radial-gradient(circle at 20% 20%, #6c60fe 0, transparent 35%), radial-gradient(circle at 80% 0%, #175cff 0, transparent 30%);"></div>
      <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p class="chip bg-white/10 text-white">Digital pass infrastructure</p>
          <h1 class="mt-5 font-display text-4xl leading-tight md:text-6xl">
            Launch your own digital gift cards in minutes.
          </h1>
          <p class="mt-5 max-w-xl text-lg text-white/80">
            Arenas Cards lets restaurants, retailers, and brands create, distribute, and redeem
            virtual gift cards, loyalty programs, memberships, and punch cards — with a POS-ready API.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/register" class="btn-primary">Start now</a>
            <a routerLink="/login" class="btn-secondary">Try the live demo</a>
          </div>
          <dl class="mt-10 grid grid-cols-3 gap-4 text-sm">
            <div><dt class="text-white/60">Pass types</dt><dd class="text-2xl font-bold">4</dd></div>
            <div><dt class="text-white/60">Roles</dt><dd class="text-2xl font-bold">5</dd></div>
            <div><dt class="text-white/60">Stack</dt><dd class="text-2xl font-bold">Supabase</dd></div>
          </dl>
        </div>
        <div class="relative">
          <img src="assets/landing/hero.png" alt="Arenas Cards product" class="relative z-10 w-full rounded-3xl shadow-pass" />
          <img src="assets/landing/mobile.png" alt="Mobile wallet" class="absolute -bottom-8 -left-6 hidden w-36 rounded-2xl shadow-card md:block" />
        </div>
      </div>
    </section>

    <section id="product" class="mx-auto max-w-6xl px-4 py-20">
      <div class="mx-auto max-w-3xl text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Why Arenas</p>
        <h2 class="mt-3 font-display text-4xl">One platform for gift, loyalty, and wallet passes</h2>
        <p class="mt-4 text-ink-500">
          Design a pass, issue it to a customer, scan the QR in-store, and watch the ledger update —
          the same flow the original Azure/SQL product ran, rebuilt on Angular, Tailwind, and Postgres.
        </p>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <article class="card p-6">
          <img src="assets/landing/merchant.png" alt="Merchant dashboard" class="mb-4 rounded-xl" />
          <h3 class="font-display text-xl">Merchant studio</h3>
          <p class="mt-2 text-sm text-ink-500">Live color pickers, serial numbers, and Apple-wallet style previews.</p>
        </article>
        <article class="card p-6">
          <img src="assets/landing/instore.png" alt="In-store redemption" class="mb-4 rounded-xl" />
          <h3 class="font-display text-xl">In-store redemption</h3>
          <p class="mt-2 text-sm text-ink-500">Look up by serial or email. Partial gift-card spend. Punch stamps. Points.</p>
        </article>
        <article class="card p-6">
          <img src="assets/landing/api.png" alt="Developer API" class="mb-4 rounded-xl" />
          <h3 class="font-display text-xl">POS developer API</h3>
          <p class="mt-2 text-sm text-ink-500">Public/private keys per tenant to validate and redeem from a register.</p>
        </article>
      </div>
    </section>

    <section id="passes" class="bg-white py-20">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="font-display text-4xl">Pass types you can ship today</h2>
        <div class="mt-8 grid gap-4 md:grid-cols-4">
          @for (key of types; track key) {
            <article class="rounded-2xl bg-gradient-to-br p-5 text-white shadow-card {{ meta[key].accent }}">
              <p class="text-3xl">{{ meta[key].icon }}</p>
              <h3 class="mt-4 font-display text-2xl">{{ meta[key].label }}</h3>
              <p class="mt-2 text-sm text-white/80">{{ meta[key].blurb }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-20">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <img src="assets/landing/customer.png" alt="Customer wallet" class="rounded-3xl shadow-card" />
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Customer vault</p>
          <h2 class="mt-3 font-display text-4xl">A wallet customers actually want to open</h2>
          <ul class="mt-6 space-y-3 text-ink-700">
            <li>QR + barcode serials on every issued pass</li>
            <li>Gift balances, loyalty points, and punch progress</li>
            <li>Full transaction history per card</li>
            <li>Guest issue by email — no app install required to start</li>
          </ul>
          <a routerLink="/login" class="btn-primary mt-8">Open the customer demo</a>
        </div>
      </div>
    </section>

    <section class="bg-brand-900 py-16 text-white">
      <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center">
        <div>
          <h2 class="font-display text-3xl">See the rebuild, not just the pitch deck.</h2>
          <p class="mt-2 text-white/70">Log in as merchant, customer, admin, sales, or developer — one password.</p>
        </div>
        <a routerLink="/login" class="btn-primary bg-white text-brand-700 hover:bg-brand-50">Launch demo</a>
      </div>
    </section>
  `,
})
export class LandingComponent {
  meta = PASS_TYPE_META;
  types: Array<keyof typeof PASS_TYPE_META> = ['gift_card', 'loyalty_card', 'membership_card', 'punch_card'];
}
