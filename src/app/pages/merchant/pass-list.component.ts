import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PASS_TYPE_META } from '../../core/models';
import { StoreService } from '../../core/store.service';
import { PassCardComponent } from '../../shared/pass-card.component';

@Component({
  selector: 'app-pass-list',
  imports: [RouterLink, PassCardComponent],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="page-title">Pass templates</h1>
        <p class="text-ink-500">Design once, issue as many times as you want.</p>
      </div>
      <a routerLink="/app/passes/new" class="btn-primary">Create template</a>
    </div>

    <div class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      @for (pass of store.templates(); track pass.id) {
        <div>
          <app-pass-card [pass]="pass" />
          <div class="mt-3 flex gap-2">
            <a class="btn-secondary flex-1" [routerLink]="['/app/passes', pass.id]">Edit</a>
            <a class="btn-primary flex-1" routerLink="/app/issue" [queryParams]="{ template: pass.id }">Issue</a>
            <button class="btn-danger" (click)="remove(pass.id)">Delete</button>
          </div>
          <p class="mt-2 text-center text-xs text-ink-500">{{ meta[pass.type].label }}</p>
        </div>
      } @empty {
        <p class="text-ink-500">No templates yet. Create a gift card to get started.</p>
      }
    </div>
  `,
})
export class PassListComponent {
  store = inject(StoreService);
  meta = PASS_TYPE_META;

  async remove(id: string) {
    await this.store.deleteTemplate(id);
  }
}
