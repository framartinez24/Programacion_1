import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Activa Zone.js para toda la aplicación (cliente y servidor)
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configura las rutas y el cliente HTTP
    provideRouter(routes),
    provideHttpClient(withFetch())
  ]
};