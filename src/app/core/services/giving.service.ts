import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GivingInfo } from '../models/giving.model';

@Injectable({ providedIn: 'root' })
export class GivingService {
  private api = inject(ApiService);

  info(): Observable<GivingInfo> {
    return this.api.get<GivingInfo>('/giving/');
  }
}
