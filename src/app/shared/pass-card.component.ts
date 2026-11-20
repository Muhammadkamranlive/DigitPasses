import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { PASS_TYPE_META, WalletPass } from '../core/models';

@Component({
  selector: 'app-pass-card',
  imports: [QRCodeComponent, DecimalPipe],
  template: `
    <div class="group relative w-full cursor-pointer text-left" (click)="flipped = !flipped; flip.emit()">
      <article
        class="relative min-h-[420px] overflow-hidden rounded-[28px] p-5 shadow-pass transition duration-500"
        [style.background]="pass.background_color"
        [style.color]="pass.foreground_color"
      >
        <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-black/10 blur-2xl"></div>

        @if (!flipped) {
          <div class="relative flex h-full min-h-[380px] flex-col">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.22em]" [style.color]="pass.label_color">
                  {{ pass.logo_text || pass.organization_name }}
                </p>
                <h3 class="mt-1 font-display text-2xl">{{ meta.label }}</h3>
              </div>
              <span class="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                {{ pass.status.replaceAll('_', ' ') }}
              </span>
            </div>

            <div class="my-8 text-center">
              @if (pass.type === 'gift_card') {
                <p class="text-xs uppercase tracking-[0.2em]" [style.color]="pass.label_color">Balance</p>
                <p class="font-display text-5xl font-semibold">{{ pass.currency_sign }}{{ pass.balance | number: '1.2-2' }}</p>
              } @else if (pass.type === 'loyalty_card') {
                <p class="text-xs uppercase tracking-[0.2em]" [style.color]="pass.label_color">{{ pass.program_name || 'Points' }}</p>
                <p class="font-display text-5xl font-semibold">{{ pass.points_balance }}</p>
              } @else if (pass.type === 'punch_card') {
                <p class="text-xs uppercase tracking-[0.2em]" [style.color]="pass.label_color">{{ pass.punch_title || 'Punches' }}</p>
                <p class="font-display text-5xl font-semibold">{{ pass.current_punches }}/{{ pass.total_punches }}</p>
                <div class="mx-auto mt-4 grid max-w-[220px] grid-cols-5 gap-2">
                  @for (n of punchDots(); track n) {
                    <span
                      class="h-7 w-7 rounded-full border-2"
                      [class.bg-white]="n <= pass.current_punches"
                      [class.border-white]="true"
                      [style.opacity]="n <= pass.current_punches ? '1' : '0.35'"
                    ></span>
                  }
                </div>
              } @else {
                <p class="text-xs uppercase tracking-[0.2em]" [style.color]="pass.label_color">Member</p>
                <p class="font-display text-3xl font-semibold">{{ pass.member_name || pass.card_holder_name }}</p>
              }
            </div>

            <div class="text-center text-sm">
              <p [style.color]="pass.label_color">{{ pass.card_holder_title }}</p>
              <p class="font-semibold">{{ pass.card_holder_name }}</p>
            </div>

            <div class="mt-auto flex flex-col items-center pt-4">
              <div class="rounded-2xl bg-white p-2">
                <qrcode [qrdata]="pass.serial_number || 'ARENAS'" [width]="132" [errorCorrectionLevel]="'M'" [margin]="0" />
              </div>
              <p class="mt-3 font-mono text-[11px] tracking-wider" [style.color]="pass.label_color">
                {{ pass.serial_number }}
              </p>
            </div>
          </div>
        } @else {
          <div class="relative space-y-3 text-sm">
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em]" [style.color]="pass.label_color">Pass details</p>
            <dl class="space-y-2">
              <div><dt class="text-xs opacity-70">Organization</dt><dd>{{ pass.organization_name }}</dd></div>
              <div><dt class="text-xs opacity-70">Holder</dt><dd>{{ pass.card_holder_name || '—' }}</dd></div>
              <div><dt class="text-xs opacity-70">Email</dt><dd>{{ pass.email || '—' }}</dd></div>
              <div><dt class="text-xs opacity-70">Expires</dt><dd>{{ pass.expiration_date || 'No expiry' }}</dd></div>
              <div><dt class="text-xs opacity-70">Terms</dt><dd class="leading-relaxed opacity-90">{{ pass.terms_and_conditions }}</dd></div>
            </dl>
            <p class="pt-6 text-center text-xs opacity-70">Tap to flip back</p>
          </div>
        }
      </article>
    </div>
  `,
})
export class PassCardComponent {
  @Input({ required: true }) pass!: WalletPass;
  @Input() flipped = false;
  @Output() flip = new EventEmitter<void>();

  get meta() {
    return PASS_TYPE_META[this.pass.type];
  }

  punchDots(): number[] {
    return Array.from({ length: this.pass.total_punches || 10 }, (_, i) => i + 1);
  }
}
