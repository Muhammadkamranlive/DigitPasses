import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WalletPass } from '../../core/models';
import { StoreService } from '../../core/store.service';
import { PassCardComponent } from '../../shared/pass-card.component';

@Component({
  selector: 'app-issue',
  imports: [FormsModule, PassCardComponent],
  template: `
    <h1 class="page-title">Issue a pass</h1>
    <p class="text-ink-500">Clone a template onto a customer. Gift cards debit the merchant vault.</p>

    <div class="mt-8 grid gap-8 lg:grid-cols-2">
      <form class="card space-y-4 p-6" (ngSubmit)="issue()">
        <div>
          <label class="label">Template</label>
          <select class="input" name="tpl" [(ngModel)]="templateId">
            @for (p of store.templates(); track p.id) {
              <option [value]="p.id">{{ p.logo_text || p.organization_name }} · {{ p.type.replaceAll('_', ' ') }}</option>
            }
          </select>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="label">First name</label>
            <input class="input" name="fn" [(ngModel)]="first" required />
          </div>
          <div>
            <label class="label">Last name</label>
            <input class="input" name="ln" [(ngModel)]="last" required />
          </div>
        </div>
        <div>
          <label class="label">Customer email</label>
          <input class="input" type="email" name="em" [(ngModel)]="email" required />
        </div>
        @if (error()) {
          <p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{{ error() }}</p>
        }
        @if (issued(); as card) {
          <p class="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Issued {{ card.serial_number }} to {{ card.email }}
          </p>
        }
        <button class="btn-primary" [disabled]="!templateId || busy()">
          {{ busy() ? 'Issuing…' : 'Issue pass' }}
        </button>
      </form>
      @if (preview(); as pass) {
        <app-pass-card [pass]="pass" />
      }
    </div>
  `,
})
export class IssueComponent {
  store = inject(StoreService);
  templateId = '';
  first = 'Lena';
  last = 'Brooks';
  email = 'customer@arenascards.com';
  error = signal('');
  issued = signal<WalletPass | null>(null);
  busy = signal(false);

  constructor() {
    const preset = inject(ActivatedRoute).snapshot.queryParamMap.get('template');
    this.templateId = preset || this.store.templates()[0]?.id || '';
  }

  preview(): WalletPass | undefined {
    return this.store.passById(this.templateId);
  }

  async issue() {
    this.error.set('');
    this.busy.set(true);
    try {
      const card = await this.store.assignPass(this.templateId, this.email, this.first, this.last);
      this.issued.set(card);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Issue failed');
    } finally {
      this.busy.set(false);
    }
  }
}
