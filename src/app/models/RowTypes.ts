import { Employee } from "./Employee";

export interface GroupRow {
  isGroup: true;
  totalCountOfSubRows: number;
  groupName: string;
  expanded: boolean;
}

export interface SubGroupRow extends Employee{
  isGroup: false;
  group: GroupRow;
}
