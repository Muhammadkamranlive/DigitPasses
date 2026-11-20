import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  template: `
    <section class="mx-auto max-w-xl px-4 py-16">
      <div class="card p-8">
        <h1 class="font-display text-4xl">Request a demo</h1>
        <p class="mt-2 text-sm text-ink-500">This portfolio form stores nothing remotely — it confirms the flow.</p>
        @if (sent) {
          <p class="mt-8 rounded-2xl bg-brand-50 p-4 text-brand-800">Thanks {{ name }}. We'll be in touch at {{ email }}.</p>
        } @else {
          <form class="mt-8 space-y-4" (ngSubmit)="sent = true">
            <div>
              <label class="label">Name</label>
              <input class="input" name="name" [(ngModel)]="name" required />
            </div>
            <div>
              <label class="label">Work email</label>
              <input class="input" type="email" name="email" [(ngModel)]="email" required />
            </div>
            <div>
              <label class="label">Company</label>
              <input class="input" name="company" [(ngModel)]="company" />
            </div>
            <div>
              <label class="label">What do you want to issue?</label>
              <textarea class="input min-h-28" name="note" [(ngModel)]="note"></textarea>
            </div>
            <button class="btn-primary w-full">Send</button>
          </form>
        }
      </div>
    </section>
  `,
})
export class ContactComponent {
  name = '';
  email = '';
  company = '';
  note = '';
  sent = false;
}
