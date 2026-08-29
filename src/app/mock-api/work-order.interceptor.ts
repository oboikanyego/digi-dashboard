// src/app/mocks/work-order.interceptor.ts
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { mockWorkOrderDatabase } from './work-order.mock';
import { WorkOrder } from '../models/workorders'; // Adjust path as needed

export const workOrderMockInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  const method = req.method;

  // 1. GET ALL: /api/work-orders
  if (url.endsWith('/api/work-orders') && method === 'GET') {
    return of(new HttpResponse({ status: 200, body: mockWorkOrderDatabase })).pipe(delay(400));
  }

  // 2. GET SINGLE: /api/work-orders/WO-2026-00001
  if (url.includes('/api/work-orders/') && method === 'GET') {
    const id = url.split('/').pop();
    const item = mockWorkOrderDatabase.find(wo => wo.id === id);
    
    if (item) {
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(200));
    }
    return of(new HttpResponse({ status: 404, body: { message: 'Not Found' } }));
  }

  // 3. PUT (Update): /api/work-orders/WO-2026-00001
  if (url.includes('/api/work-orders/') && method === 'PUT') {
    const id = url.split('/').pop();
    const index = mockWorkOrderDatabase.findIndex(wo => wo.id === id);
    
    if (index !== -1) {
      const updatedData = req.body as Partial<WorkOrder>;
      mockWorkOrderDatabase[index] = { 
        ...mockWorkOrderDatabase[index], 
        ...updatedData, 
        lastUpdatedAt: new Date().toISOString() 
      };
      return of(new HttpResponse({ status: 200, body: mockWorkOrderDatabase[index] })).pipe(delay(300));
    }
  }

  // Fallback to real HTTP handler if it's not a match
  return next(req);
};
