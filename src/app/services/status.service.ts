import { Injectable } from '@angular/core';
import { Status } from '../models/Status';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  // This methods provides a list of statuses. In a real application, this data might come from an API or database.
  getStatuses(): Status[] {
    return [
      { id: 1, label: 'Active', color: 'green' },
      { id: 2, label: 'On Leave', color: 'orange' },
      { id: 3, label: 'Resigned', color: 'red' }
    ];
  }
}
