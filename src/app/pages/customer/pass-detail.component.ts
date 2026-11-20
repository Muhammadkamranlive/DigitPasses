import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../core/store.service';
import { PassCardComponent } from '../../shared/pass-card.component';

@Component({
  selector: 'app-pass-detail',
  imports: [PassCardComponent, RouterLink],
  template: `
    <a routerLink="/wallet" class="text-sm font-semibold text-brand-600">← Back to wallet</a>
    @if (pass(); as p) {
      <div class="mx-auto mt-6 max-w-sm">
        <app-pass-card [pass]="p" />
        <p class="mt-4 text-center text-sm text-ink-500">
          Show this QR at the register. The merchant looks up {{ p.serial_number }}.
        </p>
      </div>
    } @else {
      <p class="mt-8 text-ink-500">Pass not found.</p>
    }
  `,
})
export class PassDetailComponent {
  private store = inject(StoreService);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  pass = () => this.store.passById(this.id);
}
