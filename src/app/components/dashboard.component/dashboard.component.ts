import { Component, inject, OnInit,computed, signal } from '@angular/core';
import { ColDef, themeAlpine } from 'ag-grid-community';
import { WorkOrder } from '../../models/workorders';
import { WorkOrderService } from '../../services/work-order.service';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { themeQuartz, iconSetQuartzLight } from 'ag-grid-community';

// to use myTheme in an application, pass it to the theme grid option
export const myTheme = themeQuartz.withParams({
  browserColorScheme: 'light',
});

@Component({
  imports: [CommonModule, AgGridAngular],
  selector: 'app-dashboard.component',
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private workOrderService = inject(WorkOrderService);
  // workOrders: WorkOrder[] = [];
  // loading = true;
  readonly theme = myTheme;
  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 25, 50];
  // 1. Column settings mapping to your data structure
  public columnDefs: ColDef<WorkOrder>[] = [
    { field: 'id', headerName: 'Work Order ID', checkboxSelection: true },
    { field: 'site', headerName: 'Site Location', filter: true },
    { field: 'region', headerName: 'Region', width: 120 },
    { field: 'status', headerName: 'Status', sortable: true },
    { field: 'priority', headerName: 'Priority Level', width: 140 },
    { field: 'owner', headerName: 'Assigned Owner' },
    {
      field: 'progressPct',
      headerName: 'Progress',
      valueFormatter: (params) => (params.value !== undefined ? `${params.value}%` : '0%'),
    },
    {
      field: 'slaDueAt',
      headerName: 'SLA Due Date',
      valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : ''),
    },
  ];
readonly workOrders = signal<WorkOrder[]>([]);
readonly loading = signal(false);
readonly error = signal<string | null>(null);
readonly filterText = signal('');
readonly selectedWorkOrder = signal<WorkOrder | null>(null);

readonly filteredWorkOrders = computed(() => {
  const query = this.filterText().trim().toLowerCase();

  if (!query) {
    return this.workOrders();
  }

  return this.workOrders().filter((order) =>
    [
      order.id,
      order.site,
      order.region,
      order.status,
      order.owner,
      order.priority,
    ].some((value) => String(value).toLowerCase().includes(query)),
  );
});

readonly overdueCount = computed(() => {
  const now = Date.now();

  return this.workOrders().filter(
    (order) =>
      order.status !== 'Done' &&
      new Date(order.slaDueAt).getTime() < now,
  ).length;
});

  // // 2. Feed your schema array directly into rowData
  // readonly rowData = signal<WorkOrder[]>([]);

  // 3. Global grid behaviors for professional B2B tables
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
  };

ngOnInit(): void {
  this.loadWorkOrders();
}

private loadWorkOrders(): void {
  this.loading.set(true);
  this.error.set(null);

  this.workOrderService.getWorkOrders().subscribe({
    next: (workOrders) => {
      this.workOrders.set(workOrders);
      this.loading.set(false);
    },
    error: () => {
      this.error.set('Unable to load work orders.');
      this.loading.set(false);
    },
  });
}
}
