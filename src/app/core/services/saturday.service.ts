import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SaturdayPart, WeekNote } from '../models/saturday.model';

@Injectable({ providedIn: 'root' })
export class SaturdayService {
  private api = inject(ApiService);

  parts(): Observable<SaturdayPart[]> {
    return this.api.get<SaturdayPart[]>('/saturday/');
  }

  thisWeek(): Observable<WeekNote> {
    return this.api.get<WeekNote>('/saturday/this-week/');
  }
}
