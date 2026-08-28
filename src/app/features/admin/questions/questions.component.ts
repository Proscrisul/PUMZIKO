import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminQuestion } from '../../../core/models/admin.model';
import { AdminToastService } from '../../../shared/admin/toast.service';
import { ConfirmButtonComponent } from '../../../shared/admin/confirm-button.component';

@Component({
  selector: 'app-admin-questions',
  imports: [LucideDynamicIcon, ConfirmButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .card { border: 1px solid var(--hairline); border-radius: 3px; padding: 18px; background: #fff; margin-bottom: 14px; }
    .card .top { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
    .card .top input.q { flex: 1; font-weight: 600; }
    .card textarea { min-height: 90px; }
    .meta { display: flex; gap: 16px; align-items: center; margin-top: 10px; }
    .meta input[type=number] { width: 64px; }
  `],
  template: `
    <h1 class="admin-h1">The six answers</h1>
    <p class="admin-sub">Phrased in the visitor's words. Keep the answers blunt.</p>

    @for (q of items(); track q.id) {
      <div class="card">
        <div class="top">
          <input class="input q" [value]="q.question_text"
                 (change)="patch(q, {question_text: $any($event.target).value})" />
          <app-confirm-button (confirmed)="remove(q)" />
        </div>
        <textarea class="textarea" [value]="q.answer_text"
                  (change)="patch(q, {answer_text: $any($event.target).value})"></textarea>
        <div class="meta">
          <label class="admin-label" style="margin:0">Order
            <input class="input" type="number" [value]="q.ordering"
                   (change)="patch(q, {ordering: +$any($event.target).value})" />
          </label>
          <label class="admin-check">
            <input type="checkbox" [checked]="q.is_published"
                   (change)="patch(q, {is_published: $any($event.target).checked})" /> Published
          </label>
        </div>
      </div>
    }

    <button class="btn-ghost btn-sm" (click)="add()">
      <svg lucideIcon="plus" [size]="15"></svg> Add question
    </button>
  `,
})
export class QuestionsComponent {
  private admin = inject(AdminApiService);
  private toast = inject(AdminToastService);
  readonly items = signal<AdminQuestion[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.admin.questions.list().subscribe(list =>
      this.items.set([...list].sort((a, b) => a.ordering - b.ordering)),
    );
  }

  patch(row: AdminQuestion, body: Partial<AdminQuestion>): void {
    this.admin.questions.update(row.id, body).subscribe({
      next: () => { this.toast.ok('Updated'); this.load(); },
      error: () => this.toast.error(),
    });
  }

  add(): void {
    this.admin.questions.create({
      question_text: 'New question', answer_text: '', ordering: this.items().length + 1,
    }).subscribe({ next: () => this.load(), error: () => this.toast.error() });
  }

  remove(row: AdminQuestion): void {
    this.admin.questions.remove(row.id).subscribe({ next: () => this.load(), error: () => this.toast.error() });
  }
}
