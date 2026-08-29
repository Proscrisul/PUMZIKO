import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { MpesaStatus, StkPushRequest, StkPushResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private api = inject(ApiService);

  stkPush(body: StkPushRequest): Observable<StkPushResponse> {
    return this.api.post<StkPushResponse>('/giving/mpesa/stk-push/', body);
  }

  status(checkoutRequestId: string): Observable<MpesaStatus> {
    return this.api.get<MpesaStatus>(
      `/giving/mpesa/status/${encodeURIComponent(checkoutRequestId)}/`,
    );
  }
}
