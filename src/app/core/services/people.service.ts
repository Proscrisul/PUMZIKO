import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Person } from '../models/person.model';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private api = inject(ApiService);

  list(): Observable<Person[]> {
    return this.api.get<Person[]>('/people/');
  }
}
