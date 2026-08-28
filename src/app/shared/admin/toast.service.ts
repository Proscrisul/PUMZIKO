import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'ok' | 'error';
}

@Injectable({ providedIn: 'root' })
export class AdminToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  show(text: string, kind: 'ok' | 'error' = 'ok'): void {
    const id = ++this.seq;
    this.toasts.update(t => [...t, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), 3200);
  }

  ok(text = 'Saved') { this.show(text, 'ok'); }
  error(text = 'Something went wrong') { this.show(text, 'error'); }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
