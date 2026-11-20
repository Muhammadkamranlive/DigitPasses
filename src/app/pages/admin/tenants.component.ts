import { Component, inject, signal } from '@angular/core';
import { displayName } from '../../core/models';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-admin-tenants',
  template: `
    <h1 class="page-title">Tenants & people</h1>
    <p class="text-ink-500">Activate or pause a merchant without leaving the admin desk.</p>
    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <article class="card overflow-x-auto">
        <h2 class="px-4 pt-4 font-display text-xl">Companies</h2>
        <ul class="divide-y p-4 text-sm">
          @for (t of store.allTenants(); track t.id) {
            <li class="flex items-start justify-between gap-3 py-3">
              <div>
                <p class="font-medium">{{ t.name }}</p>
                <p class="text-ink-500">{{ t.plan_name }} · {{ t.city || '—' }} · {{ t.email }}</p>
              </div>
              <button
                class="btn-secondary text-xs"
                [disabled]="busy() === t.id"
                (click)="toggle(t.id, t.status)"
              >
                {{ t.status === 'active' ? 'Pause' : 'Activate' }}
              </button>
            </li>
          }
        </ul>
        @if (error()) {
          <p class="px-4 pb-4 text-sm text-danger">{{ error() }}</p>
        }
      </article>
      <article class="card overflow-x-auto">
        <h2 class="px-4 pt-4 font-display text-xl">Users</h2>
        <ul class="divide-y p-4 text-sm">
          @for (p of store.allProfiles(); track p.id) {
            <li class="py-3">
              <p class="font-medium">{{ displayName(p) }}</p>
              <p class="text-ink-500">{{ p.email }} · {{ p.role.replaceAll('_', ' ') }}</p>
            </li>
          }
        </ul>
      </article>
    </div>
  `,
})
export class AdminTenantsComponent {
  store = inject(StoreService);
  displayName = displayName;
  busy = signal('');
  error = signal('');

  async toggle(id: string, status: string) {
    this.error.set('');
    this.busy.set(id);
    try {
      await this.store.setTenantStatus(id, status === 'active' ? 'paused' : 'active');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not update tenant');
    } finally {
      this.busy.set('');
    }
  }
}
