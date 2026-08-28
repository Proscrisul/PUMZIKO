import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

/** Two-step delete: first click arms, second click (within 3s) confirms. */
@Component({
  selector: 'app-confirm-button',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    button { font: inherit; }
    .armed { color: var(--bone); background: var(--ember); border-color: var(--ember); padding-inline: 12px; width: auto; }
  `],
  template: `
    @if (armed()) {
      <button class="icon-btn armed" (click)="fire()" (blur)="disarm()">
        {{ label() }}?
      </button>
    } @else {
      <button class="icon-btn danger" [attr.aria-label]="label()" (click)="arm()">
        <svg lucideIcon="trash-2" [size]="15"></svg>
      </button>
    }
  `,
})
export class ConfirmButtonComponent {
  readonly label = input('Delete');
  readonly confirmed = output<void>();

  readonly armed = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  arm() {
    this.armed.set(true);
    this.timer = setTimeout(() => this.armed.set(false), 3000);
  }
  disarm() { this.armed.set(false); clearTimeout(this.timer); }
  fire() { this.disarm(); this.confirmed.emit(); }
}
