// LA CORRECCIÓN DEFINITIVA: Importamos Zone.js al principio de todo
// para que el navegador pueda "escuchar" los eventos.
import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));