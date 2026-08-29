import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { workOrderMockInterceptor } from './mock-api/work-order.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        workOrderMockInterceptor // 2. Make sure this is the function name, NOT 'mockWorkOrderDatabase'
      ])
    )
  ]
};
