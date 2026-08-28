import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EnquiryPayload } from '../models/enquiry.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private api = inject(ApiService);

  sendEnquiry(payload: EnquiryPayload): Observable<unknown> {
    return this.api.post('/contact/enquiries/', payload);
  }
}
