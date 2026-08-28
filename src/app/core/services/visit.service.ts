import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { VisitInfo } from '../models/visit.model';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private api = inject(ApiService);

  info(): Observable<VisitInfo> {
    return this.api.get<VisitInfo>('/visit/');
  }
}
