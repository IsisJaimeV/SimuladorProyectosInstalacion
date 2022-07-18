import { Component, OnInit } from '@angular/core';
import { ResponseI } from 'src/app/models/response.interface';
import { SimuladorProyectosDAOService } from 'src/app/services/DAO/simulador-proyectos-dao.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  user: ResponseI[] = [];
  loading: boolean = false;
  constructor(
    private router: Router,
    private precioPiso: SimuladorProyectosDAOService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.loader();
    this.authUser();
  }

  loader() {
    //ACTIVA LOADER
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  authUser(){
    var path = document.URL;
    
    var correoTemp = path.split('?correo=')[1];
    var tokenTemp = path.split('&token=')[1];

    var correo = correoTemp.split('&token=')[0];
    var token = tokenTemp.split('&origen=')[0];

    var indexCidrado = path.indexOf("&origen=");
    var cifrado = undefined;
    if ( indexCidrado >= 0){
      cifrado = path.split('&origen=')[1];
    }else{
      cifrado = undefined;
    }

    var pathJSON = {
      correo: decodeURIComponent(correo),
      token: decodeURIComponent(token),
      origen: cifrado,
      sourceId: 3
    }

    this.loading = true;
    this.precioPiso.getAuth(pathJSON).subscribe(res => {
      if (res.resultado == true) {
        localStorage.setItem("user", res.correo)
        this.router.navigate(['dashboard']);
      } else {
        this.router.navigate(['not-found']);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.router.navigate(['not-found']);
    })

  }
}
