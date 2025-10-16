import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

// Este archivo combina la configuración principal (appConfig) 
// con la configuración específica para el servidor.
export const config: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering()
  ]
});