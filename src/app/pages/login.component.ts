import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../core/demo-data';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="bg-hero-grid py-16">
      <div class="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
        <div class="card p-8">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Welcome back</p>
          <h1 class="mt-2 font-display text-4xl">Sign in</h1>
          <form class="mt-8 space-y-4" (ngSubmit)="submit()">
            <div>
              <label class="label">Email</label>
              <input class="input" name="email" [(ngModel)]="email" type="email" required />
            </div>
            <div>
              <label class="label">Password</label>
              <input class="input" name="password" [(ngModel)]="password" type="password" required />
            </div>
            @if (error()) {
              <p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{{ error() }}</p>
            }
            <button class="btn-primary w-full" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
          </form>
          <p class="mt-6 text-sm text-ink-500">
            New merchant?
            <a routerLink="/register" class="font-semibold text-brand-600">Create an account</a>
          </p>
        </div>
        <div class="rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
          <h2 class="font-display text-2xl">Portfolio demo accounts</h2>
          <p class="mt-2 text-sm text-white/70">
            Password for every user:
            <code class="rounded bg-white/10 px-1.5 py-0.5">{{ passwordHint }}</code>
          </p>
          <ul class="mt-6 space-y-3">
            @for (acct of accounts; track acct.email) {
              <li>
                <button
                  type="button"
                  class="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                  (click)="email = acct.email; password = passwordHint"
                >
                  <p class="text-xs uppercase tracking-wide text-white/60">{{ acct.role }}</p>
                  <p class="font-semibold">{{ acct.email }}</p>
                  <p class="text-sm text-white/70">{{ acct.hint }}</p>
                </button>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private store = inject(StoreService);
  private router = inject(Router);
  accounts = DEMO_ACCOUNTS;
  passwordHint = DEMO_PASSWORD;
  email = 'merchant@arenascards.com';
  password = DEMO_PASSWORD;
  busy = signal(false);
  error = signal('');

  async submit() {
    this.busy.set(true);
    this.error.set('');
    try {
      const user = await this.store.login(this.email, this.password);
      await this.router.navigateByUrl(this.store.roleHome(user.role));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      this.busy.set(false);
    }
  }
}
