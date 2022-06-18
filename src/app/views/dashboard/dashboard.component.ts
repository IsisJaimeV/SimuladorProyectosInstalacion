import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { SimuladorProyectosDAOService } from '../../services/DAO/simulador-proyectos-dao.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2'
import { CurrencyPipe } from '@angular/common';

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
    items: new FormControl([])
  })

  //RESULTADOS
  spanVolumen: number = 0;
  spanPrecioPiso: number = 0;
  spanVentasTotalesAnuales: any = 0;
  tir: number = 0;
  vpn: number = 0;
  prd: number = 0;

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

  getDatos(form: Object) {
    try {
      var currencyPropuestos = this.filterForm.get('propuesto')?.value;
      var propuestos = Number(currencyPropuestos.replace(/[^0-9\.]+/g, ""));
      var volumen = this.filterForm.get('volumen')?.value;

      this.spanVolumen = propuestos * volumen;
      this.spanVentasTotalesAnuales = this.spanVolumen;

      this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
        this.spanPrecioPiso = res.resultado.info.precioPiso;
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

  segundaConsulta(form: Object) {
    //ACTIVA LOADER
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);

    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
      console.log(res);
      this.spanPrecioPiso = res.resultado.info.precioPiso;
    })

    var zona = this.filterForm.get('zona')?.value;

    var aniosDeContrato = this.filterForm.get('aniosDeContrato')?.value;

    var currencyActivos = this.filterForm.get('activos')?.value;
    var activos = Number(currencyActivos.replace(/[^0-9\.]+/g, ""));

    var currencyGastos = this.filterForm.get('gastosPreoperativos')?.value;
    var gastosPreoperativos = Number(currencyGastos.replace(/[^0-9\.]+/g, ""));

    var linea = this.filterForm.get('linea')?.value;

    var codigo = this.filterForm.get('codigo')?.value;

    var currencyPropuestos = this.filterForm.get('propuesto')?.value;
    var propuestos = Number(currencyPropuestos.replace(/[^0-9\.]+/g, ""));

    var volumen = this.filterForm.get('volumen')?.value;

    var cryo = this.filterForm.get('tipoOperacion')?.value;
  }

  agregarCodigo() {
    this.collapses.push("collapse46");
  }

  eliminarCodigo() {
    this.collapses.splice(1);
  }


}
