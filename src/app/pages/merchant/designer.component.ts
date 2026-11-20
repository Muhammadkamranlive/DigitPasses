import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PASS_TYPE_META, PassType, WalletPass, emptyPass } from '../../core/models';
import { StoreService } from '../../core/store.service';
import { PassCardComponent } from '../../shared/pass-card.component';

@Component({
  selector: 'app-designer',
  imports: [FormsModule, PassCardComponent],
  template: `
    <div class="mb-6">
      <h1 class="page-title">Pass designer</h1>
      <p class="text-ink-500">Colors, copy, and balances update the live wallet preview.</p>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{{ error() }}</p>
    }

    <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form class="card space-y-4 p-6" (ngSubmit)="save()">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="label">Pass type</label>
            <select class="input" name="type" [(ngModel)]="draft.type">
              @for (key of types; track key) {
                <option [value]="key">{{ meta[key].label }}</option>
              }
            </select>
          </div>
          <div>
            <label class="label">Organization</label>
            <input class="input" name="org" [(ngModel)]="draft.organization_name" />
          </div>
          <div>
            <label class="label">Logo text</label>
            <input class="input" name="logo" [(ngModel)]="draft.logo_text" />
          </div>
          <div>
            <label class="label">Code</label>
            <select class="input" name="code" [(ngModel)]="draft.code_type">
              <option value="QR">QR</option>
              <option value="BAR">Barcode</option>
            </select>
          </div>
          <div>
            <label class="label">Background</label>
            <input class="h-11 w-full" type="color" name="bg" [(ngModel)]="draft.background_color" />
          </div>
          <div>
            <label class="label">Foreground</label>
            <input class="h-11 w-full" type="color" name="fg" [(ngModel)]="draft.foreground_color" />
          </div>
          <div>
            <label class="label">Label</label>
            <input class="h-11 w-full" type="color" name="lb" [(ngModel)]="draft.label_color" />
          </div>
          <div>
            <label class="label">Holder title</label>
            <input class="input" name="title" [(ngModel)]="draft.card_holder_title" />
          </div>
          <div>
            <label class="label">Default holder</label>
            <input class="input" name="holder" [(ngModel)]="draft.card_holder_name" />
          </div>
          @if (draft.type === 'gift_card') {
            <div>
              <label class="label">Balance</label>
              <input class="input" type="number" name="bal" [(ngModel)]="draft.balance" />
            </div>
            <div>
              <label class="label">Currency sign</label>
              <input class="input" name="sign" [(ngModel)]="draft.currency_sign" />
            </div>
          }
          @if (draft.type === 'loyalty_card') {
            <div>
              <label class="label">Program</label>
              <input class="input" name="prog" [(ngModel)]="draft.program_name" />
            </div>
            <div>
              <label class="label">Starting points</label>
              <input class="input" type="number" name="pts" [(ngModel)]="draft.points_balance" />
            </div>
          }
          @if (draft.type === 'punch_card') {
            <div>
              <label class="label">Punch title</label>
              <input class="input" name="pt" [(ngModel)]="draft.punch_title" />
            </div>
            <div>
              <label class="label">Total punches</label>
              <input class="input" type="number" name="tp" [(ngModel)]="draft.total_punches" />
            </div>
          }
          @if (draft.type === 'membership_card') {
            <div class="md:col-span-2">
              <label class="label">Benefits</label>
              <input class="input" name="ben" [(ngModel)]="draft.additional_benefits" />
            </div>
          }
          <div class="md:col-span-2">
            <label class="label">Description</label>
            <textarea class="input min-h-20" name="desc" [(ngModel)]="draft.description"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="label">Terms</label>
            <textarea class="input min-h-20" name="terms" [(ngModel)]="draft.terms_and_conditions"></textarea>
          </div>
        </div>
        <button class="btn-primary" [disabled]="busy()">{{ busy() ? 'Saving…' : 'Save template' }}</button>
      </form>

      <div class="lg:sticky lg:top-24">
        <app-pass-card [pass]="draft" />
      </div>
    </div>
  `,
})
export class DesignerComponent {
  private store = inject(StoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  meta = PASS_TYPE_META;
  types: PassType[] = ['gift_card', 'loyalty_card', 'membership_card', 'punch_card'];
  draft: WalletPass = emptyPass({ organization_name: this.store.tenant()?.name });
  error = signal('');
  busy = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const existing = this.store.passById(id);
      if (existing) this.draft = { ...existing };
    }
  }

  async save() {
    this.error.set('');
    this.busy.set(true);
    try {
      await this.store.saveTemplate(this.draft);
      await this.router.navigateByUrl('/app/passes');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not save');
    } finally {
      this.busy.set(false);
    }
  }
}
