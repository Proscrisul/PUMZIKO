import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .preview {
      width: 96px; height: 96px; object-fit: cover;
      border: 1px solid var(--hairline); border-radius: 3px; background: #fff;
    }
    .row { display: flex; align-items: center; gap: 12px; }
    input[type=file] { font: inherit; }
  `],
  template: `
    <div class="row">
      @if (previewUrl(); as url) {
        <img class="preview" [src]="url" alt="" />
      }
      <div>
        <input type="file" accept="image/*" (change)="onChange($event)" />
        @if (previewUrl() && current()) {
          <button type="button" class="btn-ghost btn-sm" style="margin-top:8px" (click)="clear()">
            Remove
          </button>
        }
      </div>
    </div>
  `,
})
export class ImagePickerComponent {
  readonly current = input<string | null>(null);
  readonly picked = output<File | null>();

  private localPreview = signal<string | null>(null);

  previewUrl = () => this.localPreview() ?? this.current();

  onChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file) {
      this.localPreview.set(URL.createObjectURL(file));
      this.picked.emit(file);
    }
  }

  clear(): void {
    this.localPreview.set(null);
    this.picked.emit(null);
  }
}
