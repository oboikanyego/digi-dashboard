import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';
import {
  WorkOrder,
  WorkOrderStatus,
} from '../../models/workorders';
import { WorkOrderService } from '../../services/work-order.service';

export const myTheme = themeQuartz.withParams({
  browserColorScheme: 'light',
});

@Component({
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
  selector: 'app-dashboard.component',
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly workOrderService = inject(WorkOrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly theme = myTheme;
  readonly pagination = true;
  readonly paginationPageSize = 10;
  readonly paginationPageSizeSelector = [10, 25, 50];
  readonly statuses: WorkOrderStatus[] = [
    'New',
    'Planned',
    'In Progress',
    'Blocked',
    'Done',
  ];

  readonly workOrders = signal<WorkOrder[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filterText = signal('');
  readonly selectedWorkOrder = signal<WorkOrder | null>(null);
  readonly updating = signal(false);
  readonly updateError = signal<string | null>(null);
  readonly updateSuccess = signal<string | null>(null);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusForm = new FormGroup({
    status: new FormControl<WorkOrderStatus>('New', { nonNullable: true }),
    note: new FormControl('', { nonNullable: true }),
  });

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

  readonly columnDefs: ColDef<WorkOrder>[] = [
    { field: 'id', headerName: 'Work Order ID', checkboxSelection: true },
    { field: 'site', headerName: 'Site Location', filter: true },
    { field: 'region', headerName: 'Region', width: 120 },
    { field: 'status', headerName: 'Status', sortable: true },
    { field: 'priority', headerName: 'Priority Level', width: 140 },
    { field: 'owner', headerName: 'Assigned Owner' },
    {
      field: 'progressPct',
      headerName: 'Progress',
      valueFormatter: (params) =>
        params.value !== undefined ? `${params.value}%` : '0%',
    },
    {
      field: 'slaDueAt',
      headerName: 'SLA Due Date',
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
  ];

  readonly defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
  };

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.filterText.set(value));

    this.loadWorkOrders();
  }

  selectWorkOrder(order: WorkOrder | null): void {
    this.selectedWorkOrder.set(order);
    this.updateError.set(null);
    this.updateSuccess.set(null);

    if (order) {
      this.statusForm.setValue({ status: order.status, note: '' });
    }
  }

  submitStatusUpdate(): void {
    const selected = this.selectedWorkOrder();

    if (!selected || this.statusForm.invalid || this.updating()) {
      return;
    }

    this.updating.set(true);
    this.updateError.set(null);
    this.updateSuccess.set(null);

    const { status } = this.statusForm.getRawValue();

    this.workOrderService
      .updateWorkOrder(selected.id, { status })
      .pipe(finalize(() => this.updating.set(false)))
      .subscribe({
        next: (updatedWorkOrder) => {
          this.workOrders.update((orders) =>
            orders.map((order) =>
              order.id === updatedWorkOrder.id ? updatedWorkOrder : order,
            ),
          );
          this.selectedWorkOrder.set(updatedWorkOrder);
          this.updateSuccess.set(`${updatedWorkOrder.id} updated successfully.`);
        },
        error: () => {
          this.updateError.set(
            'Unable to update this work order. Please try again.',
          );
        },
      });
  }

  private loadWorkOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.workOrderService
      .getWorkOrders()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (workOrders) => this.workOrders.set(workOrders),
        error: () => this.error.set('Unable to load work orders.'),
      });
  }
}
