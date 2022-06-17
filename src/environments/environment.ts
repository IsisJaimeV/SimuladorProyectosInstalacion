// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {
  production: true,
  env: 'dev',
  ambiente: 'dev',
  endp_precioPiso: 'https://infralink.azure-api.net/api/AnalisisPrecioInfra',
  endp_linea: 'https://infralink.azure-api.net/api/linea',
  endp_zona: 'https://infralink.azure-api.net/api/zona',
  endp_codigo: 'https://infralink.azure-api.net/api/web/codigo/'
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
