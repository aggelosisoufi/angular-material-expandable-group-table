import { Injectable } from '@angular/core';
import { Employee } from '../models/Employee';

const DEPARTMENTS = [1, 2, 3, 4, 5]; // numeric IDs
const ROLES = ['Software Engineer', 'Designer', 'Product Manager', 'HR Manager', 'Accountant'];
const STATUSES = [1, 2, 3]; // numeric IDs

@Injectable({
  providedIn: 'root'
})
export class DataService {
  generateMockEmployees(count: number = 50): Employee[] {
    const employees: Employee[] = [];
    for (let i = 1; i <= count; i++) {
      employees.push({
        id: crypto.randomUUID(),
        name: `Employee ${i}`,
        department: this.randomFromArray(DEPARTMENTS),
        role: this.randomFromArray(ROLES),
        status: this.randomFromArray(STATUSES),
        email: `employee${i}@company.com`,
        startDate: this.randomDate(new Date(2018, 0, 1), new Date())
      });
    }
    return employees;
  }

  private randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
}
