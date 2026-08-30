import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrder } from '../../models/workorders';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const workOrderServiceMock = {
    getWorkOrders: () => of([]),
    updateWorkOrder: (id: string, updates: Partial<WorkOrder>) =>
      of({ id, ...updates } as WorkOrder),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: WorkOrderService, useValue: workOrderServiceMock },
      ],
    })
      .overrideComponent(DashboardComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes overdue work orders and excludes completed orders', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const future = new Date(Date.now() + 60_000).toISOString();

    component.workOrders.set([
      createWorkOrder('WO-1', 'In Progress', past),
      createWorkOrder('WO-2', 'Done', past),
      createWorkOrder('WO-3', 'Blocked', future),
    ]);

    expect(component.overdueCount()).toBe(1);
  });
});

function createWorkOrder(
  id: string,
  status: WorkOrder['status'],
  slaDueAt: string,
): WorkOrder {
  return {
    id,
    site: 'Site-1000',
    region: 'EMEA',
    status,
    priority: 2,
    owner: 'Jane Smith',
    slaDueAt,
    lastUpdatedAt: new Date().toISOString(),
    progressPct: 50,
  };
}
