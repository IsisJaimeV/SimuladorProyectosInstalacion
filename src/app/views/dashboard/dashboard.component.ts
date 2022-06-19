import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { SimuladorProyectosDAOService } from '../../services/DAO/simulador-proyectos-dao.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2'
import { CurrencyPipe } from '@angular/common';
import { getDatosExtendidosI } from 'src/app/models/getDatos.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  //CURRENCY INPUT
  formattedAmountInversion: any;
  formattedAmountGastos: any;
  formattedAmountPropuesto: any;
  formattedAmountVolumen: any;
  resultado: any[] = [];

  collapses: string[] = ["collapse46"]

  // SELECT FILTER
  anioArray: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  linea: any[] = [];
  zona: any[] = [];
  codigo: any[] = [];

  //FORM EXTENDIDO
  filterForm = new FormGroup({
    zona: new FormControl(''),
    aniosDeContrato: new FormControl(''),
    gastosPreoperativos: new FormControl(''),
    activos: new FormControl(''),
    linea: new FormControl(''),
    codigo: new FormControl(''),
    propuesto: new FormControl(''),
    volumen: new FormControl(''),
    tipoOperacion: new FormControl(false),
    items: new FormGroup({
      info: new FormGroup({
        costoVta: new FormControl(''),
        precioPiso: new FormControl(''),
        gastoCryo: new FormControl(''),
        gastoDist: new FormControl(''),
        depreciacion: new FormControl(''),
        gastoVta: new FormControl(''),
        gastoAdm: new FormControl(''),
        volumen: new FormControl(''),
        ventaIncrementalAnual: new FormControl(''),
      }),
      infoPropuesto: new FormGroup({
        precioPiso: new FormControl(''),
      })
    }),
    ventasTotalesAnuales: new FormControl(''),
  })

  //RESULTADOS
  arrayTemp: any = {};
  spanVolumen: number = 0;
  spanPrecioPiso: number = 0;
  spanVentasTotalesAnuales: any = 0;
  tir: number = 0;
  vpn: number = 0;
  prd: string = '';

  constructor(private simuladorProyecto: SimuladorProyectosDAOService, private spinner: NgxSpinnerService, private currencyPipe: CurrencyPipe) { }

  ngOnInit(): void {
    this.selectZona();
    this.selectLinea();
  }

  selectZona() {
    this.simuladorProyecto.getZona().subscribe(res => {
      this.zona = res;
    });
  }

  selectCodigo(event: any) {
    let value = event.target.value;
    this.simuladorProyecto.getCodigo(value).subscribe(res => {
      this.codigo = res;
    });

    //limpiar campos
    this.filterForm.get('codigo')?.reset();
    this.filterForm.get('propuesto')?.reset();
    this.filterForm.get('volumen')?.reset();
    this.filterForm.get('tipoOperacion')?.reset(false);
    this.spanPrecioPiso = 0;
    this.spanVolumen = 0;

  }

  selectLinea() {
    this.simuladorProyecto.getLinea().subscribe(res => {
      this.linea = res;
    });
  }

  transformAmountInversion(element: any) {
    this.formattedAmountInversion = this.currencyPipe.transform(this.formattedAmountInversion, '$');
    element.target.value = this.formattedAmountInversion;
  }

  transformAmountGastos(element: any) {
    this.formattedAmountGastos = this.currencyPipe.transform(this.formattedAmountGastos, '$');
    element.target.value = this.formattedAmountGastos;
  }

  transformAmountPropuesto(element: any) {
    this.formattedAmountPropuesto = this.currencyPipe.transform(this.formattedAmountPropuesto, '$');
    element.target.value = this.formattedAmountPropuesto;
  }

  loader() {
    //ACTIVA LOADER
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  getDatos(form: Object) {
    try {
      var currencyPropuestos = this.filterForm.get('propuesto')?.value;
      var propuestos = Number(currencyPropuestos.replace(/[^0-9\.]+/g, ""));
      var volumen = this.filterForm.get('volumen')?.value;

      this.spanVolumen = propuestos * volumen;
      this.spanVentasTotalesAnuales = this.spanVolumen;

      this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
        this.spanPrecioPiso = res.resultado.info.precioPiso;
        this.resultado = [res.resultado.info];

        let temp = {
          aniosDeContrato: Number(this.filterForm.get('aniosDeContrato')?.value),
          activos: Number(this.filterForm.get('activos')?.value.replace(/[^0-9\.]+/g, "")),
          ventasTotalesAnuales: Number(this.spanVentasTotalesAnuales.toFixed(4)),
          gastosPreoperativos: Number(this.filterForm.get('gastosPreoperativos')?.value.replace(/[^0-9\.]+/g, "")),
          items: [
            {
              info: {
                costoVta: Number(res.resultado.info.costoVta.toFixed(4)),
                precioPiso: Number(res.resultado.info.precioPiso.toFixed(4)),
                gastoCryo: Number(res.resultado.info.gastoCryo.toFixed(4)),
                gastoDist: Number(res.resultado.info.gastoDist.toFixed(4)),
                depreciacion: Number(res.resultado.info.depreciacion.toFixed(4)),
                gastoVta: Number(res.resultado.info.gastoVta.toFixed(4)),
                gastoAdm: Number(res.resultado.info.gastoAdm.toFixed(4)),
                volumen: Number(this.filterForm.get('volumen')?.value),
                ventaIncrementalAnual: Number(volumen),
              },
              infoPropuesto: {
                precioPiso: Number(this.spanPrecioPiso.toFixed(4))
              }
            }
          ]
        };

        this.arrayTemp = temp;
        this.filterForm.controls['ventasTotalesAnuales'].setValue(this.spanVentasTotalesAnuales);
        this.filterForm.controls['items'].setValue(temp);

      }, (errorServicio) => {
        Swal.fire(
          'Intenta nuevamente',
          'La consulta no fue validada',
          'error'
        )
      })
    } catch {
      Swal.fire(
        'Consulta no valida',
        'Rellena todos los campos',
        'error'
      )
      this.filterForm.get('volumen')?.reset();
    }
  }

  primeraConsulta(form: Object) {
    this.getDatos(form);
  }

  segundaConsulta() {
    this.loader();

    this.simuladorProyecto.getDatosExtendido(this.arrayTemp).subscribe(resp => {

      if (resp.resultado.tir > 12) {
        (document.getElementById("colorTIR") as HTMLSpanElement).style.background = "#617E41";
        this.tir = resp.resultado.tir;
      } else {
        (document.getElementById("colorTIR") as HTMLSpanElement).style.background = "#922415";
        this.tir = resp.resultado.tir;
      }

      if (resp.resultado.vpn > 0) {
        (document.getElementById("colorVPN") as HTMLSpanElement).style.background = "#617E41"
        this.vpn = resp.resultado.vpn;
      } else {
        (document.getElementById("colorVPN") as HTMLSpanElement).style.background = "#922415"
        this.vpn = resp.resultado.vpn;
      }

      if (Number(resp.resultado.periodoDeRecuperacion.charAt(0)) < Number(this.filterForm.get('aniosDeContrato')?.value)) {
        (document.getElementById("colorPRD") as HTMLSpanElement).style.background = "#617E41"
        this.prd = resp.resultado.periodoDeRecuperacion;
      } else {
        (document.getElementById("colorPRD") as HTMLSpanElement).style.background = "#922415"
        this.prd = resp.resultado.periodoDeRecuperacion;
      }



      console.log(this.arrayTemp)
    })


  }

  agregarCodigo() {
    this.collapses.push("collapse46");
  }

  eliminarCodigo() {
    this.collapses.splice(1);
  }


}
