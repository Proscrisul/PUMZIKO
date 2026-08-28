import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Question } from '../models/expectation.model';

@Injectable({ providedIn: 'root' })
export class ExpectationsService {
  private api = inject(ApiService);

  questions(): Observable<Question[]> {
    return this.api.get<Question[]>('/expectations/');
  }
}
