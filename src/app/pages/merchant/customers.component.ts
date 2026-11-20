import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'app-customers',
  imports: [RouterLink],
  template: `
    <div class="flex items-end justify-between">
      <div>
        <h1 class="page-title">Customers</h1>
        <p class="text-ink-500">People who hold a pass from {{ store.tenant()?.name }}.</p>
      </div>
      <a routerLink="/app/issue" class="btn-primary">Issue to someone new</a>
    </div>
    <div class="card mt-6 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-brand-50 text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Passes</th>
          </tr>
        </thead>
        <tbody>
          @for (c of store.customers(); track c.id) {
            <tr class="border-t">
              <td class="px-4 py-3 font-medium">{{ c.first_name }} {{ c.last_name }}</td>
              <td class="px-4 py-3">{{ c.email }}</td>
              <td class="px-4 py-3">{{ passCount(c.email) }}</td>
            </tr>
          } @empty {
            <tr><td class="px-4 py-8 text-ink-500" colspan="3">No customers yet.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CustomersComponent {
  store = inject(StoreService);

  passCount(email: string): number {
    return this.store.issuedPasses().filter((p) => p.email === email).length;
  }
}
