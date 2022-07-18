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
  tempEditarArray: any = {};
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
  selectedUMSpan: string = '';
  contador: number = 0;
  spanVolumen: number = 0;
  spanPrecioPiso: number = 0;
  spanVentasTotalesAnuales: any = 0;
  tir: number = 0;
  vpn: number = 0;
  prd: string = '';
  correo: any = "";

  //ZONA LOADING
  loading: boolean = false;

  constructor(private simuladorProyecto: SimuladorProyectosDAOService, private spinner: NgxSpinnerService, private currencyPipe: CurrencyPipe, private elementRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.selectZona();
    this.selectLinea();
    this.separadorMiles();
    this.soloNumerosInput();
  }
  selectZona() {
    this.correo = localStorage.getItem("user");

    this.loading = true;
    (document.getElementById("zona") as HTMLSelectElement).disabled = true;
    (document.getElementById("zona") as HTMLSelectElement).style.backgroundColor = "#c0c0c0";
    this.simuladorProyecto.getZona(this.correo).subscribe(res => {
      this.zona = res;
      (document.getElementById("zona") as HTMLSelectElement).disabled = false;
      (document.getElementById("zona") as HTMLSelectElement).style.backgroundColor = "#F2F2F2";
      this.loading = false;
    }, (error) => {
      console.log(error);
      this.loading = false;
    }
    );

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
    this.selectedUMSpan = "";
    this.spanPrecioPiso = 0;
    this.spanVolumen = 0;
    $('#volumen').val('');
    $('#propuesto').val('');
    $('#codigo').val('');
    $('#cryoinfraSpan').prop('checked', false);
  }

  selectedCodigo(event: any) {
    let value = event.target.value;

    var codigo = this.codigo.find(resp => resp.codigo == value)
    try {
      this.selectedUMSpan = codigo.um;
    } catch { }

  }


  selectLinea() {
    this.simuladorProyecto.getLinea().subscribe(res => {
      this.linea = res;
    });

  }

  separadorMiles() {
    $("#activos, #gastosPreoperativos, #propuesto, #volumen").on({
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

    if ($('#linea').val() === '' || $('#codigo').val() === '' || $('#volumen').val() === '' || $('#propuesto').val() === '' || $('#volumen').val() === 0 || $('#propuesto').val() === 0) {
      $('#btnGuardar').prop('disabled', true);
      return;
    }

    $('#btnGuardar').prop('disabled', false);

    (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = true;
    (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "visible";

    // Variables
    const propuesto = Number($('#propuesto').val().replace(/[^0-9\.]+/g, ""));
    const volumen = Number($('#volumen').val().replace(/[^0-9\.]+/g, ""));

    var form = {
      codigo: $('#codigo').val(),
      zona: $('#zona').val(),
      tipoOperacion: $('#cryoinfraSpan').is(":checked"),
      volumen: volumen,
      propuesto: propuesto,
    };

    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {
      const propuestos = Number($('#propuesto').val().replace(/[^0-9\.]+/g, ""));
      const volumen = Number($('#volumen').val().replace(/[^0-9\.]+/g, ""));
      //var propuestos = Number(currencyPropuestos.replace(/[^0-9\.]+/g, ""));

      this.spanVolumen = propuestos * volumen;
      this.spanPrecioPiso = (res.resultado.info.precioPiso).toFixed(2);

      (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = false;
      (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "hidden";

      if (volumen === 0 || volumen === null) {
        (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = true;
        (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "hidden"
      }
    }, (error) => {
      Swal.fire(
        '',
        error.error.resultado,
        'error'
      );

      (document.getElementById('botonAgregar') as HTMLButtonElement).disabled = true;
      (document.getElementById('img-loader') as HTMLImageElement).style.visibility = "hidden";
      this.spanPrecioPiso = 0;
      this.spanVolumen = 0;
      this.filterForm.get('volumen')?.reset();
      this.filterForm.get('tipoOperacion')?.reset();

    })
  }

  primeraConsultaVolumen(temp: Object) { }

  sumar_array(array_numeros: any) {
    var suma = 0;
    array_numeros.forEach(function (numero: any) {
      suma += numero;
    });
    return suma;
  }

  agregarElemento(form: Object) {
    var formGet = {
      codigo: $('#codigo').val(),
      zona: $('#zona').val(),
      tipoOperacion: $('#cryoinfraSpan').is(":checked"),
      volumen: Number($('#volumen').val().replace(/[^0-9\.]+/g, "")),
      propuesto: Number($('#propuesto').val().replace(/[^0-9\.]+/g, ""))
    };

    this.simuladorProyecto.getDatosNormal(formGet).subscribe(res => {
      //Agregar valores span Tabla
      this.spanPrecioPiso = (res.resultado.info.precioPiso).toFixed(2);
      this.modeloCodigos['precioPiso'] = this.spanPrecioPiso;
      this.modeloCodigos['selectedUMSpan'] = this.selectedUMSpan;
      this.modeloCodigos['tipoOperacion'] = $('#cryoinfraSpan').is(":checked");
      this.modeloCodigos['propuesto'] =  $('#propuesto').val();
      this.modeloCodigos['volumen'] =  $('#volumen').val();

      const propuestos = Number($('#propuesto').val().replace(/[^0-9\.]+/g, ""));
      const volumen = Number($('#volumen').val().replace(/[^0-9\.]+/g, ""));

      this.modeloCodigos['totalVolumen'] = (propuestos * volumen);
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
      this.selectedUMSpan = "";
      this.spanPrecioPiso = 0;
      this.tir = 0;
      this.vpn = 0;
      this.prd = "";
      (document.getElementById("colorTIR") as HTMLCanvasElement).style.background = "#ffffff";
      (document.getElementById("colorVPN") as HTMLCanvasElement).style.background = "#ffffff";
      (document.getElementById("colorPRD") as HTMLCanvasElement).style.background = "#ffffff";

      this.arrayTemp['ventasTotalesAnuales'] = this.spanVentasTotalesAnuales;

      $('#botonAgregar').prop('disabled', true);
    }, (error) => {
      Swal.fire(
        '',
        error.error.resultado,
        'error'
      )
      this.spanPrecioPiso = 0;
      this.spanVolumen = 0;
      this.filterForm.get('volumen')?.reset();
      this.filterForm.get('tipoOperacion')?.reset();
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

  indice: number = 0;
  editarElemento(index: any) {
    this.indice = index;

    $('#exampleModal').modal('show');
    $('#btnGuardar').show();
    (document.getElementById('btnGuardar') as HTMLButtonElement).style.display = "block";
    (document.getElementById('botonAgregar') as HTMLButtonElement).style.display = "none";


    $('#linea').val(this.arrayCodigos[index].linea);
    $('#codigo').val(this.arrayCodigos[index].codigo);
    $('#volumen').val(this.arrayCodigos[index].volumen);
    $('#propuesto').val(this.arrayCodigos[index].propuesto);
    $('#cryoinfraSpan').prop('checked', this.arrayCodigos[index].tipoOperacion);
    this.spanPrecioPiso = this.arrayCodigos[index].precioPiso;
    this.spanVolumen = this.arrayCodigos[index].totalVolumen;
    this.selectedUMSpan = this.arrayCodigos[index].selectedUMSpan;

  }

  btnEditarElemento() {
    var form = {
      codigo: $('#codigo').val(),
      zona: $('#zona').val(),
      tipoOperacion: $('#cryoinfraSpan').is(":checked"),
      volumen: Number($('#volumen').val().replace(/[^0-9\.]+/g, "")),
      propuesto: Number($('#propuesto').val().replace(/[^0-9\.]+/g, "")),
    };

    this.primeraConsulta(form);
    this.simuladorProyecto.getDatosNormal(form).subscribe(res => {

      //Agregar valores span de Tabla
      this.tempEditarArray = {};
      this.tempEditarArray['codigo'] = $('#codigo').val();
      this.tempEditarArray['linea'] = $('#linea').val();
      this.tempEditarArray['propuesto'] =  $('#propuesto').val();
      this.tempEditarArray['tipoOperacion'] = $('#cryoinfraSpan').is(":checked");
      this.tempEditarArray['volumen'] =  $('#volumen').val();
      this.tempEditarArray['selectedUMSpan'] = this.selectedUMSpan;
      this.tempEditarArray['precioPiso'] = Number(res.resultado.info.precioPiso).toFixed(2);

      //Agregar span Ventas totales anuales
      var propuestos = Number($('#propuesto').val().replace(/[^0-9\.]+/g, ""));
      var volumen = Number($('#volumen').val().replace(/[^0-9\.]+/g, ""))
      this.tempEditarArray['totalVolumen'] = (propuestos * volumen);

      this.arrayVolumen[this.indice] = (propuestos * volumen);
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
          volumen: Number(volumen),
          ventaIncrementalAnual: propuestos * volumen,
        },
        infoPropuesto: {
          precioPiso: Number(propuestos)
        }
      }

      this.arrayTemp.items[this.indice] = itemInfo;
      this.arrayTemp['ventasTotalesAnuales'] = this.spanVentasTotalesAnuales;

      this.arrayCodigos[this.indice] = this.tempEditarArray;

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

      Swal.fire({
        icon: 'success',
        title: 'Dato actualizado con exito',
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      })
    }, (error) => {
      Swal.fire(
        '',
        error.error.resultado,
        'error'
      )
    })

    $('#exampleModal').modal('hide');
  }

  segundaConsulta() {
    this.loader();
    //Agrega array
    this.arrayTemp['aniosDeContrato'] = Number(this.filterForm.get('aniosDeContrato')?.value);
    this.arrayTemp['activos'] = Number(this.filterForm.get('activos')?.value.replace(/[^0-9\.]+/g, ""));
    this.arrayTemp['gastosPreoperativos'] = Number(this.filterForm.get('gastosPreoperativos')?.value.replace(/[^0-9\.]+/g, ""));

    this.simuladorProyecto.getDatosExtendido(this.arrayTemp).subscribe(resp => {
      if (resp.resultado.tir > 12) {
        (document.getElementById("colorTIR") as HTMLSpanElement).style.background = "#617E41";
        this.tir = (resp.resultado.tir).toFixed(2);
      } else {
        (document.getElementById("colorTIR") as HTMLSpanElement).style.background = "#922415";
        this.tir = (resp.resultado.tir).toFixed(2);
      }

      if (resp.resultado.vpn > 0) {
        (document.getElementById("colorVPN") as HTMLSpanElement).style.background = "#617E41"
        this.vpn = (resp.resultado.vpn).toFixed(2);
      } else {
        (document.getElementById("colorVPN") as HTMLSpanElement).style.background = "#922415"
        this.vpn = (resp.resultado.vpn).toFixed(2);
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

    if ($('#linea').val() === '' && $('#codigo').val('') === '' && $('#volumen').val('') === '' && $('#propuesto').val('') === '') {
      $('#botonAgregar').prop('disabled', true);
    } else {
      $('#botonAgregar').prop('disabled', false);
    }

    const propuesto = Number($('#propuesto').val().replace(/[^0-9\.]+/g, ""));
    const volumen = Number($('#volumen').val().replace(/[^0-9\.]+/g, ""));
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

    if (volumen == null && propuesto == null && codigo == "" && linea == "") {
      (document.getElementById("botonAgregar") as HTMLButtonElement).disabled = false;
    } else {
      (document.getElementById("botonAgregar") as HTMLButtonElement).disabled = true;
    }
  }

}

