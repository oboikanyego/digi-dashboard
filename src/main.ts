import { bootstrapApplication } from '@angular/platform-browser';
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  RowSelectionModule,
  TextFilterModule,
} from 'ag-grid-community';

import { appConfig } from './app/app.config';
import { App } from './app/app';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowSelectionModule,
  TextFilterModule,
]);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
