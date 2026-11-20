import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-xl px-4 py-16">
      <div class="card p-8">
        <h1 class="font-display text-4xl">Create your Arenas account</h1>
        <p class="mt-2 text-sm text-ink-500">Merchants get a tenant, vault, and API keys automatically.</p>
        <form class="mt-8 grid gap-4" (ngSubmit)="submit()">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="label">First name</label>
              <input class="input" name="first" [(ngModel)]="first" required />
            </div>
            <div>
              <label class="label">Last name</label>
              <input class="input" name="last" [(ngModel)]="last" required />
            </div>
          </div>
          <div>
            <label class="label">Email</label>
            <input class="input" type="email" name="email" [(ngModel)]="email" required />
          </div>
          <div>
            <label class="label">Password</label>
            <input class="input" type="password" name="password" [(ngModel)]="password" required minlength="6" />
          </div>
          <div>
            <label class="label">I am a</label>
            <select class="input" name="role" [(ngModel)]="role">
              <option value="merchant">Merchant / brand</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          @if (role === 'merchant') {
            <div>
              <label class="label">Company</label>
              <input class="input" name="company" [(ngModel)]="company" placeholder="Sunset Cafe" />
            </div>
          }
          @if (error()) {
            <p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{{ error() }}</p>
          }
          <button class="btn-primary" [disabled]="busy()">{{ busy() ? 'Creating…' : 'Create account' }}</button>
        </form>
        <p class="mt-6 text-sm text-ink-500">Already have an account? <a routerLink="/login" class="font-semibold text-brand-600">Log in</a></p>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  private store = inject(StoreService);
  private router = inject(Router);
  first = '';
  last = '';
  email = '';
  password = '';
  company = '';
  role: 'merchant' | 'customer' = 'merchant';
  busy = signal(false);
  error = signal('');

  async submit() {
    this.busy.set(true);
    this.error.set('');
    try {
      const user = await this.store.register({
        email: this.email,
        password: this.password,
        first_name: this.first,
        last_name: this.last,
        role: this.role,
        company: this.company,
      });
      await this.router.navigateByUrl(this.store.roleHome(user.role));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not register');
    } finally {
      this.busy.set(false);
    }
  }
}
