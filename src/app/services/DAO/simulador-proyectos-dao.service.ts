import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

import { getDatosExtendidosI } from 'src/app/models/getDatos.interface';

@Injectable({
  providedIn: 'root'
})
export class SimuladorProyectosDAOService {

  constructor(private http: HttpClient) { }

  getLinea(): Observable<any> {
    const headers = {
      'Ocp-Apim-Subscription-Key': 'd788385e2e7349388f922cd2158dbf7c'
    }
    return this.http.get(environment.endp_linea, { 'headers': headers })
  }

  getCodigo(linea: any): Observable<any> {
    const headers = {
      'Ocp-Apim-Subscription-Key': 'd788385e2e7349388f922cd2158dbf7c'
    }
    return this.http.get(environment.endp_codigo + linea, { 'headers': headers })
  }

  getZona(): Observable<any> {
    const headers = {
      'Ocp-Apim-Subscription-Key': 'd788385e2e7349388f922cd2158dbf7c'
    }
    return this.http.get(environment.endp_zona, { 'headers': headers })
  }

  eliminarVacios(json: any) {
    for (var clave in json) {
      if (typeof json[clave] == 'string') {
        if (json[clave] == 'Vacío' || json[clave] == '') {
          delete json[clave]
        }
      } else if (typeof json[clave] == 'object') {
        this.eliminarVacios(json[clave])
      }
    }
  }

  transformAmount(element: any) {
    var amount = Number(element.replace(/[^0-9\.]+/g, ""));
    return amount
  }

  transformNumber(element: string){
    var amount = Number(element);
    return amount
  }

  getDatosNormal(form: Object): Observable<any> {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Ocp-Apim-Subscription-Key': 'd788385e2e7349388f922cd2158dbf7c'
    }

    const body = JSON.stringify(form);
    const json = JSON.parse(body);
    var key = "items"
    delete json[key]
    delete json.activos, json.aniosDeContrato, json.gastosPreoperativos, json.linea, json.ventasTotalesAnuales;
    json.propuesto = this.transformAmount(json.propuesto)

    this.eliminarVacios(json);
    console.log(json)
    return this.http.post(environment.endp_precioPiso, json, { 'headers': headers })
  }

  getDatosExtendido(form: any[]): Observable<any> {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Ocp-Apim-Subscription-Key': 'd788385e2e7349388f922cd2158dbf7c'
    }

    const body = JSON.stringify(form);
    const json = JSON.parse(body);

    return this.http.post(environment.endp_analisis, json, { 'headers': headers })
  }
}
