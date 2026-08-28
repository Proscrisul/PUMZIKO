import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

/**
 * Persistent WhatsApp click-to-chat, on every page. In Nairobi this is the
 * contact method — a form is not a substitute (brief §06, non-negotiable).
 * Renders nothing until the church WhatsApp number is configured.
 */
@Component({
  selector: 'app-whatsapp-button',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    a {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 60;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--ember);
      color: var(--bone);
      font-weight: 600;
      font-size: 0.9375rem;
      padding: 13px 18px;
      border-radius: 999px;
      text-decoration: none;
      box-shadow: 0 6px 20px rgba(26, 21, 18, 0.28);
      transition: filter 0.15s ease, transform 0.15s ease;
    }
    a:hover { filter: brightness(1.06); }
    a:active { transform: translateY(1px); }
    .label { display: none; }
    @media (min-width: 640px) { .label { display: inline; } }
  `],
  template: `
    @if (href(); as url) {
      <a [href]="url" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">
        <svg lucideIcon="message-circle" [size]="20"></svg>
        <span class="label">Message us</span>
      </a>
    }
  `,
})
export class WhatsappButtonComponent {
  readonly number = input<string>('');
  readonly text = input<string>('Hi Pumziko — ');

  protected readonly href = computed(() => {
    const digits = this.number().replace(/[^\d]/g, '');
    if (!digits) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(this.text())}`;
  });
}
