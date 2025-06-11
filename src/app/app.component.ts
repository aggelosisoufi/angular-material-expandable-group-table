import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Employee } from './models/Employee';
import { Department } from './models/Department';
import { Status } from './models/Status';
import { GroupRow, SubGroupRow } from './models/RowTypes';

import { DataService } from './services/data.service';
import { DepartmentService } from './services/department.service';
import { StatusService } from './services/status.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { CommonModule } from '@angular/common';
import { Sort, MatSortModule } from '@angular/material/sort';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { debounceTime, Subject } from 'rxjs';


// Group by various options -> DONE
// Editable fields for each employee
// Add a new employee
// Delete an employee
// Save the changes to the employees
// Filtering the sub rows by each column -> DONE
// Sorting by various options -> DONE
// The group rows should have an counter of the number of employees in that group -> DONE
// The table should be responsive and adapt to the screen size -> DONE
// Checkboxes for selecting employees and a button to delete them
// Optimization with trackBy -> DONE


type groupByFields = 'department' | 'status' | 'role';
type RowType = GroupRow | SubGroupRow;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormField,
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSortModule,
    FormsModule,
    MatInputModule ,
    ClickStopPropagationDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  filterChanged$ = new Subject<void>();
  
  title = 'Employee Management System';
  employees: Employee[] = [];
  departments: Department[] = [];
  statuses: Status[] = [];
  departmentMap: Map<number, string> = new Map();
  statusMap: Map<number, [string, string]> = new Map();

  dataSource: MatTableDataSource<RowType> = new MatTableDataSource();

  displayedColumns: string[] = ['name', 'department', 'role', 'status', 'actions'];
  groupByOptions = [
    { value: 'department', viewValue: 'Department' },
    { value: 'role', viewValue: 'Role' },
    { value: 'status', viewValue: 'Status' },
  ];
  selectedGroupBy: groupByFields = 'role';

  constructor(private dataService: DataService,
    private departmentService: DepartmentService,
    private statusService: StatusService) {}

  ngOnInit() {
    // Retrieve data from the services. First the employees, then the departments and statuses.
    this.employees = this.dataService.generateMockEmployees(1000);
    this.departments = this.departmentService.getDepartments();
    this.statuses = this.statusService.getStatuses();

    this.departmentMap = new Map(this.departments.map(dep => [dep.id, dep.name]));
    this.statusMap = new Map(this.statuses.map(status => [status.id, [status.label, status.color]]));

    this.filterChanged$.pipe(
      debounceTime(300) // 300ms delay after typing
    ).subscribe(() => this.applyColumnFilters());

    this.dataSource.data = this.groupBy(this.selectedGroupBy, this.employees);
  }

  isGroupRow = (index: number, row: RowType): row is GroupRow => row.isGroup === true;

  isSubRow = (index: number, row: RowType): row is SubGroupRow => row.isGroup === false;

  /** User can chanage the grouping dynamically via a drop down */
  onGroupByChange(field: groupByFields) {
    this.dataSource.data = this.groupBy(field, this.dataSource.data.filter(row => !row.isGroup));
  }

  /** Sort results withing groups by  Name or Department or Role*/
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const newData: RowType[] = [];
    let i = 0;

    while (i < this.dataSource.data.length) {
      const row = this.dataSource.data[i];

      if (row.isGroup) {
        const groupRow = row;
        const subRows: SubGroupRow[] = [];

        // Gather all rows in this group
        i++;
        while (i < this.dataSource.data.length && !this.dataSource.data[i].isGroup) {
          subRows.push(this.dataSource.data[i] as SubGroupRow);
          i++;
        }

        // Sort sub-rows within this group
        subRows.sort((a, b) => {
          const isAsc = sort.direction === 'asc';
          const aVal = this.getDisplayValue(a, sort.active);
          const bVal = this.getDisplayValue(b, sort.active);
          return this.compare(aVal, bVal, isAsc);
        });

        newData.push(groupRow, ...subRows);
      } else {
        // Shouldn’t happen, but we handle it gracefully
        newData.push(row);
        i++;
      }
    }

    this.dataSource.data = newData;
  }

  trackByRow(index: number, row: RowType): string | number {
    if (row.isGroup) {
      // For a group row, use a combination of groupName (or a unique group ID if you have one)
      // and a prefix to ensure it's unique from sub-row IDs.
      return `group-${row.groupName}`;
    } else {
      // For a sub-row (employee), use its unique 'id'.
      return row.id;
    }
  }

  columnFilters: Record<'name' | 'department' | 'role' | 'status', string> = {
    name: '',
    department: '',
    role: '',
    status: ''
  };


  applyColumnFilters() {
    const filtered = this.employees.filter(emp => {
      return (!this.columnFilters.name || emp.name.toLowerCase().includes(this.columnFilters.name.toLowerCase())) && 
        (!this.columnFilters.department || this.departmentMap.get(emp.department)?.toLowerCase().includes(this.columnFilters.department.toLowerCase())) &&
        (!this.columnFilters.role || emp.role.toLowerCase().includes(this.columnFilters.role.toLowerCase())) &&
        (!this.columnFilters.status || this.statusMap.get(emp.status)?.[0].toLowerCase().includes(this.columnFilters.status.toLowerCase()));
    });

    this.dataSource.data = this.groupBy(this.selectedGroupBy, filtered);
  }

  /** Group rows by a specific field and return a list of Group rows followed by their Sub Group rows */
  private groupBy(field: groupByFields, employees: Employee[]): RowType[] {
    const groupMap = new Map<string, Employee[]>();

    // Group employees by the specified field's value
    employees.forEach(employee => {
      const groupKey = String(employee[field]);
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)?.push(employee);
    });

    // Return the grouped data as an array of RowType
    return Array.from(groupMap.entries()).flatMap(([rawKey, employees]) => {
      let groupLabel = rawKey;

      if (field === 'department') {
        groupLabel = this.departmentMap.get(+rawKey) || 'Unknown Department';
      } else if (field === 'status') {
        groupLabel = this.statusMap.get(+rawKey)?.[0] || 'Unknown Status';
    }

      const groupRow: GroupRow = {
        isGroup: true,
        totalCountOfSubRows: employees.length,
        groupName: groupLabel,
        expanded: false
      };

      const subGroupRows: SubGroupRow[] = employees.map(employee => ({
        ...employee,
        isGroup: false,
        group: groupRow
      }));

      return [groupRow, ...subGroupRows];
    });
  }

  private getDisplayValue(row: SubGroupRow, field: string): string {
    switch (field) {
      case 'department':
        return this.departmentMap.get(row.department) || '';
      case 'status':
        return this.statusMap.get(row.status)?.[0] || '';
      case 'name':
      case 'role':
        return row[field as keyof Employee] as string;
      default:
        return '';
    }
  }

  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : a > b ? 1 : 0) * (isAsc ? 1 : -1);
  }

  ngOnDestroy() {
    this.filterChanged$.next();
    this.filterChanged$.complete();
  }

}
