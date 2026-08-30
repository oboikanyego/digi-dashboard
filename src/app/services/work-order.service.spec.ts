import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { WorkOrderService } from './work-order.service';
import { WorkOrder } from '../models/workorders';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let httpTesting: HttpTestingController;

  const workOrder: WorkOrder = {
    id: 'WO-2026-00001',
    site: 'Site-1000',
    region: 'EMEA',
    status: 'New',
    priority: 1,
    owner: 'Jane Smith',
    slaDueAt: new Date(Date.now() + 60_000).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    progressPct: 10,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkOrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(WorkOrderService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads work orders successfully', async () => {
    const responsePromise = firstValueFrom(service.getWorkOrders());

    const request = httpTesting.expectOne('/api/work-orders');
    expect(request.request.method).toBe('GET');
    request.flush([workOrder]);

    await expect(responsePromise).resolves.toEqual([workOrder]);
  });

  it('surfaces an HTTP failure when loading work orders fails', async () => {
    const responsePromise = firstValueFrom(service.getWorkOrders());

    const request = httpTesting.expectOne('/api/work-orders');
    request.flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    await expect(responsePromise).rejects.toMatchObject({ status: 500 });
  });
});
