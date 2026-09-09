import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, of } from 'rxjs';

import { VisitService } from '../../../core/services/visit.service';
import { SiteService } from '../../../core/services/site.service';
import { RestBarComponent } from '../../../shared/components/rest-bar/rest-bar.component';
import { connectPageMeta } from '../page-seo';

@Component({
  selector: 'app-visit',
  imports: [LucideDynamicIcon, RestBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    /* Tighter block padding so a short page doesn't leave a void above the footer. */
    .section { padding-block: clamp(40px, 6vw, 72px); }
    .head { padding: 56px 24px 8px; text-align: center; }
    .head h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
    .head app-rest-bar { max-width: 300px; margin: 22px auto 0; }

    /* Centre every content block so wide screens don't leave it hugging the left. */
    .card {
      border: 1px solid var(--hairline); border-radius: 2px; padding: 24px;
      max-width: 60ch; margin-inline: auto;
    }
    .pending { border-color: var(--ember); }
    .pending p { color: var(--ink-70); }

    dl { display: grid; grid-template-columns: 150px 1fr; gap: 12px 20px; margin: 0; }
    dt { color: var(--ink-55); font-size: 0.9rem; }
    dd { margin: 0; }

    .photo { display: block; margin: 24px auto 0; max-width: 60ch; width: 100%; border: 1px solid var(--hairline); }
    .map { display: block; margin: 24px auto 0; width: 100%; max-width: 60ch; aspect-ratio: 16 / 9; border: 0; }

    .first { margin: 40px auto 0; max-width: 60ch; }
    .first h2 { font-size: 1.5rem; margin-bottom: 10px; }
    .first p { color: var(--ink-70); }
    .not-signed { margin: 16px auto 0; max-width: 60ch; color: var(--ink-55); font-size: 0.95rem; }
  `],
  template: `
    <header class="head">
      <h1>Visit</h1>
      <app-rest-bar />
    </header>

    <section class="section">
      <div class="wrap">
        @if (visit(); as v) {
          @if (!v.venue_confirmed) {
            <div class="card pending">
              <p class="eyebrow">{{ v.neighbourhood }}</p>
              <p style="margin-top:10px">{{ v.venue_pending_message }}</p>
              @if (whatsappHref(); as url) {
                <a [href]="url" target="_blank" rel="noopener" class="btn" style="margin-top:16px">
                  <svg lucideIcon="message-circle" [size]="18"></svg>
                  Message us for the location
                </a>
              }
            </div>
          } @else {
            <div class="card">
              <dl>
                @if (v.address) { <dt>Address</dt><dd>{{ v.address }}</dd> }
                @if (v.building_name) { <dt>Building</dt><dd>{{ v.building_name }}</dd> }
                @if (v.floor) { <dt>Floor</dt><dd>{{ v.floor }}</dd> }
                @if (v.matatu_route) { <dt>Matatu</dt><dd>{{ v.matatu_route }}<br />{{ v.matatu_stop }}</dd> }
                @if (v.parking_notes) { <dt>Parking</dt><dd>{{ v.parking_notes }}</dd> }
              </dl>
            </div>

            @if (v.entrance_photo) {
              <img class="photo" [src]="v.entrance_photo" alt="The entrance, from the street" />
            }
            @if (safeMap(); as mapUrl) {
              <iframe class="map" [src]="mapUrl" title="Map" loading="lazy"></iframe>
            }
          }

          @if (v.first_sixty_seconds) {
            <div class="first">
              <h2>The first minute after you arrive</h2>
              <p>{{ v.first_sixty_seconds }}</p>
            </div>
          }
          @if (v.venue_not_signed_note) {
            <p class="not-signed">{{ v.venue_not_signed_note }}</p>
          }
        }
      </div>
    </section>
  `,
})
export class VisitComponent {
  private visitService = inject(VisitService);
  private siteService = inject(SiteService);
  private sanitizer = inject(DomSanitizer);

  readonly meta = connectPageMeta('visit', {
    title: 'Visit',
    description:
      'Where we meet in Kilimani, how to get there, and what happens in the ' +
      'first minute after you arrive.',
    path: '/visit',
  });

  readonly visit = toSignal(
    this.visitService.info().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  private readonly site = toSignal(
    this.siteService.settings().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly safeMap = computed<SafeResourceUrl | null>(() => {
    const url = this.visit()?.map_embed_url;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  readonly whatsappHref = () => {
    const digits = (this.site()?.whatsapp_number ?? '').replace(/[^\d]/g, '');
    return digits
      ? `https://wa.me/${digits}?text=${encodeURIComponent('Hi Pumziko — please send me the location and a photo of the door.')}`
      : null;
  };
}
