export interface WorkOrder {
  id: string;
  site: string;
  region: WorkOrderRegions;
  status: WorkOrderStatus;
  priority: number;
  owner: string;
  slaDueAt: string;
  lastUpdatedAt: string;
  progressPct: number;
}
export type WorkOrderStatus = 'New' | 'Planned' | 'In Progress' | 'Blocked' | 'Done';
export type WorkOrderRegions = 'AMER' | 'EMEA' | 'APAC';
