import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SimuladorProyectosDAOService } from '../../services/DAO/simulador-proyectos-dao.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  //preueba
  number1: number = 0;

  // SELECT FILTER
  linea: any[] = [];
  zona: any[] = [];
  codigo: any[] = [];
  
  //FORM
  filterForm = new FormGroup({
    zona: new FormControl('', Validators.required)
  })
  constructor(private simuladorProyecto: SimuladorProyectosDAOService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.selectZona();
  }

  selectZona() {
    this.simuladorProyecto.getZona().subscribe(res => {
      this.zona = res;
    });
  }
}
