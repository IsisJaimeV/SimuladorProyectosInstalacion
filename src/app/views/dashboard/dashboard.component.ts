import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { SimuladorProyectosDAOService } from '../../services/DAO/simulador-proyectos-dao.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2'
import { CurrencyPipe } from '@angular/common';
import { getDatosExtendidosI } from 'src/app/models/getDatos.interface';

declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  disabledInput = true;

  arrayCodigos: any[] = []
  modeloCodigos: any = {};
  arrayPrecioPiso: any[] = []
  arrayVolumen: any[] = [];
  arrayTotalVolumen: any[] = [];

  //CURRENCY INPUT
  formattedAmountInversion: any;
  formattedAmountGastos: any;
  formattedAmountPropuesto: any;
  formattedAmountVolumen: any;
  resultado: any[] = [];


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
  contador: number = 0;
  spanVolumen: number = 0;
  spanPrecioPiso: number = 0;
  spanVentasTotalesAnuales: any = 0;
  tir: number = 0;
  vpn: number = 0;
  prd: string = '';

  constructor(private simuladorProyecto: SimuladorProyectosDAOService, private spinner: NgxSpinnerService, private currencyPipe: CurrencyPipe, private elementRef: ElementRef, private renderer: Renderer2) { }

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
    (document.getElementById("codigo") as HTMLSelectElement).disabled = true;
    (document.getElementById("codigo") as HTMLSelectElement).style.backgroundColor = "#c0c0c0";
    this.simuladorProyecto.getCodigo(value).subscribe(res => {
      this.codigo = res;
      (document.getElementById("codigo") as HTMLSelectElement).disabled = false;
      (document.getElementById("codigo") as HTMLSelectElement).style.backgroundColor = "#F2F2F2";
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

  sumar_array(array_numeros: any) {
    var suma = 0;
    array_numeros.forEach(function (numero: any) {
      suma += numero;
    });
    return suma;
  }

  primeraConsulta(form: Object) {
    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
      var currencyPropuestos = this.filterForm.get('propuesto')?.value;
      var propuestos = Number(currencyPropuestos.replace(/[^0-9\.]+/g, ""));
      var volumen = this.filterForm.get('volumen')?.value;

      this.spanVolumen = propuestos * volumen;
      this.spanPrecioPiso = Number(res.resultado.info.precioPiso);
    }, (errorServicio) => {
      console.log(errorServicio);
      Swal.fire(
        'Intenta nuevamente',
        'La consulta no fue validada',
        'error'
      )
    })
  }


  agregarElemento(form: Object) {
    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
      //Agregar valores span Tabla
      this.spanPrecioPiso = (res.resultado.info.precioPiso).toFixed(2);
      this.modeloCodigos['precioPiso'] = this.spanPrecioPiso;

      var propuestos = Number(this.filterForm.get('propuesto')?.value);
      var volumen = Number(this.filterForm.get('volumen')?.value);
      this.modeloCodigos['totalVolumen'] = (propuestos * volumen);

      //Agregar span Ventas totales anuales
      this.arrayVolumen.push(propuestos * volumen);
      var total = this.sumar_array(this.arrayVolumen);
      this.spanVentasTotalesAnuales = total;
      this.arrayTemp['ventasTotalesAnuales'] = this.spanVentasTotalesAnuales;

      //Agrega array
     
      this.arrayTemp['aniosDeContrato'] = Number(this.filterForm.get('aniosDeContrato')?.value);
      this.arrayTemp['activos'] = Number(this.filterForm.get('activos')?.value.replace(/[^0-9\.]+/g, ""));
      this.arrayTemp['gastosPreoperativos'] = Number(this.filterForm.get('gastosPreoperativos')?.value.replace(/[^0-9\.]+/g, ""));
      
      if(this.contador == 0){
      this.arrayTemp['items']=[];
      }

      let itemInfo = {
        info: {
          costoVta: Number(res.resultado.info.costoVta),
          precioPiso: Number(res.resultado.info.precioPiso),
          gastoCryo: Number(res.resultado.info.gastoCryo),
          gastoDist: Number(res.resultado.info.gastoDist),
          depreciacion: Number(res.resultado.info.depreciacion),
          gastoVta: Number(res.resultado.info.gastoVta),
          gastoAdm: Number(res.resultado.info.gastoAdm),
          volumen: Number(volumen),
          ventaIncrementalAnual: Number(this.spanVolumen),
        },
        infoPropuesto: {
          precioPiso: Number(this.filterForm.get('propuesto')?.value)
        }
      }

      this.arrayTemp.items.push(itemInfo);
      this.contador++;

      this.arrayCodigos.push(this.modeloCodigos);
      console.log(this.arrayCodigos)
      this.modeloCodigos = {};
      this.spanVolumen = 0;
      this.spanPrecioPiso = 0;

      this.arrayTemp['ventasTotalesAnuales'] = this.spanVentasTotalesAnuales;
    })

  }

  eliminarElemento(index: number) {
    console.log(index)
    this.arrayTemp.items.splice(index, 1)

    this.arrayCodigos.splice(index, 1);
    console.log(this.arrayCodigos);

    this.arrayVolumen.splice(index, 1);
    var total = this.sumar_array(this.arrayVolumen);
    this.spanVentasTotalesAnuales = total;

    this.filterForm.controls['ventasTotalesAnuales'].setValue(this.spanVentasTotalesAnuales);
  }

  segundaConsulta() {
    this.loader();
    this.contador = 0;
    console.log(this.arrayTemp)

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
    })
  }


}