import { Injectable } from '@angular/core';
import { Department } from '../models/Department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  // This methods provides a list of departments. In a real application, this data might come from an API or database.
  getDepartments(): Department[] {
    return [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Marketing' },
      { id: 3, name: 'Sales' },
      { id: 4, name: 'HR' },
      { id: 5, name: 'Finance' }
    ];
  }
}
