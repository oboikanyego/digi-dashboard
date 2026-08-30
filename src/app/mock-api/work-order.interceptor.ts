import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, mergeMap, of, throwError, timer } from 'rxjs';
import { mockWorkOrderDatabase } from './work-order.mock';
import { WorkOrder } from '../models/workorders';

const UPDATE_FAILURE_ID = 'WO-2026-00013';

export const workOrderMockInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  const method = req.method;

  if (url.endsWith('/api/work-orders') && method === 'GET') {
    return of(new HttpResponse({ status: 200, body: mockWorkOrderDatabase })).pipe(delay(400));
  }

  if (url.includes('/api/work-orders/') && method === 'GET') {
    const id = url.split('/').pop();
    const item = mockWorkOrderDatabase.find((workOrder) => workOrder.id === id);

    if (item) {
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(200));
    }

    return timer(200).pipe(
      mergeMap(() =>
        throwError(() =>
          new HttpErrorResponse({ status: 404, statusText: 'Not Found', url }),
        ),
      ),
    );
  }

  if (url.includes('/api/work-orders/') && method === 'PUT') {
    const id = url.split('/').pop();

    if (id === UPDATE_FAILURE_ID) {
      return timer(500).pipe(
        mergeMap(() =>
          throwError(() =>
            new HttpErrorResponse({
              status: 500,
              statusText: 'Simulated update failure',
              url,
              error: { message: 'This work order intentionally fails to demonstrate error handling.' },
            }),
          ),
        ),
      );
    }

    const index = mockWorkOrderDatabase.findIndex((workOrder) => workOrder.id === id);

    if (index !== -1) {
      const updatedData = req.body as Partial<WorkOrder>;
      mockWorkOrderDatabase[index] = {
        ...mockWorkOrderDatabase[index],
        ...updatedData,
        lastUpdatedAt: new Date().toISOString(),
      };

      return of(
        new HttpResponse({ status: 200, body: mockWorkOrderDatabase[index] }),
      ).pipe(delay(500));
    }

    return timer(300).pipe(
      mergeMap(() =>
        throwError(() =>
          new HttpErrorResponse({ status: 404, statusText: 'Not Found', url }),
        ),
      ),
    );
  }

  return next(req);
};
