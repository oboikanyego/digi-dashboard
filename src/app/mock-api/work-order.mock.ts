// src/app/mocks/work-order.mock.ts
import { WorkOrder, WorkOrderRegions, WorkOrderStatus } from '../models/workorders'; // Adjust path as needed

// 1. Explicitly type the arrays to match your specific union types
const REGIONS: WorkOrderRegions[] = ['AMER', 'EMEA', 'APAC'];
const STATUSES: WorkOrderStatus[] = ['New', 'Planned', 'In Progress', 'Blocked', 'Done'];
const OWNERS = ['John Doe', 'Jane Smith', 'Alex Rivera', 'Sam Wilson', 'Emily Davis'];

export function generateWorkOrders(count = 500): WorkOrder[] {
  const now = new Date();
  
  return Array.from({ length: count }, (_, index) => {
    const slaDate = new Date(now.getTime() + (index * 4 * 60 * 60 * 1000));
    const updatedDate = new Date(now.getTime() - (index * 30 * 60 * 1000));

    return {
      id: `WO-2026-${String(index + 1).padStart(5, '0')}`,
      site: `Site-${1000 + index}`,
      region: REGIONS[index % REGIONS.length],     // Fully compliant with WorkOrderRegions
      status: STATUSES[index % STATUSES.length],   // Fully compliant with WorkOrderStatus
      priority: (index % 5) + 1,
      owner: OWNERS[index % OWNERS.length],
      slaDueAt: slaDate.toISOString(),
      lastUpdatedAt: updatedDate.toISOString(),
      progressPct: (index * 7) % 101
    };
  });
}

export const mockWorkOrderDatabase = generateWorkOrders(500);
