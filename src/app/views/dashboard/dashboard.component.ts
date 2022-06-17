import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SimuladorProyectosDAOService } from '../../services/DAO/simulador-proyectos-dao.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2'
import { CommonModule, CurrencyPipe} from '@angular/common';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  //CURRENCY INPUT
  formattedAmount: any;
  amount: any;


  // SELECT FILTER
  anioArray: number[] = [1,2,3,4,5,6,7,8,9,10]
  linea: any[] = [];
  zona: any[] = [];
  codigo: any[] = [];
  
  //FORM
  filterForm = new FormGroup({
    zona: new FormControl(''),
    linea: new FormControl(''),
    codigo: new FormControl(''),
    anio: new FormControl(''),
    gastos: new FormControl(''),
    activos: new FormControl(''),
  })

  //RESULTADOS
  ventasTotalesAnuales: any = 0;
  tir: number = 0;
  vpn : number = 0;
  prd : number = 0;

  constructor(private simuladorProyecto: SimuladorProyectosDAOService, private spinner: NgxSpinnerService, private currencyPipe : CurrencyPipe) { }

  ngOnInit(): void {
    this.selectLinea();
    this.selectZona();
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
  }

  selectLinea() {
    this.simuladorProyecto.getLinea().subscribe(res => {
      this.linea = res;
    });
  }



  transformAmount(element: any){
    this.formattedAmount = this.currencyPipe.transform(this.formattedAmount, '$');
    element.target.value = this.formattedAmount;
}
}
