import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Programme, ProgrammeInterestPayload } from '../models/programme.model';

@Injectable({ providedIn: 'root' })
export class ProgrammesService {
  private api = inject(ApiService);

  list(): Observable<Programme[]> {
    return this.api.get<Programme[]>('/programmes/');
  }

  registerInterest(
    programmeId: string,
    payload: ProgrammeInterestPayload,
  ): Observable<unknown> {
    return this.api.post(`/programmes/${programmeId}/interest/`, payload);
  }
}
