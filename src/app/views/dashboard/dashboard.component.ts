import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { SimuladorProyectosDAOService } from '../../services/DAO/simulador-proyectos-dao.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2'
import { CurrencyPipe } from '@angular/common';

declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  //ARRAY TEMPORALES PARA RESULTADOS
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

  //SPAN RESULTADOS
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
    this.separadorMiles();
    this.soloNumerosInput();
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
      $('#volumen').val();
     $('#propuesto').val();
    $('#codigo').val();
     $('#tipoOperacion').val();


  }

  selectLinea() {
    this.simuladorProyecto.getLinea().subscribe(res => {
      this.linea = res;
    });
  }

  separadorMiles() {
    $("#activos, #gastosPreoperativos").on({
      "focus": function (event: { target: any; }) {
        $(event.target).select();
      },
      "keyup": function (event: { target: any; }) {
        $(event.target).val(function (index: any, value: string) {
          return value.replace(/\D/g, "")
            .replace(/([0-9])([0-9]{0})$/, '$1')
            .replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ",");
        });
      }
    });
  }

  soloNumerosInput() {
    //Aceptar solo numericos a input
    $("#activos, #gastosPreoperativos, #volumen").keypress(function (evt: any) {
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      try {
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
          return false;
        } else {
          return true;
        }
      } catch (e) {
        return false;
      }
    });
  }

  loader() {
    //ACTIVA LOADER
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  primeraConsulta(temp: Object) {
    (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = true;
    (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "visible";

    var form = {
      codigo: $('#codigo').val(),
      zona: $('#zona').val(),
      tipoOperacion: (document.getElementById("cryoinfraSpan") as HTMLInputElement).checked,
      volumen: $('#volumen').val(),
      propuesto: $('#propuesto').val()
    };

    console.log(form)

    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
      var propuestos =$('#propuesto').val();
      //var propuestos = Number(currencyPropuestos.replace(/[^0-9\.]+/g, ""));
      var volumen = $('#volumen').val();

      this.spanVolumen = propuestos * volumen;
      this.spanPrecioPiso = (res.resultado.info.precioPiso).toFixed(2);

      (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = false;
      (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "hidden";
    }, (errorServicio) => {

      var volumen = $('#volumen').val();
      if (volumen === "") {
        (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = true;
        (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "hidden"

      } else {
        Swal.fire(
          'Intenta nuevamente',
          'La consulta no fue validada',
          'error'
        );
        (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = true;
        (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "hidden";
        this.spanPrecioPiso = 0;
        this.spanVolumen = 0;
        this.filterForm.get('volumen')?.reset();
        this.filterForm.get('propuesto')?.reset();
        this.filterForm.get('tipoOperacion')?.reset();
      }
    })
  }

  sumar_array(array_numeros: any) {
    var suma = 0;
    array_numeros.forEach(function (numero: any) {
      suma += numero;
    });
    return suma;
  }

  agregarElemento(form: Object) {
    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
      //Agregar valores span Tabla
      this.spanPrecioPiso = (res.resultado.info.precioPiso).toFixed(2);
      this.modeloCodigos['precioPiso'] = this.spanPrecioPiso;

      var propuestos = $('#propuesto').val();
      var volumen =$('#propuesto').val();
      this.modeloCodigos['totalVolumen'] = (propuestos * volumen);

      //Agregar span Ventas totales anuales
      this.arrayVolumen.push(propuestos * volumen);
      var total = this.sumar_array(this.arrayVolumen);
      this.spanVentasTotalesAnuales = total;
      this.arrayTemp['ventasTotalesAnuales'] = this.spanVentasTotalesAnuales;

      if (this.contador == 0) {
        this.arrayTemp['items'] = [];
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
      this.modeloCodigos = {};
      this.spanVolumen = 0;
      this.spanPrecioPiso = 0;
      this.tir = 0;
      this.vpn = 0;
      this.prd = "";
      (document.getElementById("colorTIR") as HTMLCanvasElement).style.background = "#ffffff";
      (document.getElementById("colorVPN") as HTMLCanvasElement).style.background = "#ffffff";
      (document.getElementById("colorPRD") as HTMLCanvasElement).style.background = "#ffffff";

      this.arrayTemp['ventasTotalesAnuales'] = this.spanVentasTotalesAnuales;
    })

    Swal.fire({
      icon: 'success',
      title: 'Dato agregado con exito',
      toast: true,
      position: 'top-right',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    })

  }

  eliminarElemento(index: number) {
    this.arrayTemp.items.splice(index, 1)

    this.arrayCodigos.splice(index, 1);

    this.arrayVolumen.splice(index, 1);
    var total = this.sumar_array(this.arrayVolumen);
    this.spanVentasTotalesAnuales = total;

    this.arrayTemp['ventasTotalesAnuales'] = total;
    this.filterForm.controls['ventasTotalesAnuales'].setValue(total);

    this.tir = 0;
    this.vpn = 0;
    this.prd = "";
    (document.getElementById("colorTIR") as HTMLCanvasElement).style.background = "#ffffff";
    (document.getElementById("colorVPN") as HTMLCanvasElement).style.background = "#ffffff";
    (document.getElementById("colorPRD") as HTMLCanvasElement).style.background = "#ffffff";

    Swal.fire({
      icon: 'success',
      title: 'Dato eliminado con exito',
      toast: true,
      position: 'top-right',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    })
  }


  index: number = 0;
  editarElemento(index: number) {
    (document.getElementById('btnGuardar') as HTMLButtonElement).style.display = "block";
    (document.getElementById('botonAgregar') as HTMLButtonElement).style.display = "none";

    this.index = index;
    $('#btnGuardar').show();

    $('#exampleModal').modal('show');
    $('#linea').val(this.arrayCodigos[index].linea);
    $('#codigo').val(this.arrayCodigos[index].codigo);
    $('#volumen').val(this.arrayCodigos[index].volumen);
    $('#propuesto').val(this.arrayCodigos[index].propuesto);
    $('#cryoinfraSpan').prop('checked', this.arrayCodigos[index].tipoOperacion)

    this.spanPrecioPiso = this.arrayCodigos[index].precioPiso;
    this.spanVolumen = this.arrayCodigos[index].totalVolumen;
  }

  btnEditarElemento(filter: Object) {
    var form = {
      codigo: $('#codigo').val(),
      zona: $('#zona').val(),
      tipoOperacion: $('#cryoinfra').is(":checked"),
      volumen: $('#volumen').val(),
      propuesto: $('#propuesto').val()
    };

    (document.getElementById('btnGuardar') as HTMLButtonElement).style.display = "block";
    (document.getElementById('btnGuardar') as HTMLButtonElement).disabled = true;
    (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "visible";
    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
      this.modeloCodigos = {};
      this.modeloCodigos['codigo'] = $('#codigo').val();
      this.modeloCodigos['linea'] = $('#linea').val();
      this.modeloCodigos['propuesto'] = $('#propuesto').val();
      this.modeloCodigos['tipoOperacion'] = $('#cryoinfra').is(":checked");
      this.modeloCodigos['volumen'] = $('#volumen').val();

      //Agregar valores span Tabla
      this.spanPrecioPiso = (res.resultado.info.precioPiso).toFixed(2);
      this.modeloCodigos['precioPiso'] = Number(res.resultado.info.precioPiso);

      var propuestos = $('#propuesto').val();
      var volumen = $('#volumen').val();
      this.modeloCodigos['totalVolumen'] = (propuestos * volumen);

      //Agregar span Ventas totales anuales
      this.arrayVolumen[this.index] = (propuestos * volumen);
      var total = this.sumar_array(this.arrayVolumen);
      this.spanVentasTotalesAnuales = total;
      this.arrayTemp['ventasTotalesAnuales'] = this.spanVentasTotalesAnuales;

      let itemInfo = {
        info: {
          costoVta: Number(res.resultado.info.costoVta),
          precioPiso: Number(res.resultado.info.precioPiso),
          gastoCryo: Number(res.resultado.info.gastoCryo),
          gastoDist: Number(res.resultado.info.gastoDist),
          depreciacion: Number(res.resultado.info.depreciacion),
          gastoVta: Number(res.resultado.info.gastoVta),
          gastoAdm: Number(res.resultado.info.gastoAdm),
          volumen: Number(this.filterForm.get('volumen')?.value),
          ventaIncrementalAnual: Number(this.spanVolumen),
        },
        infoPropuesto: {
          precioPiso: Number($('#propuesto').val())
        }
      }
    
      this.arrayCodigos[this.index] = this.modeloCodigos;
      this.arrayTemp.items[this.index] = itemInfo;

      this.spanVolumen = 0;
      this.spanPrecioPiso = 0;
      this.tir = 0;
      this.vpn = 0;
      this.prd = "";
      (document.getElementById('btnGuardar') as HTMLButtonElement).disabled = false;
      (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "hidden";

      $('#linea').val('');
    $('#codigo').val('');
    $('#volumen').val('');

    })
    $('#exampleModal').modal('hide');
    Swal.fire({
      icon: 'success',
      title: 'Dato actualizado con exito',
      toast: true,
      position: 'top-right',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    })
  }

  segundaConsulta() {
    this.loader();
    console.log(this.arrayTemp)

    //Agrega array
    this.arrayTemp['aniosDeContrato'] = Number(this.filterForm.get('aniosDeContrato')?.value);
    this.arrayTemp['activos'] = Number(this.filterForm.get('activos')?.value.replace(/[^0-9\.]+/g, ""));
    this.arrayTemp['gastosPreoperativos'] = Number(this.filterForm.get('gastosPreoperativos')?.value.replace(/[^0-9\.]+/g, ""));
    this.arrayTemp['aniosDeContrato'] = Number(this.filterForm.get('aniosDeContrato')?.value);

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

  reiniciar(e: any) {
    //limpiar campos e inicializar portal
    this.filterForm.get('aniosDeContrato')?.reset();
    this.filterForm.get('activos')?.reset();
    this.filterForm.get('gastosPreoperativos')?.reset();

    if (this.arrayCodigos.length != 0) {

      Swal.fire({
        icon: 'info',
        title: 'Los datos fueron reiniciados',
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      })
    }
    this.tir = 0;
    this.vpn = 0;
    this.prd = "";
    (document.getElementById("colorTIR") as HTMLCanvasElement).style.background = "#ffffff";
    (document.getElementById("colorVPN") as HTMLCanvasElement).style.background = "#ffffff";
    (document.getElementById("colorPRD") as HTMLCanvasElement).style.background = "#ffffff";
    this.contador = 0;
    this.arrayCodigos = [];
    this.spanVentasTotalesAnuales = 0;
    this.arrayVolumen = []
  }

  limpiarIndicadores() {
    this.tir = 0;
    this.vpn = 0;
    this.prd = "";
    (document.getElementById("colorTIR") as HTMLCanvasElement).style.background = "#ffffff";
    (document.getElementById("colorVPN") as HTMLCanvasElement).style.background = "#ffffff";
    (document.getElementById("colorPRD") as HTMLCanvasElement).style.background = "#ffffff";
  }

  resetearModal() {
    this.spanPrecioPiso = 0;
    this.spanVolumen = 0;

    var volumen = $('#volumen').val();
    var propuesto = $('#propuesto').val();
    var codigo = $('#codigo').val();
    var linea = $('#linea').val();

    $('#linea').val('');
    $('#codigo').val('');
    $('#volumen').val('');
    $('#propuesto').val('');
    $('#cryoinfra').prop('');

    
    (document.getElementById('botonAgregar') as HTMLImageElement).style.visibility = "visible";

    (document.getElementById('btnGuardar') as HTMLButtonElement).style.display = "none";
    (document.getElementById('botonAgregar') as HTMLButtonElement).style.display = "block";

    if (volumen == "" && propuesto == "" && codigo == "" && linea == "") {
      (document.getElementById("botonAgregar") as HTMLButtonElement).disabled = false;
    } else {
      (document.getElementById("botonAgregar") as HTMLButtonElement).disabled = true;
    }
  }

}