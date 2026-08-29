import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkOrder } from '../models/workorders';

@Service()
export class WorkOrderService {
  private http = inject(HttpClient);
  private apiUrl = '/api/work-orders';

  getWorkOrders(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(this.apiUrl);
  }

  getWorkOrderById(id: string): Observable<WorkOrder> {
    return this.http.get<WorkOrder>(`${this.apiUrl}/${id}`);
  }

  updateWorkOrder(id: string, updates: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.apiUrl}/${id}`, updates);
  }
}
