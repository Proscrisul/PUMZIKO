import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-save-bar',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-savebar">
      <button class="btn btn-sm" [disabled]="!dirty() || saving()" (click)="save.emit()">
        @if (saving()) {
          <svg lucideIcon="loader-circle" [size]="16" class="spin"></svg> Saving…
        } @else {
          <svg lucideIcon="save" [size]="16"></svg> Save changes
        }
      </button>
      @if (dirty() && !saving()) {
        <button class="btn-ghost btn-sm" (click)="discard.emit()">Discard</button>
      }
      @if (!dirty() && !saving()) {
        <span class="admin-help">No unsaved changes</span>
      }
    </div>
  `,
  styles: [`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`],
})
export class SaveBarComponent {
  readonly dirty = input(false);
  readonly saving = input(false);
  readonly save = output<void>();
  readonly discard = output<void>();
}
